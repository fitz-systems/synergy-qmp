import type { LucideIcon } from "lucide-react";
import type { adminCourseSelect, adminQuestionSelect, adminReviewSelect, adminUserDetailSelect, auditLogSelect, dashboardAttemptSelect } from "@/constants/admin";
import type { Prisma } from "@/generated/prisma/client";
import type { Locale } from "@/i18n/config";
import type { CourseCode } from "./courses";
import type { LoginField } from "./auth";

export type AdminRoute = "dashboard" | "users" | "newUser" | "importData" | "courses" | "reviews" | "newReview" | "auditLog" | "login";

export type EnrollmentStatus = "notStarted" | "inProgress" | "passed" | "failed";

export type AdminTheme = "light" | "dark" | "system";

export type StatusTone = "success" | "warning" | "danger" | "neutral";

export interface AdminThemeOption {
  value: AdminTheme;
  label: string;
  icon: LucideIcon;
}

export type QuestionType = "multipleChoice" | "trueFalse";

export type ImportKind = "users" | "questions";

export interface AdminNavItem {
  route: AdminRoute;
  label: string;
  icon: LucideIcon;
}

export interface AdminNavGroup {
  label: string;
  items: AdminNavItem[];
}

export interface AdminCrumb {
  label: string;
  href?: string;
}

export interface DashboardAttempt {
  id: number;
  userId: number;
  userName: string;
  courseCode: CourseCode;
  locale: Locale;
  submittedAt: string;
  correctCount: number | null;
  questionCount: number;
  passed: boolean;
}

export interface AdminQuestionOption {
  text: string;
  correct: boolean;
}

export interface AdminQuestion {
  id: number;
  courseCode: CourseCode;
  locale: Locale;
  sortOrder: number;
  type: QuestionType;
  prompt: string;
  options: AdminQuestionOption[];
  explanation: string;
  active: boolean;
}

export interface AdminReview {
  id: number;
  author: string;
  roleCompany: string;
  locale: Locale;
  body: string;
  rating: number | null;
  published: boolean;
  sortOrder: number;
}

export type ReviewFormField = "author" | "body" | "locale" | "rating" | "sortOrder";

export interface ReviewFormValues {
  author: string;
  roleCompany: string;
  body: string;
  locale: string;
  rating: string;
  sortOrder: string;
  published: boolean;
}

export interface ReviewFormState {
  status: "idle" | "invalid" | "failed";
  values: ReviewFormValues;
  errors: Partial<Record<ReviewFormField, string>>;
}

export interface AdminCourse {
  code: CourseCode;
  names: Record<Locale, string>;
  descriptions: Record<Locale, string>;
  lectureTitles: Record<Locale, string>;
  outcomes: Record<Locale, string[]>;
  materialUploaded: Record<Locale, boolean>;
  certificateCodes: Record<Locale, string>;
  questionCounts: Record<Locale, number>;
  activeQuestionCounts: Record<Locale, number>;
  questionsPerAttempt: number;
  passMarkPct: number;
  timeLimitMinutes: number;
  maxAttempts: number | null;
  certificateValidMonths: number;
  priceCents: number;
  durationHours: number;
  lectureMinutes: number;
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  active: boolean;
}

export type CourseSetting = "passMarkPct" | "questionsPerAttempt" | "timeLimitMinutes" | "maxAttempts" | "certificateValidMonths" | "durationHours" | "lectureMinutes";

export type CourseLocaleField = "name" | "description" | "lectureTitle" | "outcomes" | "certificateCode";

export type CourseSettings = Record<Exclude<CourseSetting, "maxAttempts">, number> & { maxAttempts: number | null }

export type CourseFormField = CourseSetting | "price" | `${Exclude<CourseLocaleField, "description">}.${Locale}`;

export type CourseFormValues = Record<CourseSetting, string> & Record<`${CourseLocaleField}.${Locale}`, string> & {
  price: string;
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  active: boolean;
}

