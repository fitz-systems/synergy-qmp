import { adminDateFormat, adminDateTimeFormat, adminLoginFieldErrors, adminLoginNotices, adminRoutes, courseOptions, languageOptions } from "@/constants/admin";
import { locales, type Locale } from "@/i18n/config";
import type { AdminAttempt, AdminCourse, AdminIdentity, AdminQuestion, AdminQuestionOption, AdminRoute, AdminUser, DashboardStat, QuestionBank, QuestionType } from "@/types/admin";
import type { LoginField, LoginFormState, SessionUser } from "@/types/auth";
import type { CourseCode } from "@/types/courses";

export function formatAdminDate(isoDate: string) {
  return adminDateFormat.format(new Date(isoDate));
}

export function formatAdminDateTime(isoDate: string) {
  return adminDateTimeFormat.format(new Date(isoDate));
}

export function adminUserHref(id: number) {
  return `/admin/users/${id}`;
}

export function adminUserEditHref(id: number) {
  return `/admin/users/${id}/edit`;
}

export function adminQuestionsHref(code: CourseCode, locale: Locale) {
  return `/admin/courses/${code}/${locale}/questions`;
}

export function adminQuestionHref(code: CourseCode, locale: Locale, questionId: number | "new") {
  return `${adminQuestionsHref(code, locale)}/${questionId}`;
}

export function adminReviewHref(id: number) {
  return `/admin/reviews/${id}`;
}

export function adminCourseHref(code: string) {
  return `/admin/courses/${code}`;
}

export function fullName(user: Pick<AdminUser, "firstName" | "lastName">) {
  return `${user.firstName} ${user.lastName}`;
}

export function initialsOf(name: string) {
  return name.split(/\s+/).map((part) => part[0] ?? "").join("").slice(0, 2).toUpperCase();
}

export function courseLabel(code: CourseCode) {
  return courseOptions.find((option) => option.value === code)?.label ?? code;
}

export function languageLabel(locale: string) {
  return languageOptions.find((option) => option.value === locale)?.label ?? locale;
}

export function questionBankLabel(code: CourseCode, locale: Locale) {
  return `${courseLabel(code)} · ${languageLabel(locale)}`;
}

export function questionBanks(courses: Pick<AdminCourse, "code">[]): QuestionBank[] {
  return courses.flatMap((course) => locales.map((locale) => ({ courseCode: course.code, locale, label: questionBankLabel(course.code, locale) })));
}

export function questionBankValue(bank: Pick<QuestionBank, "courseCode" | "locale">) {
  return `${bank.courseCode}-${bank.locale}`;
}

export function attemptScorePct(attempt: AdminAttempt) {
  return Math.round((attempt.correctCount / attempt.questionCount) * 100);
}

export function dashboardStats(users: AdminUser[], attempts: AdminAttempt[]): DashboardStat[] {
  const active = users.filter((user) => user.active).length;
  const passed = attempts.filter((attempt) => attempt.passed).length;
  const passRate = attempts.length ? Math.round((passed / attempts.length) * 100) : 0;
  return [
    { label: "Active students", value: active.toLocaleString("en-CA"), note: `${users.length - active} deactivated` },
    { label: "Attempts this month", value: attempts.length.toLocaleString("en-CA"), note: "Submitted exams" },
    { label: "Pass rate", value: `${passRate}%`, note: "All courses" },
    { label: "Certificates issued", value: users.filter((user) => user.certificateNumber).length.toLocaleString("en-CA"), note: "Valid for 3 years" }
  ];
}

export function pageCount(total: number, pageSize: number) {
  return Math.max(1, Math.ceil(total / pageSize));
}

export function isAdminRouteActive(pathname: string, route: AdminRoute) {
  const href = adminRoutes[route];
  return route === "dashboard" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

export function optionLetter(index: number) {
  return String.fromCharCode(65 + index);
}

export function correctAnswerText(question: AdminQuestion) {
  const index = question.options.findIndex((option) => option.correct);
  return index === -1 ? "—" : `${optionLetter(index)}. ${question.options[index].text}`;
}

export function defaultQuestionOptions(type: QuestionType): AdminQuestionOption[] {
  return type === "trueFalse"
    ? [{ text: "True", correct: true }, { text: "False", correct: false }]
    : Array.from({ length: 4 }, (_, index) => ({ text: "", correct: index === 0 }));
}

export function adminIdentity(user: SessionUser): AdminIdentity {
  return { name: `${user.firstName} ${user.lastName}`.trim() || user.email, email: user.email }
}

export function adminLoginFieldError(errors: LoginFormState["errors"], field: LoginField) {
  const error = errors[field];
  return error ? adminLoginFieldErrors[field][error] : undefined;
}

export function adminLoginNotice(status: LoginFormState["status"]) {
  return status === "idle" || status === "invalid" ? null : adminLoginNotices[status];
}
