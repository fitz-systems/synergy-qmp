import { adminRole } from "@/constants/auth";
import { importMaxBytes, importMessages } from "@/constants/admin";
import type { Prisma } from "@/generated/prisma/client";
import { recordAudit } from "@/lib/audit";
import { fullName, questionBankLabel } from "@/lib/helpers/admin";
import { importSummary, parseBank, promptKey, readImportTable, validateQuestionRecords, validateUserRecords } from "@/lib/helpers/admin-import";
import { prisma } from "@/lib/prisma";
import type { ImportPreview, ImportResult, ImportQuestionRow, ImportRequest, ImportUserRow, ParsedImportRequest, QuestionBankKey } from "@/types/admin";

async function userContext(tx: Prisma.TransactionClient, emails: string[]) {
  const [users, courses] = await Promise.all([
    tx.user.findMany({ where: { email: { in: emails } }, select: { email: true, firstName: true, lastName: true, role: true } }),
    tx.course.findMany({ where: { active: false }, select: { code: true } })
  ]);
  return {
    existing: new Map(users.map((user) => [user.email, user.role === adminRole ? "an admin" : fullName(user)])),
    inactiveCourses: new Set(courses.map((course) => course.code))
  }
}

async function questionContext(tx: Prisma.TransactionClient, bank: QuestionBankKey) {
  const where = { locale: bank.locale, courseLocale: { course: { code: bank.code } } };
  const [questions, { _max }] = await Promise.all([
    tx.question.findMany({ where, select: { prompt: true } }),
    tx.question.aggregate({ where, _max: { sortOrder: true } })
  ]);
  return { existingPrompts: new Set(questions.map((question) => promptKey(question.prompt))), nextSortOrder: (_max.sortOrder ?? 0) + 1 }
}

async function parseRequest(tx: Prisma.TransactionClient, request: ImportRequest): Promise<ParsedImportRequest | { fileError: string }> {
  if (typeof request.text !== "string" || request.text.length === 0) return { fileError: importMessages.empty }
  if (new TextEncoder().encode(request.text).length > importMaxBytes) return { fileError: importMessages.tooLarge }

  if (request.kind === "users") {
    const table = readImportTable("users", request.text);
    if (table.fileError) return { fileError: table.fileError }
    const emails = table.records.map((record) => record.cells.email.toLowerCase()).filter(Boolean);
    return { kind: "users", result: validateUserRecords(table.records, await userContext(tx, emails)) }
  }

  const bank = parseBank(request.bank);
  if (!bank) return { fileError: importMessages.noBank }
  const table = readImportTable("questions", request.text);
  if (table.fileError) return { fileError: table.fileError }
  return { kind: "questions", bank, result: validateQuestionRecords(table.records, await questionContext(tx, bank)) }
}

export async function previewImportRows(request: ImportRequest): Promise<ImportPreview> {
  const parsed = await parseRequest(prisma, request);
  if ("fileError" in parsed) return { fileError: parsed.fileError, rows: [], ready: 0 }
  return { rows: parsed.result.preview, ready: parsed.result.rows.length }
}

async function organizationIds(tx: Prisma.TransactionClient, companies: string[]) {
  const names = [...new Map(companies.filter(Boolean).map((name) => [name.toLowerCase(), name])).values()];
  if (names.length === 0) return new Map<string, number>();
  const find = () => tx.organization.findMany({ where: { OR: names.map((name) => ({ name: { equals: name, mode: "insensitive" as const } })) }, select: { id: true, name: true } });
  const existing = await find();
  const known = new Set(existing.map((organization) => organization.name.toLowerCase()));
  const missing = names.filter((name) => !known.has(name.toLowerCase()));
  if (missing.length > 0) await tx.organization.createMany({ data: missing.map((name) => ({ name })), skipDuplicates: true });
  const all = missing.length > 0 ? await find() : existing;
  return new Map(all.map((organization) => [organization.name.toLowerCase(), organization.id]));
}

async function insertUsers(tx: Prisma.TransactionClient, rows: ImportUserRow[]) {
  const courseLocales = await tx.courseLocale.findMany({ select: { courseId: true, locale: true, course: { select: { code: true } } } });
  const courseIdOf = (row: ImportUserRow) => courseLocales.find((entry) => entry.course.code === row.course && entry.locale === row.locale)?.courseId;
  if (rows.some((row) => courseIdOf(row) === undefined)) throw new Error("A course locale is missing");

  const organizations = await organizationIds(tx, rows.map((row) => row.company));
  const users = await tx.user.createManyAndReturn({
    data: rows.map((row) => ({ name: `${row.firstName} ${row.lastName}`, email: row.email, firstName: row.firstName, lastName: row.lastName, preferredLocale: row.locale })),
    select: { id: true, email: true }
  });
  const userIds = new Map(users.map((user) => [user.email, user.id]));
  await tx.enrollment.createMany({
    data: rows.map((row) => ({
      userId: userIds.get(row.email)!,
      courseId: courseIdOf(row)!,
      locale: row.locale,
      organizationId: row.company ? organizations.get(row.company.toLowerCase()) ?? null : null
    }))
  });
}

async function insertQuestions(tx: Prisma.TransactionClient, bank: QuestionBankKey, rows: ImportQuestionRow[]) {
  const courseLocale = await tx.courseLocale.findFirstOrThrow({ where: { locale: bank.locale, course: { code: bank.code } }, select: { courseId: true } });
  await tx.question.createMany({
    data: rows.map(({ values }) => ({
      courseId: courseLocale.courseId,
      locale: bank.locale,
      type: values.type,
      prompt: values.prompt,
      options: values.options,
      correctIndex: values.correctIndex,
      explanation: values.explanation || null,
      sortOrder: Number(values.sortOrder),
      active: true
    }))
  });
}

export async function importRows(adminId: number, request: ImportRequest, expected: number): Promise<ImportResult> {
  return prisma.$transaction(async (tx) => {
    const parsed = await parseRequest(tx, request);
    if ("fileError" in parsed) return { ok: false, error: parsed.fileError }
    const { rows, preview } = parsed.result;
    if (rows.length === 0) return { ok: false, error: importMessages.nothingReady }
    if (rows.length !== expected) return { ok: false, error: importMessages.changed }
    const summary = importSummary(rows.length, preview.length - rows.length);
    const entityLabel = request.fileName.slice(0, 200) || "CSV file";

    if (parsed.kind === "users") {
      await insertUsers(tx, parsed.result.rows);
      await recordAudit(tx, { adminId, action: "usersImported", entity: "import", entityLabel, details: summary });
      return { ok: true, kind: "users", message: `Imported ${rows.length} ${rows.length === 1 ? "user" : "users"}.` }
    }

    await insertQuestions(tx, parsed.bank, parsed.result.rows);
    await recordAudit(tx, { adminId, action: "questionsImported", entity: "import", entityLabel, details: `${summary} in ${questionBankLabel(parsed.bank.code, parsed.bank.locale)}` });
    return { ok: true, kind: "questions", message: `Imported ${rows.length} ${rows.length === 1 ? "question" : "questions"} into ${questionBankLabel(parsed.bank.code, parsed.bank.locale)}.` }
  }, { timeout: 60_000 });
}
