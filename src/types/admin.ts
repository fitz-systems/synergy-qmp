import type { LucideIcon } from "lucide-react";
import type { adminUserDetailSelect } from "@/constants/admin";
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

export interface AdminUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  courseCode: CourseCode;
  locale: Locale;
  status: EnrollmentStatus;
  enrolledOn: string;
  passedOn?: string;
  certificateNumber?: string;
  attemptsUsed: number;
  active: boolean;
  notes?: string;
}

export interface AdminAttempt {
  id: number;
  userId: number;
  userName: string;
  courseCode: CourseCode;
  locale: Locale;
  submittedAt: string;
  correctCount: number;
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
  rating: number;
  published: boolean;
  sortOrder: number;
}

export interface AdminCourse {
  code: CourseCode;
  names: Record<Locale, string>;
  descriptions: Record<Locale, string>;
  materialFiles: Record<Locale, string | null>;
  certificateCodes: Record<Locale, string>;
  questionCounts: Record<Locale, number>;
  questionsPerAttempt: number;
  passMarkPct: number;
  timeLimitMinutes: number;
  maxAttempts: number | null;
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  active: boolean;
}

export interface AuditEntry {
  id: number;
  at: string;
  admin: string;
  action: string;
  entity: string;
  entityLabel: string;
  details: string;
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

export interface AdminUserPage {
  rows: AdminUserRow[];
  total: number;
  page: number;
  pageCount: number;
  from: number;
  to: number;
}

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

export type UserFormError = "required" | "invalidEmail" | "emailTaken" | "invalidCourse" | "courseLocked";

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

export type AuditAction = "userCreated" | "userUpdated" | "userDeactivated" | "userReactivated" | "passwordResetSent" | "attemptsReset" | "markedPaid" | "markedUnpaid" | "markedPassed" | "passCleared" | "certificateReissued";

export type AuditEntity = "user" | "certificate";

export interface AuditInput {
  adminId: number;
  action: AuditAction;
  entity: AuditEntity;
  entityId: number;
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

export type AdminEnrollmentRecord = AdminUserDetailRecord["enrollments"][number];
