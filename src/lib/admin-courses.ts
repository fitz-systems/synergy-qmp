import { adminCourseSelect, adminQuestionSelect } from "@/constants/admin";
import type { Prisma } from "@/generated/prisma/client";
import { hasLocale, type Locale } from "@/i18n/config";
import { isCourseOption } from "@/lib/helpers/admin";
import { adminCourse, adminQuestion, sortCourses } from "@/lib/helpers/admin-courses";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import type { AdminCourse, AdminQuestion, AdminQuestionListQuery, CourseQuestionBank } from "@/types/admin";
import type { CourseCode } from "@/types/courses";

export async function getAdminCourses(): Promise<AdminCourse[]> {
  await requireAdmin();
  const records = await prisma.course.findMany({ select: adminCourseSelect });
  return sortCourses(records.map(adminCourse));
}

export async function getAdminCourse(code: string): Promise<AdminCourse | null> {
  await requireAdmin();
  if (!isCourseOption(code)) return null;
  const record = await prisma.course.findUnique({ where: { code }, select: adminCourseSelect });
  return record ? adminCourse(record) : null;
}

export async function getCourseQuestionBank(code: string, locale: string): Promise<CourseQuestionBank | null> {
  if (!hasLocale(locale)) return null;
  const course = await getAdminCourse(code);
  return course ? { course, locale } : null;
}

function bankWhere(code: CourseCode, locale: Locale): Prisma.QuestionWhereInput {
  return { locale, courseLocale: { course: { code } } }
}

export async function getAdminQuestions(code: CourseCode, locale: Locale, query?: AdminQuestionListQuery): Promise<AdminQuestion[]> {
  await requireAdmin();
  const where = bankWhere(code, locale);
  if (query?.status) where.active = query.status === "active";
  if (query?.search) where.prompt = { contains: query.search, mode: "insensitive" };
  const records = await prisma.question.findMany({ where, orderBy: [{ sortOrder: "asc" }, { id: "asc" }], select: adminQuestionSelect });
  return records.map(adminQuestion);
}

export async function getAdminQuestion(code: CourseCode, locale: Locale, id: number): Promise<AdminQuestion | null> {
  await requireAdmin();
  if (!Number.isInteger(id) || id <= 0) return null;
  const record = await prisma.question.findFirst({ where: { id, ...bankWhere(code, locale) }, select: adminQuestionSelect });
  return record ? adminQuestion(record) : null;
}

export async function getNextQuestionSortOrder(code: CourseCode, locale: Locale) {
  await requireAdmin();
  const { _max } = await prisma.question.aggregate({ where: bankWhere(code, locale), _max: { sortOrder: true } });
  return (_max.sortOrder ?? 0) + 1;
}
