import { adminDateFormat, adminDateTimeFormat, adminFilterAll, adminLoginFieldErrors, adminLoginNotices, adminPageParam, adminRoutes, adminSearchParam, courseOptions, enrollmentStatusLabels, languageOptions, userFormErrors } from "@/constants/admin";
import { defaultLocale, hasLocale, locales, type Locale } from "@/i18n/config";
import type { AdminAttempt, AdminCourse, AdminEnrollment, AdminEnrollmentRecord, AdminIdentity, AdminQuestion, AdminQuestionOption, AdminRoute, AdminSearchParams, AdminUser, AdminUserAttempt, AdminUserDetail, AdminUserDetailRecord, AdminUserListQuery, AdminUserListRecord, AdminUserRow, DashboardStat, EnrollmentStatus, QuestionBank, QuestionType, UserFormField, UserFormState, UserFormValues } from "@/types/admin";
import type { LoginField, LoginFormState, SessionUser } from "@/types/auth";
import type { CourseCode } from "@/types/courses";
import { businessDate, isAttemptInProgress } from "./exam";
import { isEmail, readFormString } from "./forms";

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

export function adminCertificateHref(enrollmentId: number) {
  return `/admin/certificates/${enrollmentId}`;
}

export function adminUserAttemptHref(userId: number, attemptId: number) {
  return `${adminUserHref(userId)}?attempt=${attemptId}#answers`;
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

export function searchParamValue(params: AdminSearchParams, name: string) {
  const value = params[name];
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

export function isEnrollmentStatus(value: string): value is EnrollmentStatus {
  return value in enrollmentStatusLabels;
}

export function isCourseOption(value: string): value is CourseCode {
  return courseOptions.some((option) => option.value === value);
}

export function parseUserListQuery(params: AdminSearchParams): AdminUserListQuery {
  const course = searchParamValue(params, "course");
  const status = searchParamValue(params, "status");
  const page = Number.parseInt(searchParamValue(params, adminPageParam), 10);
  return {
    search: searchParamValue(params, adminSearchParam),
    course: isCourseOption(course) ? course : undefined,
    status: isEnrollmentStatus(status) ? status : undefined,
    page: Number.isInteger(page) && page > 0 ? page : 1
  }
}

export function userListFilterValues(query: AdminUserListQuery): Record<string, string> {
  return { [adminSearchParam]: query.search, course: query.course ?? adminFilterAll, status: query.status ?? adminFilterAll }
}

export function adminListHref(pathname: string, values: Record<string, string>, page = 1) {
  const params = new URLSearchParams();
  for (const [name, value] of Object.entries(values)) {
    if (value && value !== adminFilterAll) params.set(name, value);
  }
  if (page > 1) params.set(adminPageParam, String(page));
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function likePattern(search: string) {
  return `%${search.replace(/[\\%_]/g, (char) => `\\${char}`)}%`;
}

export function enrollmentStatusOf(passed: boolean, inProgress: boolean, submitted: boolean): EnrollmentStatus {
  if (passed) return "passed";
  if (inProgress) return "inProgress";
  return submitted ? "failed" : "notStarted";
}

export function readUserForm(formData: FormData): UserFormValues {
  return {
    firstName: readFormString(formData, "firstName"),
    lastName: readFormString(formData, "lastName"),
    email: readFormString(formData, "email").toLowerCase(),
    company: readFormString(formData, "company").replace(/\s+/g, " "),
    course: readFormString(formData, "course"),
    locale: readFormString(formData, "locale"),
    notes: readFormString(formData, "notes"),
    active: formData.get("active") === "on",
    paid: formData.get("paid") === "on",
    sendWelcome: formData.get("sendWelcome") === "on"
  }
}

export function validateUserForm(values: UserFormValues): UserFormState["errors"] {
  const errors: UserFormState["errors"] = {}
  if (!values.firstName) errors.firstName = "required";
  if (!values.lastName) errors.lastName = "required";
  if (!values.email) errors.email = "required";
  else if (!isEmail(values.email)) errors.email = "invalidEmail";
  if (!isCourseOption(values.course)) errors.course = "invalidCourse";
  if (!hasLocale(values.locale)) errors.locale = "invalidCourse";
  return errors;
}

export function userFormFieldError(errors: UserFormState["errors"], field: UserFormField) {
  const error = errors[field];
  return error ? userFormErrors[field][error] : undefined;
}

export function userFormValues(user?: AdminUserDetail): UserFormValues {
  const current = user?.current;
  return {
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    email: user?.email ?? "",
    company: current?.company ?? "",
    course: current?.courseCode ?? courseOptions[0].value,
    locale: current?.locale ?? user?.preferredLocale ?? defaultLocale,
    notes: current?.notes ?? "",
    active: user?.active ?? true,
    paid: current?.paid ?? false,
    sendWelcome: true
  }
}

export function initialUserFormState(user?: AdminUserDetail): UserFormState {
  return { status: "idle", values: userFormValues(user), errors: {} }
}

export function dateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function todayInputValue() {
  return dateInputValue(businessDate(new Date()));
}

export function parseDateInput(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) || dateInputValue(date) !== value ? null : date;
}

export function enrollmentLabel(courseCode: CourseCode, locale: Locale) {
  return `${courseLabel(courseCode)} · ${languageLabel(locale)}`;
}

export function attemptsUsedLabel(used: number, max: number | null) {
  return max === null ? `${used} (no limit)` : `${used} of ${max}`;
}

export function scoreLabel(correctCount: number | null, questionCount: number) {
  if (correctCount === null) return "—";
  const pct = questionCount === 0 ? 0 : Math.round((correctCount / questionCount) * 100);
  return `${correctCount}/${questionCount} (${pct}%)`;
}

function courseCodeOf(value: string): CourseCode {
  return isCourseOption(value) ? value : courseOptions[0].value as CourseCode;
}

function localeOf(value: string): Locale {
  return hasLocale(value) ? value : defaultLocale;
}

export function adminUserRow(record: AdminUserListRecord): AdminUserRow {
  return {
    id: record.id,
    firstName: record.first_name,
    lastName: record.last_name,
    email: record.email,
    company: record.company,
    courseCode: record.course_code ? courseCodeOf(record.course_code) : null,
    locale: record.locale ? localeOf(record.locale) : null,
    status: record.status,
    enrolledOn: record.enrolled_on?.toISOString() ?? null,
    active: record.active
  }
}

function isCountedAttempt(attempt: { startedAt: Date }, resetAt: Date | null) {
  return resetAt === null || attempt.startedAt > resetAt;
}

export function adminEnrollment(record: AdminEnrollmentRecord, now: Date): AdminEnrollment {
  const counted = record.attempts.filter((attempt) => isCountedAttempt(attempt, record.attemptsResetAt));
  const { course } = record.courseLocale;
  return {
    id: record.id,
    courseCode: courseCodeOf(course.code),
    courseName: record.courseLocale.name,
    locale: localeOf(record.locale),
    company: record.organization?.name ?? null,
    paid: record.paid,
    status: enrollmentStatusOf(record.passedOn !== null, record.attempts.some((attempt) => isAttemptInProgress(attempt, now)), counted.some((attempt) => attempt.submittedAt)),
    enrolledOn: record.createdAt.toISOString(),
    passedOn: record.passedOn?.toISOString(),
    certificateNumber: record.certificateNumber ?? undefined,
    certificateIssuedAt: record.certificateIssuedAt?.toISOString(),
    attemptsUsed: counted.length,
    maxAttempts: course.maxAttempts,
    attemptsResetAt: record.attemptsResetAt?.toISOString(),
    notes: record.notes
  }
}

function adminUserAttempts(record: AdminEnrollmentRecord): AdminUserAttempt[] {
  const courseCode = courseCodeOf(record.courseLocale.course.code);
  const locale = localeOf(record.locale);
  return record.attempts.map((attempt) => ({
    id: attempt.id,
    enrollmentId: record.id,
    courseCode,
    locale,
    startedAt: attempt.startedAt.toISOString(),
    submittedAt: attempt.submittedAt?.toISOString(),
    correctCount: attempt.correctCount,
    questionCount: attempt.questionCount,
    passed: attempt.passed,
    counted: isCountedAttempt(attempt, record.attemptsResetAt)
  }));
}

export function adminUserDetail(record: AdminUserDetailRecord, now: Date): AdminUserDetail {
  const enrollments = record.enrollments.map((enrollment) => adminEnrollment(enrollment, now));
  return {
    id: record.id,
    firstName: record.firstName,
    lastName: record.lastName,
    email: record.email,
    preferredLocale: localeOf(record.preferredLocale),
    active: record.active,
    createdAt: record.createdAt.toISOString(),
    current: enrollments[0],
    enrollments,
    attempts: record.enrollments.flatMap(adminUserAttempts).sort((a, b) => b.startedAt.localeCompare(a.startedAt))
  }
}

export function selectedAttemptId(attempts: AdminUserAttempt[], requested: string) {
  const id = Number(requested);
  const submitted = attempts.filter((attempt) => attempt.submittedAt);
  return submitted.find((attempt) => attempt.id === id)?.id ?? submitted[0]?.id;
}

interface ProfileSnapshot {
  firstName: string;
  lastName: string;
  email: string;
  active: boolean;
}

interface EnrollmentSnapshot {
  locale: string;
  paid: boolean;
  notes: string | null;
  organization: { name: string } | null;
  courseLocale: { course: { code: string } };
}

export function userChanges(user: ProfileSnapshot, enrollment: EnrollmentSnapshot | undefined, values: UserFormValues) {
  const changes: [boolean, string][] = [
    [user.firstName !== values.firstName || user.lastName !== values.lastName, "name"],
    [user.email !== values.email, "email"],
    [user.active !== values.active, values.active ? "reactivated account" : "deactivated account"],
    [!enrollment || enrollment.courseLocale.course.code !== values.course || enrollment.locale !== values.locale, "course"],
    [(enrollment?.organization?.name ?? "") !== values.company, "company"],
    [(enrollment?.paid ?? false) !== values.paid, values.paid ? "marked paid" : "marked unpaid"],
    [(enrollment?.notes ?? "") !== values.notes, "notes"]
  ];
  return changes.filter(([changed]) => changed).map(([, label]) => label);
}
