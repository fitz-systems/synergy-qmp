import { del, head } from "@vercel/blob";
import { adminCourseSelect, adminQuestionSelect, courseActionMessages, courseMaterialContentType, questionActionMessages } from "@/constants/admin";
import { courseMaterialFolder } from "@/constants/course-material";
import type { Prisma } from "@/generated/prisma/client";
import { locales, type Locale } from "@/i18n/config";
import { recordAudit } from "@/lib/audit";
import { languageLabel } from "@/lib/helpers/admin";
import { adminCourse, adminQuestion, courseChanges, hiddenQuestionError, notEnoughQuestionsError, outcomeLines, parseCoursePrice, parseCourseSettings, questionChanges, questionLabel, questionSnippet } from "@/lib/helpers/admin-courses";
import { prisma } from "@/lib/prisma";
import type { AdminActionResult, CourseFormState, CourseFormValues, QuestionFormState, QuestionFormValues } from "@/types/admin";
import type { CourseCode } from "@/types/courses";

type CourseSaveResult = { saved: true } | { errors: CourseFormState["errors"] } | null;

type QuestionSaveResult = { id: number } | { errors: QuestionFormState["errors"] } | null;

export async function updateCourse(adminId: number, code: CourseCode, values: CourseFormValues): Promise<CourseSaveResult> {
  const settings = parseCourseSettings(values);

  return prisma.$transaction(async (tx) => {
    const record = await tx.course.findUnique({ where: { code }, select: adminCourseSelect });
    if (!record) return null;
    const before = adminCourse(record);
    const shortage = notEnoughQuestionsError(before, settings.questionsPerAttempt);
    if (shortage) return { errors: { questionsPerAttempt: shortage } }

    await tx.course.update({
      where: { id: record.id },
      data: { ...settings, priceCents: parseCoursePrice(values.price) ?? before.priceCents, shuffleQuestions: values.shuffleQuestions, shuffleAnswers: values.shuffleAnswers, active: values.active }
    });
    for (const locale of locales) {
      const data = {
        name: values[`name.${locale}`],
        description: values[`description.${locale}`] || null,
        lectureTitle: values[`lectureTitle.${locale}`],
        outcomes: outcomeLines(values[`outcomes.${locale}`]),
        certificateCode: values[`certificateCode.${locale}`]
      }
      await tx.courseLocale.upsert({ where: { courseId_locale: { courseId: record.id, locale } }, update: data, create: { ...data, courseId: record.id, locale } });
    }

    const details = courseChanges(before, values, settings);
    if (details) await recordAudit(tx, { adminId, action: "courseUpdated", entity: "course", entityId: code, entityLabel: values["name.en"], details });
    return { saved: true }
  });
}

function isCourseMaterialPath(pathname: string, code: CourseCode, locale: Locale) {
  return pathname.startsWith(`${courseMaterialFolder}/${code}-${locale}`) && pathname.endsWith(".pdf") && !pathname.includes("..");
}

function formatMegabytes(bytes: number) {
  return `${(bytes / 1024 / 1024).toLocaleString("en-CA", { maximumFractionDigits: 1 })} MB`;
}

export async function setCourseMaterial(adminId: number, code: CourseCode, locale: Locale, pathname: string): Promise<AdminActionResult> {
  if (!isCourseMaterialPath(pathname, code, locale)) return { ok: false, error: courseActionMessages.uploadFailed }
  const blob = await head(pathname);
  if (blob.contentType !== courseMaterialContentType) return { ok: false, error: courseActionMessages.notPdf }

  const previous = await prisma.$transaction(async (tx) => {
    const row = await tx.courseLocale.findFirst({ where: { locale, course: { code } }, select: { courseId: true, materialFileKey: true, course: { select: { locales: { where: { locale: "en" }, select: { name: true } } } } } });
    if (!row) return null;
    await tx.courseLocale.update({ where: { courseId_locale: { courseId: row.courseId, locale } }, data: { materialFileKey: blob.pathname } });
    const entityLabel = row.course.locales[0]?.name ?? code;
    await recordAudit(tx, { adminId, action: "courseMaterialUploaded", entity: "course", entityId: code, entityLabel, details: `${languageLabel(locale)} PDF (${formatMegabytes(blob.size)})` });
    return { key: row.materialFileKey }
  });
  if (!previous) return { ok: false, error: courseActionMessages.notFound }

  if (previous.key && previous.key !== blob.pathname) {
    try {
      await del(previous.key);
    } catch (error) {
      console.error("Deleting the replaced course material failed", error);
    }
  }
  return { ok: true, message: courseActionMessages.uploaded }
}

async function findBank(tx: Prisma.TransactionClient, code: CourseCode, locale: Locale) {
  return tx.courseLocale.findFirst({ where: { locale, course: { code } }, select: { courseId: true, course: { select: { questionsPerAttempt: true } } } });
}

function activeCount(tx: Prisma.TransactionClient, courseId: number, locale: Locale) {
  return tx.question.count({ where: { courseId, locale, active: true } });
}

function questionData(values: QuestionFormValues) {
  return {
    type: values.type,
    prompt: values.prompt,
    options: values.options,
    correctIndex: values.correctIndex,
    explanation: values.explanation || null,
    sortOrder: Number(values.sortOrder),
    active: values.active
  }
}

export async function saveQuestion(adminId: number, code: CourseCode, locale: Locale, questionId: number | null, values: QuestionFormValues): Promise<QuestionSaveResult> {
  return prisma.$transaction(async (tx) => {
    const bank = await findBank(tx, code, locale);
    if (!bank) return null;
    const label = questionLabel(code, locale, Number(values.sortOrder));

    if (questionId === null) {
      const created = await tx.question.create({ data: { ...questionData(values), courseId: bank.courseId, locale }, select: { id: true } });
      await recordAudit(tx, { adminId, action: "questionCreated", entity: "question", entityId: created.id, entityLabel: label, details: questionSnippet(values.prompt) });
      return created;
    }

    const record = await tx.question.findFirst({ where: { id: questionId, courseId: bank.courseId, locale }, select: adminQuestionSelect });
    if (!record) return null;
    const before = adminQuestion(record);
    if (before.active && !values.active) {
      const count = await activeCount(tx, bank.courseId, locale);
      if (count - 1 < bank.course.questionsPerAttempt) return { errors: { active: hiddenQuestionError(count, bank.course.questionsPerAttempt) } }
    }

    await tx.question.update({ where: { id: questionId }, data: questionData(values) });
    const details = questionChanges(before, values);
    if (details) await recordAudit(tx, { adminId, action: "questionUpdated", entity: "question", entityId: questionId, entityLabel: label, details });
    return { id: questionId }
  });
}

export async function deleteQuestion(adminId: number, code: CourseCode, locale: Locale, questionId: number): Promise<AdminActionResult> {
  return prisma.$transaction(async (tx) => {
    const bank = await findBank(tx, code, locale);
    const record = bank && await tx.question.findFirst({ where: { id: questionId, courseId: bank.courseId, locale }, select: adminQuestionSelect });
    if (!bank || !record) return { ok: false, error: questionActionMessages.notFound }
    if (record.active) {
      const count = await activeCount(tx, bank.courseId, locale);
      if (count - 1 < bank.course.questionsPerAttempt) return { ok: false, error: hiddenQuestionError(count, bank.course.questionsPerAttempt) }
    }

    await tx.question.delete({ where: { id: questionId } });
    await recordAudit(tx, { adminId, action: "questionDeleted", entity: "question", entityId: questionId, entityLabel: questionLabel(code, locale, record.sortOrder), details: questionSnippet(record.prompt) });
    return { ok: true }
  });
}
