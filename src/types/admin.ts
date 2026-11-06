import type { LucideIcon } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { CourseCode } from "./courses";

export type AdminRoute = "dashboard" | "users" | "newUser" | "importData" | "courses" | "quizzes" | "newQuiz" | "reviews" | "newReview" | "auditLog" | "login";

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

export interface AdminAttemptAnswer {
  question: string;
  answer: string;
  correct: boolean;
}

export interface AdminQuiz {
  id: number;
  title: string;
  courseCode: CourseCode;
  locale: Locale;
  questionCount: number;
  questionsShown: number;
  passMarkPct: number;
  timeLimitMinutes: number;
  maxAttempts: number;
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  active: boolean;
}

export interface AdminQuestionOption {
  text: string;
  correct: boolean;
}

export interface AdminQuestion {
  id: number;
  quizId: number;
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
  certificateCode: string;
  questionsPerAttempt: number;
  passMarkPct: number;
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
  label: string;
  options: SelectOption[];
}

export interface ImportPreviewRow {
  line: number;
  values: string[];
  problem?: string;
}
