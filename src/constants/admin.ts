import { BookOpen, FileUp, History, LayoutDashboard, MessageSquareQuote, Monitor, Moon, Sun, Users } from "lucide-react";
import type { ChartConfig } from "@/components/ui/chart";
import type { Prisma } from "@/generated/prisma/client";
import type { AdminLoginField, AdminNavGroup, AdminRoute, AdminTableFilter, AdminThemeOption, AuditAction, EnrollmentStatus, ImportKind, QuestionType, SelectOption, StatusTone, UserFormError, UserFormField } from "@/types/admin";
import type { LoginFailureStatus, LoginField, LoginFieldError } from "@/types/auth";

export const adminRoutes: Record<AdminRoute, string> = {
  dashboard: "/admin",
  users: "/admin/users",
  newUser: "/admin/users/new",
  importData: "/admin/import",
  courses: "/admin/courses",
  reviews: "/admin/reviews",
  newReview: "/admin/reviews/new",
  auditLog: "/admin/audit-log",
  login: "/admin/login"
}

export const adminNav: AdminNavGroup[] = [
  { label: "Overview", items: [{ route: "dashboard", label: "Dashboard", icon: LayoutDashboard }] },
  {
    label: "Students",
    items: [
      { route: "users", label: "Users", icon: Users },
      { route: "importData", label: "Import", icon: FileUp }
    ]
  },
  {
    label: "Content",
    items: [
      { route: "courses", label: "Courses", icon: BookOpen },
      { route: "reviews", label: "Reviews", icon: MessageSquareQuote }
    ]
  },
  { label: "System", items: [{ route: "auditLog", label: "Audit log", icon: History }] }
];

export const enrollmentStatusLabels: Record<EnrollmentStatus, string> = {
  notStarted: "Not started",
  inProgress: "In progress",
  passed: "Passed",
  failed: "Failed"
}

export const enrollmentStatusOptions: SelectOption[] = Object.entries(enrollmentStatusLabels).map(([value, label]) => ({ value, label }));

export const courseOptions: SelectOption[] = [
  { value: "ground", label: "Ground" },
  { value: "air", label: "Air" }
];

export const languageOptions: SelectOption[] = [
  { value: "en", label: "English" },
  { value: "fr", label: "French" }
];

export const questionTypeLabels: Record<QuestionType, string> = {
  multipleChoice: "Multiple choice",
  trueFalse: "True / false"
}

export const importKindLabels: Record<ImportKind, string> = {
  users: "Users",
  questions: "Questions"
}

export const importColumns: Record<ImportKind, string[]> = {
  users: ["first_name", "last_name", "email", "company", "course", "language"],
  questions: ["prompt", "option_a", "option_b", "option_c", "option_d", "correct", "explanation"]
}

export const adminPageSize = 25;

export const adminSearchParam = "q";

export const adminPageParam = "page";

export const adminAttemptParam = "attempt";

export const adminFilterAll = "all";

export const adminSearchDebounceMs = 300;

export const userListFilters: AdminTableFilter[] = [
  { param: "course", label: "Course", allLabel: "All courses", options: courseOptions },
  { param: "status", label: "Status", allLabel: "All statuses", options: enrollmentStatusOptions }
];

export const userFormErrors: Record<UserFormField, Partial<Record<UserFormError, string>>> = {
  firstName: { required: "Enter a first name." },
  lastName: { required: "Enter a last name." },
  email: { required: "Enter an email.", invalidEmail: "Enter a valid email address.", emailTaken: "Another account already uses this email." },
  course: { invalidCourse: "Choose a course.", courseLocked: "The course can't change after the student has started the exam." },
  locale: { invalidCourse: "Choose a language.", courseLocked: "The language can't change after the student has started the exam." }
}

export const userFormFailedNotice = "The user couldn't be saved. Please try again.";

export const auditActionLabels: Record<AuditAction, string> = {
  userCreated: "Created user",
  userUpdated: "Edited user",
  userDeactivated: "Deactivated user",
  userReactivated: "Reactivated user",
  passwordResetSent: "Sent password reset",
  attemptsReset: "Reset attempts",
  markedPaid: "Marked paid",
  markedUnpaid: "Marked unpaid",
  markedPassed: "Marked passed",
  passCleared: "Cleared pass",
  certificateReissued: "Reissued certificate"
}

