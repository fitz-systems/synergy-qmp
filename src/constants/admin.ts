import { BookOpen, CalendarClock, CircleAlert, Clock, FileUp, History, LayoutDashboard, MessageSquareQuote, Monitor, Moon, Sun, Users } from "lucide-react";
import type { ChartConfig } from "@/components/ui/chart";
import { adminLoginPath } from "@/constants/routes";
import { businessTimeZone } from "@/constants/student";
import type { Prisma } from "@/generated/prisma/client";
import type { Locale } from "@/i18n/config";
import type { AdminLoginField, AdminNavGroup, AdminRoute, AdminTableFilter, AdminThemeOption, AuditAction, AuditEntity, CourseLocaleField, CourseSetting, EnrollmentStatus, ImportKind, QuestionStatus, QuestionType, RenewalStatus, RenewalSummary, SelectOption, StatusTone, UserFormError, UserFormField } from "@/types/admin";
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
  renewals: "/admin/renewals",
  login: adminLoginPath
}

export const adminNav: AdminNavGroup[] = [
  { label: "Overview", items: [{ route: "dashboard", label: "Dashboard", icon: LayoutDashboard }] },
  {
    label: "Students",
    items: [
      { route: "users", label: "Users", icon: Users },
      { route: "importData", label: "Import", icon: FileUp },
      { route: "renewals", label: "Renewals", icon: CalendarClock }
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
export const adminSkeletonRows = 8;

export const adminSearchParam = "q";

export const adminPageParam = "page";

export const adminAttemptParam = "attempt";

export const adminFilterAll = "all";

export const adminSearchDebounceMs = 300;

export const userListFilters: AdminTableFilter[] = [
  { param: "course", label: "Course", allLabel: "All courses", options: courseOptions },
  { param: "status", label: "Status", allLabel: "All statuses", options: enrollmentStatusOptions }
];

export const renewalWindowDays = 90;

export const renewalStatusLabels: Record<RenewalStatus, string> = {
  expiring: "Expiring soon",
  expired: "Expired"
}

export const renewalStatusTones: Record<RenewalStatus, StatusTone> = {
  expiring: "warning",
  expired: "danger"
}

export const renewalStatusOptions: SelectOption[] = Object.entries(renewalStatusLabels).map(([value, label]) => ({ value, label }));

export const renewalListFilters: AdminTableFilter[] = [
  { param: "status", label: "Status", allLabel: "All statuses", options: renewalStatusOptions },
  { param: "course", label: "Course", allLabel: "All courses", options: courseOptions }
];

export const renewalSummaries: RenewalSummary[] = [
  { status: "expiring", label: `Expiring in the next ${renewalWindowDays} days`, icon: Clock },
  { status: "expired", label: "Expired", icon: CircleAlert }
];

export const renewalRelativeFormat = new Intl.RelativeTimeFormat("en-CA", { numeric: "auto" });

export const userFormErrors: Record<UserFormField, Partial<Record<UserFormError, string>>> = {
  firstName: { required: "Enter a first name." },
  lastName: { required: "Enter a last name." },
  email: { required: "Enter an email.", invalidEmail: "Enter a valid email address.", emailTaken: "Another account already uses this email." },
  course: { invalidCourse: "Choose a course.", courseLocked: "The course can't change after the student has started the exam.", inactiveCourse: "This course is inactive and can't take new enrollments." },
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
  certificateReissued: "Reissued certificate",
  courseUpdated: "Updated course",
  courseMaterialUploaded: "Uploaded course material",
  questionCreated: "Added question",
  questionUpdated: "Edited question",
  questionDeleted: "Deleted question",
  reviewCreated: "Added review",
  reviewUpdated: "Edited review",
  reviewDeleted: "Deleted review",
  usersImported: "Imported users",
  questionsImported: "Imported questions"
}

export const adminSidebarWidth = "16rem";

export const adminDateFormat = new Intl.DateTimeFormat("en-CA", { dateStyle: "medium", timeZone: "UTC" });

export const adminTimestampDateFormat = new Intl.DateTimeFormat("en-CA", { dateStyle: "medium", timeZone: businessTimeZone });

export const adminDateTimeFormat = new Intl.DateTimeFormat("en-CA", { dateStyle: "medium", timeStyle: "short", timeZone: businessTimeZone });

export const adminLoginNotices: Record<LoginFailureStatus, string> = {
  invalidCredentials: "The email or password is incorrect, or this account doesn't have admin access.",
  deactivated: "This account has been deactivated.",
  rateLimited: "Too many attempts. Wait 15 minutes, then try again.",
  failed: "Something went wrong. Please try again."
}

export const adminLoginFields: AdminLoginField[] = [
  { name: "email", label: "Email", type: "email", autoComplete: "username" },
  { name: "password", label: "Password", type: "password", autoComplete: "current-password" }
];

export const adminPasswordToggleLabels = {
  show: "Show password",
  hide: "Hide password"
}

export const adminLoginFieldErrors: Record<LoginField, Partial<Record<LoginFieldError, string>>> = {
  email: { required: "Enter your email.", invalidEmail: "Enter a valid email address." },
  password: { required: "Enter your password." }
}

export const registrationsChartConfig = {
  registrations: { label: "Registrations", color: "var(--chart-1)" }
} satisfies ChartConfig;

export const passRateChartConfig = {
  passRate: { label: "Pass rate", color: "var(--chart-2)" }
} satisfies ChartConfig;

export const noRatingValue = "none";

export const ratingOptions: SelectOption[] = [
  ...[5, 4, 3, 2, 1].map((rating) => ({ value: String(rating), label: `${rating} out of 5` })),
  { value: noRatingValue, label: "No rating" }
];

export const auditEntityFilter = "entity";

export const auditEntityLabels: Record<AuditEntity, string> = {
  user: "User",
  certificate: "Certificate",
  course: "Course",
  question: "Question",
  review: "Review",
  import: "Import"
}

export const auditEntityOptions: SelectOption[] = Object.entries(auditEntityLabels).map(([value, label]) => ({ value, label }));

export const auditLogFilters: AdminTableFilter[] = [
  { param: auditEntityFilter, label: "Record type", allLabel: "All records", options: auditEntityOptions }
];

export const auditLogSelect = {
  id: true,
  action: true,
  entity: true,
  entityId: true,
  entityLabel: true,
  details: true,
  createdAt: true,
  admin: { select: { firstName: true, lastName: true, email: true } }
} satisfies Prisma.AuditLogSelect;

export const removedAdminLabel = "Removed admin";

export const dashboardAttemptSelect = {
  id: true,
  startedAt: true,
  submittedAt: true,
  correctCount: true,
  questionCount: true,
  passed: true,
  enrollment: { select: { locale: true, user: { select: { id: true, firstName: true, lastName: true } }, courseLocale: { select: { course: { select: { code: true } } } } } }
} satisfies Prisma.AttemptSelect;

export const dashboardRecentAttempts = 6;

export const dashboardMonths = 12;

export const dashboardMonthFormat = new Intl.DateTimeFormat("en-CA", { month: "short", year: "2-digit", timeZone: "UTC" });

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
  welcomeSent: "This student hasn't set a password yet, so they were sent the welcome email.",
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

export const adminCourseSelect = {
  id: true,
  code: true,
  passMarkPct: true,
  questionsPerAttempt: true,
  timeLimitMinutes: true,
  maxAttempts: true,
  certificateValidMonths: true,
  priceCents: true,
  durationHours: true,
  lectureMinutes: true,
  shuffleQuestions: true,
  shuffleAnswers: true,
  active: true,
  locales: { select: { locale: true, name: true, description: true, lectureTitle: true, outcomes: true, materialFileKey: true, certificateCode: true, questions: { select: { active: true } } } }
} satisfies Prisma.CourseSelect;

export const adminQuestionSelect = {
  id: true,
  locale: true,
  type: true,
  prompt: true,
  options: true,
  correctIndex: true,
  explanation: true,
  sortOrder: true,
  active: true,
  courseLocale: { select: { course: { select: { code: true } } } }
} satisfies Prisma.QuestionSelect;

export const courseSettingLabels: Record<CourseSetting, string> = {
  passMarkPct: "Pass mark",
  questionsPerAttempt: "Questions per attempt",
  timeLimitMinutes: "Time limit",
  maxAttempts: "Maximum attempts",
  certificateValidMonths: "Certificate validity",
  durationHours: "Course duration",
  lectureMinutes: "Lecture length"
}

export const courseSettings = Object.keys(courseSettingLabels) as CourseSetting[];

export const courseLocaleFieldLabels: Record<CourseLocaleField, string> = {
  name: "name",
  description: "description",
  lectureTitle: "lecture title",
  outcomes: "learning outcomes",
  certificateCode: "certificate code"
}

export const courseLocaleFields = Object.keys(courseLocaleFieldLabels) as CourseLocaleField[];

export const courseSettingUnits: Record<CourseSetting, string> = {
  passMarkPct: "%",
  questionsPerAttempt: "",
  timeLimitMinutes: " min",
  maxAttempts: "",
  certificateValidMonths: " months",
  durationHours: " hours",
  lectureMinutes: " min"
}

export const courseSettingRanges: Record<CourseSetting, { min: number; max: number }> = {
  passMarkPct: { min: 1, max: 100 },
  questionsPerAttempt: { min: 1, max: 200 },
  timeLimitMinutes: { min: 1, max: 600 },
  maxAttempts: { min: 1, max: 20 },
  certificateValidMonths: { min: 1, max: 120 },
  durationHours: { min: 1, max: 200 },
  lectureMinutes: { min: 1, max: 600 }
}

export const coursePriceMaxCents = 9_999_999;

export const courseFormFailedNotice = "The course couldn't be saved. Please try again.";

export const questionFormFailedNotice = "The question couldn't be saved. Please try again.";

export const minQuestionOptions = 2;

export const maxQuestionOptions = 4;

export const trueFalseOptions: Record<Locale, string[]> = {
  en: ["True", "False"],
  fr: ["Vrai", "Faux"]
}

export const questionStatusLabels: Record<QuestionStatus, string> = {
  active: "Active",
  hidden: "Hidden"
}

export const questionListFilters: AdminTableFilter[] = [
  { param: "status", label: "Status", allLabel: "All questions", options: Object.entries(questionStatusLabels).map(([value, label]) => ({ value, label })) }
];

export const adminCourseMaterialHref = "/api/admin/course-material";

export const courseMaterialMaxBytes = 100 * 1024 * 1024;

export const courseMaterialContentType = "application/pdf";

export const courseActionMessages = {
  notFound: "This course no longer exists.",
  notPdf: "Choose a PDF file.",
  tooLarge: "The PDF must be smaller than 100 MB.",
  uploadFailed: "The PDF couldn't be uploaded. Please try again.",
  uploaded: "Course material updated.",
  failed: "Something went wrong. Please try again."
}

export const questionActionMessages = {
  notFound: "This question no longer exists.",
  failed: "Something went wrong. Please try again."
}

export const questionCsvBom = "\uFEFF";

export const adminReviewSelect = {
  id: true,
  author: true,
  roleCompany: true,
  locale: true,
  body: true,
  rating: true,
  published: true,
  sortOrder: true
} satisfies Prisma.ReviewSelect;

export const reviewFormFailedNotice = "The review couldn't be saved. Please try again.";

export const reviewActionMessages = {
  notFound: "This review no longer exists.",
  failed: "Something went wrong. Please try again."
}

export const importMaxRows = 5000;

export const importMaxBytes = 900 * 1024;

export const importPreviewLimit = 500;

export const importMessages = {
  empty: "This file is empty.",
  tooLarge: "This file is larger than 900 KB. Split it into smaller files.",
  tooManyRows: `This file has more than ${importMaxRows.toLocaleString("en-CA")} rows. Split it into smaller files.`,
  unreadable: "This file couldn't be read. Save it as CSV and try again.",
  noRows: "There are no rows to import below the column names.",
  noBank: "Choose a question bank.",
  nothingReady: "There are no rows without problems to import.",
  changed: "Some rows changed since the preview. Check the preview again before importing.",
  failed: "The import failed and nothing was added. Please try again."
}

export const trueFalseImportWords = new Set(["true", "false", "t", "f", "vrai", "faux", "v"]);

export const trueImportWords = new Set(["true", "t", "vrai", "v"]);

export const questionImportLetters = ["A", "B", "C", "D"];

export const languageAliases: Record<string, Locale> = {
  en: "en",
  english: "en",
  anglais: "en",
  fr: "fr",
  french: "fr",
  "français": "fr",
  francais: "fr"
}