export interface CourseFormState {
  status: "idle" | "invalid" | "failed";
  values: CourseFormValues;
  errors: Partial<Record<CourseFormField, string>>;
}

export type QuestionFormField = "prompt" | "options" | "sortOrder" | "active";

export interface QuestionFormValues {
  type: QuestionType;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  sortOrder: string;
  active: boolean;
}

export interface QuestionFormState {
  status: "idle" | "invalid" | "failed";
  values: QuestionFormValues;
  errors: Partial<Record<QuestionFormField, string>>;
}

export type QuestionStatus = "active" | "hidden";

export interface AdminQuestionListQuery {
  search: string;
  status?: QuestionStatus;
}

export interface AuditEntry {
  id: number;
  at: string;
  admin: string;
  action: string;
  entity: AuditEntity;
  entityLabel: string;
  href?: string;
  details: string | null;
}

export interface AuditLogQuery {
  search: string;
  entity?: AuditEntity;
  page: number;
}

export interface DashboardCountsRecord {
  active_students: number;
  deactivated_students: number;
  attempts_this_month: number;
  passed_attempts_this_month: number;
  passed_this_year: number;
  passed_total: number;
}

export interface PassRateRecord {
  course_code: string;
  locale: string;
  submitted: number;
  passed: number;
}

export interface MonthlyRegistrationsRecord {
  month: string;
  registrations: number;
}

export interface AdminDashboard {
  stats: DashboardStat[];
  registrations: MonthlyRegistrations[];
  passRates: CoursePassRate[];
  recentAttempts: DashboardAttempt[];
}

export interface DashboardStat {
  label: string;
  value: string;
  note: string;
}

export interface MonthlyRegistrations {
  month: string;
  registrations: number;
}

