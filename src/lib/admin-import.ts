import { adminRole } from "@/constants/auth";
import { importMaxBytes, importMessages } from "@/constants/admin";
import type { Prisma } from "@/generated/prisma/client";
import { chargeSeats } from "@/lib/admin-distributor-mutations";
import { recordAudit } from "@/lib/audit";
import { fullName, questionBankLabel } from "@/lib/helpers/admin";
import { nameKey } from "@/lib/helpers/admin-distributors";
import { importCountLabel, importSummary, parseBank, promptKey, readImportTable, validateQuestionRecords, validateUserRecords } from "@/lib/helpers/admin-import";
import { prisma } from "@/lib/prisma";
import type { ImportPreview, ImportResult, ImportQuestionRow, ImportRequest, ImportSeatUse, ImportUserRow, ParsedImportRequest, QuestionBankKey } from "@/types/admin";

async function userContext(tx: Prisma.TransactionClient, emails: string[]) {
  const [users, courses, companies] = await Promise.all([
    tx.user.findMany({ where: { email: { in: emails } }, select: { email: true, firstName: true, lastName: true, role: true } }),
    tx.course.findMany({ where: { active: false }, select: { code: true } }),
    tx.organization.findMany({ select: { id: true, name: true, distributorId: true } })
  ]);
  return {
    existing: new Map(users.map((user) => [user.email, user.role === adminRole ? "an admin" : fullName(user)])),
    inactiveCourses: new Set(courses.map((course) => course.code)),
    companies: new Map(companies.map((company) => [nameKey(company.name), { id: company.id, distributorId: company.distributorId }]))
  }
}

async function questionContext(tx: Prisma.TransactionClient, bank: QuestionBankKey) {
  const where = { locale: bank.locale, courseLocale: { course: { code: bank.code } } };
  const [questions, { _max }] = await Promise.all([
    tx.question.findMany({ where, select: { prompt: true } }),
    tx.question.aggregate({ where, _max: { sortOrder: true } })
  ]);
  return { locale: bank.locale, existingPrompts: new Set(questions.map((question) => promptKey(question.prompt))), nextSortOrder: (_max.sortOrder ?? 0) + 1 }
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

function seatCounts(rows: ImportUserRow[]) {
  const counts = new Map<number, number>();
  for (const row of rows) {
    const id = row.company?.distributorId;
    if (id) counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return counts;
}

async function seatUses(rows: ImportUserRow[]): Promise<ImportSeatUse[]> {
  const counts = seatCounts(rows);
  if (counts.size === 0) return [];
  const distributors = await prisma.distributor.findMany({ where: { id: { in: [...counts.keys()] } }, orderBy: { name: "asc" }, select: { id: true, name: true, seatBalance: true } });
  return distributors.map((distributor) => ({ distributor: distributor.name, used: counts.get(distributor.id) ?? 0, balance: distributor.seatBalance }));
}

export async function previewImportRows(request: ImportRequest): Promise<ImportPreview> {
  const parsed = await parseRequest(prisma, request);
  if ("fileError" in parsed) return { fileError: parsed.fileError, rows: [], ready: 0 }
  if (parsed.kind === "questions") return { rows: parsed.result.preview, ready: parsed.result.rows.length }
  return { rows: parsed.result.preview, ready: parsed.result.rows.length, missingCompanies: parsed.result.missingCompanies, seats: await seatUses(parsed.result.rows) }
}

async function insertUsers(tx: Prisma.TransactionClient, rows: ImportUserRow[]) {
  const courseLocales = await tx.courseLocale.findMany({ select: { courseId: true, locale: true, course: { select: { code: true } } } });
  const courseIdOf = (row: ImportUserRow) => courseLocales.find((entry) => entry.course.code === row.course && entry.locale === row.locale)?.courseId;
  if (rows.some((row) => courseIdOf(row) === undefined)) throw new Error("A course locale is missing");

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
      organizationId: row.company?.id ?? null,
      seatDistributorId: row.company?.distributorId ?? null
    }))
  });
  return chargeSeats(tx, seatCounts(rows));
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
      const seats = await insertUsers(tx, parsed.result.rows);
      await recordAudit(tx, { adminId, action: "usersImported", entity: "import", entityLabel, details: [summary, ...seats].join("; ") });
      return { ok: true, kind: "users", message: `Imported ${importCountLabel("users", rows.length)}.` }
    }

    await insertQuestions(tx, parsed.bank, parsed.result.rows);
    await recordAudit(tx, { adminId, action: "questionsImported", entity: "import", entityLabel, details: `${summary} in ${questionBankLabel(parsed.bank.code, parsed.bank.locale)}` });
    return { ok: true, kind: "questions", message: `Imported ${importCountLabel("questions", rows.length)} into ${questionBankLabel(parsed.bank.code, parsed.bank.locale)}.` }
  }, { timeout: 60_000 });
}