export const adminSidebarWidth = "16rem";

export const adminDateFormat = new Intl.DateTimeFormat("en-CA", { dateStyle: "medium", timeZone: "UTC" });

export const adminDateTimeFormat = new Intl.DateTimeFormat("en-CA", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" });

export const adminLoginNotices: Record<LoginFailureStatus, string> = {
  invalidCredentials: "The email or password is incorrect, or this account doesn't have admin access.",
  deactivated: "This account has been deactivated.",
  rateLimited: "Too many attempts. Wait a minute, then try again.",
  failed: "Something went wrong. Please try again."
}

export const adminLoginFields: AdminLoginField[] = [
  { name: "email", label: "Email", type: "email", autoComplete: "username" },
  { name: "password", label: "Password", type: "password", autoComplete: "current-password" }
];

export const adminLoginFieldErrors: Record<LoginField, Partial<Record<LoginFieldError, string>>> = {
  email: { required: "Enter your email.", invalidEmail: "Enter a valid email address." },
  password: { required: "Enter your password." }
}

export const registrationsChartConfig = {
  registrations: { label: "Registrations", color: "var(--chart-1)" }
} satisfies ChartConfig;

export const passRateChartConfig = {
  passRate: { label: "Pass rate (%)", color: "var(--chart-2)" }
} satisfies ChartConfig;

export const ratingOptions: SelectOption[] = [5, 4, 3, 2, 1].map((rating) => ({ value: String(rating), label: `${rating} out of 5` }));

export const auditEntityFilter = "entity";

export const auditEntityOptions: SelectOption[] = ["User", "Question", "Review", "Course", "Certificate", "Import"].map((entity) => ({ value: entity.toLowerCase(), label: entity }));

export const adminThemeOptions: AdminThemeOption[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor }
];

export const statusToneStyles: Record<StatusTone, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-400",
  warning: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-400",
  danger: "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/60 dark:text-red-400",
  neutral: "border-border bg-muted text-muted-foreground"
}

export const statusToneIconStyles: Record<StatusTone, string> = {
  success: "text-emerald-600 dark:text-emerald-400",
  warning: "text-amber-600 dark:text-amber-400",
  danger: "text-red-600 dark:text-red-400",
  neutral: "text-muted-foreground"
}

export const adminEnrollmentSelect = {
  id: true,
  locale: true,
  paid: true,
  passedOn: true,
  certificateNumber: true,
  certificateIssuedAt: true,
  attemptsResetAt: true,
  notes: true,
  createdAt: true,
  organization: { select: { name: true } },
  courseLocale: { select: { name: true, course: { select: { code: true, maxAttempts: true } } } },
  attempts: {
    select: { id: true, startedAt: true, expiresAt: true, submittedAt: true, correctCount: true, questionCount: true, passed: true },
    orderBy: { startedAt: "desc" }
  }
} satisfies Prisma.EnrollmentSelect;

export const adminUserDetailSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  preferredLocale: true,
  active: true,
  createdAt: true,
  enrollments: { select: adminEnrollmentSelect, orderBy: [{ createdAt: "desc" }, { id: "desc" }] }
} satisfies Prisma.UserSelect;

export const adminAnswerSelect = {
  id: true,
  questionText: true,
  answerText: true,
  correctAnswerText: true,
  isCorrect: true
} satisfies Prisma.AttemptAnswerSelect;

export const userActionMessages = {
  resetSent: "Password reset email sent.",
  emailFailed: "The email couldn't be sent. Please try again.",
  notFound: "This student no longer exists.",
  noEnrollment: "This student isn't enrolled in a course.",
  noAttempts: "There are no attempts to reset.",
  alreadyPassed: "This enrollment is already marked as passed.",
  notPassed: "This enrollment hasn't been passed.",
  invalidDate: "Enter a pass date that isn't in the future.",
  failed: "Something went wrong. Please try again."
}

export const welcomeFailedParam = "welcome";