export interface CoursePassRate {
  course: string;
  passRate: number;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface AdminTableFilter {
  param: string;
  label: string;
  allLabel: string;
  options: SelectOption[];
}

export type AdminSearchParams = Record<string, string | string[] | undefined>;

export interface AdminUserListQuery {
  search: string;
  course?: CourseCode;
  status?: EnrollmentStatus;
  page: number;
}

export interface AdminUserRow {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  company: string | null;
  courseCode: CourseCode | null;
  locale: Locale | null;
  status: EnrollmentStatus | null;
  enrolledOn: string | null;
  active: boolean;
}

export interface AdminListPage<Row> {
  rows: Row[];
  total: number;
  page: number;
  pageCount: number;
  from: number;
  to: number;
}

export type AdminUserPage = AdminListPage<AdminUserRow>;

export type AuditLogPage = AdminListPage<AuditEntry>;

export interface AdminUserListRecord {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  active: boolean;
  company: string | null;
  course_code: string | null;
  locale: string | null;
  status: EnrollmentStatus | null;
  enrolled_on: Date | null;
}

export interface AdminEnrollment {
  id: number;
  courseCode: CourseCode;
  courseName: string;
  locale: Locale;
  company: string | null;
  paid: boolean;
  status: EnrollmentStatus;
  enrolledOn: string;
  passedOn?: string;
  certificateNumber?: string;
  certificateIssuedAt?: string;
  attemptsUsed: number;
  maxAttempts: number | null;
  attemptsResetAt?: string;
  notes: string | null;
}

export interface AdminUserAttempt {
  id: number;
  enrollmentId: number;
  courseCode: CourseCode;
  locale: Locale;
  startedAt: string;
  submittedAt?: string;
  correctCount: number | null;
  questionCount: number;
  passed: boolean | null;
  counted: boolean;
}

export interface AdminAnswer {
  id: number;
  question: string;
  answer: string | null;
  correctAnswer: string | null;
  correct: boolean;
}

export interface AdminUserDetail {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  preferredLocale: Locale;
  active: boolean;
  createdAt: string;
  current?: AdminEnrollment;
  enrollments: AdminEnrollment[];
  attempts: AdminUserAttempt[];
}

export type UserFormField = "firstName" | "lastName" | "email" | "course" | "locale";

export type UserFormError = "required" | "invalidEmail" | "emailTaken" | "invalidCourse" | "courseLocked" | "inactiveCourse";

export interface UserFormValues {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  course: string;
  locale: string;
  notes: string;
  active: boolean;
  paid: boolean;
  sendWelcome: boolean;
}

export interface UserFormState {
  status: "idle" | "invalid" | "failed";
  values: UserFormValues;
  errors: Partial<Record<UserFormField, UserFormError>>;
}

export type AdminActionResult = { ok: true; message?: string } | { ok: false; error: string };

export type AuditAction = "userCreated" | "userUpdated" | "userDeactivated" | "userReactivated" | "passwordResetSent" | "attemptsReset" | "markedPaid" | "markedUnpaid" | "markedPassed" | "passCleared" | "certificateReissued" | "courseUpdated" | "courseMaterialUploaded" | "questionCreated" | "questionUpdated" | "questionDeleted" | "reviewCreated" | "reviewUpdated" | "reviewDeleted" | "usersImported" | "questionsImported";

export type AuditEntity = "user" | "certificate" | "course" | "question" | "review" | "import";

export interface AuditInput {
  adminId: number;
  action: AuditAction;
  entity: AuditEntity;
  entityId?: number | string;
  entityLabel: string;
  details?: string;
}

export interface QuestionBank {
  courseCode: CourseCode;
  locale: Locale;
  label: string;
}

export interface CourseQuestionBank {
  course: AdminCourse;
  locale: Locale;
}

export interface ImportPreviewRow {
  line: number;
  values: string[];
  problem?: string;
}

export interface ImportPreview {
  fileError?: string;
  rows: ImportPreviewRow[];
  ready: number;
}

export interface ImportRequest {
  kind: ImportKind;
  bank: string;
  fileName: string;
  text: string;
}

export interface QuestionBankKey {
  code: CourseCode;
  locale: Locale;
}

export type ParsedImportRequest = { kind: "users"; result: ParsedImport<ImportUserRow> } | { kind: "questions"; result: ParsedImport<ImportQuestionRow>; bank: QuestionBankKey }

export type ImportResult = AdminActionResult & { kind?: ImportKind }

export interface ImportRecord {
  line: number;
  cells: Record<string, string>;
  values: string[];
}

export interface ImportTable {
  fileError?: string;
  records: ImportRecord[];
}

export interface ImportUserContext {
  existing: Map<string, string>;
  inactiveCourses: Set<string>;
}

export interface ImportQuestionContext {
  existingPrompts: Set<string>;
  nextSortOrder: number;
}

export interface ImportUserRow {
  line: number;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  course: CourseCode;
  locale: Locale;
}

export interface ImportQuestionRow {
  line: number;
  values: QuestionFormValues;
}

export interface ParsedImport<Row> {
  fileError?: string;
  preview: ImportPreviewRow[];
  rows: Row[];
}

export interface AdminIdentity {
  name: string;
  email: string;
}

export interface AdminLoginField {
  name: LoginField;
  label: string;
  type: "email" | "password";
  autoComplete: string;
}

export type AdminUserDetailRecord = Prisma.UserGetPayload<{ select: typeof adminUserDetailSelect }>;

export type DashboardAttemptRecord = Prisma.AttemptGetPayload<{ select: typeof dashboardAttemptSelect }>;

export type AuditLogRecord = Prisma.AuditLogGetPayload<{ select: typeof auditLogSelect }>;

export type AdminCourseRecord = Prisma.CourseGetPayload<{ select: typeof adminCourseSelect }>;

export type AdminQuestionRecord = Prisma.QuestionGetPayload<{ select: typeof adminQuestionSelect }>;

export type AdminReviewRecord = Prisma.ReviewGetPayload<{ select: typeof adminReviewSelect }>;

export type AdminEnrollmentRecord = AdminUserDetailRecord["enrollments"][number];
