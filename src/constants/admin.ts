import { BookOpen, FileUp, History, LayoutDashboard, MessageSquareQuote, Monitor, Moon, Sun, Users } from "lucide-react";
import type { ChartConfig } from "@/components/ui/chart";
import type { AdminNavGroup, AdminRoute, AdminThemeOption, EnrollmentStatus, ImportKind, QuestionType, SelectOption, StatusTone } from "@/types/admin";

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

export const adminPageSize = 10;

export const adminSidebarWidth = "16rem";

export const adminDateFormat = new Intl.DateTimeFormat("en-CA", { dateStyle: "medium", timeZone: "UTC" });

export const adminDateTimeFormat = new Intl.DateTimeFormat("en-CA", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" });

export const sampleAdmin = { name: "Sample Admin", email: "admin@example.com" }

export const registrationsChartConfig = {
  registrations: { label: "Registrations", color: "var(--chart-1)" }
} satisfies ChartConfig;

export const passRateChartConfig = {
  passRate: { label: "Pass rate (%)", color: "var(--chart-2)" }
} satisfies ChartConfig;

export const ratingOptions: SelectOption[] = [5, 4, 3, 2, 1].map((rating) => ({ value: String(rating), label: `${rating} out of 5` }));

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
