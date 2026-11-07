import { mockAdminAttempts, mockAdminCourses, mockAdminQuestions, mockAdminReviews, mockAdminUsers, mockAttemptAnswers, mockAuditLog, mockImportPreview, mockMonthlyRegistrations, mockPassRates } from "@/content/mock-admin";
import { hasLocale, type Locale } from "@/i18n/config";
import type { AdminAttempt, AdminAttemptAnswer, ImportKind, ImportPreviewRow, AdminCourse, AdminQuestion, AdminReview, CourseQuestionBank, AdminUser, AuditEntry, CoursePassRate, MonthlyRegistrations } from "@/types/admin";
import type { CourseCode } from "@/types/courses";

// Todo: Query the database (and check the admin session) instead of returning placeholder data

export async function getAdminUsers(): Promise<AdminUser[]> {
  return mockAdminUsers;
}

export async function getAdminUser(id: number): Promise<AdminUser | undefined> {
  return mockAdminUsers.find((user) => user.id === id);
}

export async function getAdminAttempts(userId?: number): Promise<AdminAttempt[]> {
  return userId ? mockAdminAttempts.filter((attempt) => attempt.userId === userId) : mockAdminAttempts;
}

export async function getAttemptAnswers(): Promise<AdminAttemptAnswer[]> {
  return mockAttemptAnswers;
}

export async function getAdminCourses(): Promise<AdminCourse[]> {
  return mockAdminCourses;
}

export async function getAdminCourse(code: string): Promise<AdminCourse | undefined> {
  return mockAdminCourses.find((course) => course.code === code);
}

export async function getCourseQuestionBank(code: string, locale: string): Promise<CourseQuestionBank | undefined> {
  if (!hasLocale(locale)) return undefined;
  const course = await getAdminCourse(code);
  return course ? { course, locale } : undefined;
}

export async function getAdminQuestions(courseCode: CourseCode, locale: Locale): Promise<AdminQuestion[]> {
  return mockAdminQuestions.filter((question) => question.courseCode === courseCode && question.locale === locale);
}

export async function getAdminQuestion(courseCode: CourseCode, locale: Locale, id: number): Promise<AdminQuestion | undefined> {
  return mockAdminQuestions.find((question) => question.id === id && question.courseCode === courseCode && question.locale === locale);
}

export async function getAdminReviews(): Promise<AdminReview[]> {
  return mockAdminReviews;
}

export async function getAdminReview(id: number): Promise<AdminReview | undefined> {
  return mockAdminReviews.find((review) => review.id === id);
}

export async function getAuditLog(): Promise<AuditEntry[]> {
  return mockAuditLog;
}

export async function getMonthlyRegistrations(): Promise<MonthlyRegistrations[]> {
  return mockMonthlyRegistrations;
}

export async function getPassRates(): Promise<CoursePassRate[]> {
  return mockPassRates;
}

export async function getImportPreview(): Promise<Record<ImportKind, ImportPreviewRow[]>> {
  return mockImportPreview;
}
