import { dashboardAttemptSelect, dashboardMonths, dashboardRecentAttempts } from "@/constants/admin";
import { adminRole } from "@/constants/auth";
import { businessTimeZone } from "@/constants/student";
import { coursePassRates, dashboardAttempt, dashboardStats, monthlyRegistrations } from "@/lib/helpers/admin";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import type { AdminDashboard, DashboardCountsRecord, MonthlyRegistrationsRecord, PassRateRecord } from "@/types/admin";

function getDashboardCounts() {
  return prisma.$queryRaw<DashboardCountsRecord[]>`
    WITH bounds AS (
      SELECT
        date_trunc('month', now() AT TIME ZONE ${businessTimeZone}) AT TIME ZONE ${businessTimeZone} AS month_start,
        date_trunc('year', now() AT TIME ZONE ${businessTimeZone})::date AS year_start
    )
    SELECT
      (SELECT count(*)::int FROM "synergy"."users" WHERE role <> ${adminRole} AND active) AS active_students,
      (SELECT count(*)::int FROM "synergy"."users" WHERE role <> ${adminRole} AND NOT active) AS deactivated_students,
      (SELECT count(*)::int FROM "synergy"."attempts" WHERE submitted_at >= bounds.month_start) AS attempts_this_month,
      (SELECT count(*)::int FROM "synergy"."attempts" WHERE submitted_at >= bounds.month_start AND passed) AS passed_attempts_this_month,
      (SELECT count(*)::int FROM "synergy"."enrollments" WHERE passed_on >= bounds.year_start) AS passed_this_year,
      (SELECT count(*)::int FROM "synergy"."enrollments" WHERE passed_on IS NOT NULL) AS passed_total
    FROM bounds`;
}

function getPassRateRecords() {
  return prisma.$queryRaw<PassRateRecord[]>`
    SELECT c.code AS course_code, e.locale, count(*)::int AS submitted, count(*) FILTER (WHERE a.passed)::int AS passed
    FROM "synergy"."attempts" a
    JOIN "synergy"."enrollments" e ON e.id = a.enrollment_id
    JOIN "synergy"."courses" c ON c.id = e.course_id
    WHERE a.submitted_at >= now() - interval '12 months'
    GROUP BY c.code, e.locale`;
}

function getRegistrationRecords() {
  return prisma.$queryRaw<MonthlyRegistrationsRecord[]>`
    SELECT to_char(created_at AT TIME ZONE ${businessTimeZone}, 'YYYY-MM') AS month, count(*)::int AS registrations
    FROM "synergy"."enrollments"
    WHERE created_at >= (date_trunc('month', now() AT TIME ZONE ${businessTimeZone}) - make_interval(months => ${dashboardMonths - 1})) AT TIME ZONE ${businessTimeZone}
    GROUP BY 1`;
}

function getRecentAttempts() {
  return prisma.attempt.findMany({
    where: { submittedAt: { not: null }, passed: { not: null } },
    orderBy: [{ submittedAt: "desc" }, { id: "desc" }],
    take: dashboardRecentAttempts,
    select: dashboardAttemptSelect
  });
}

export async function getAdminDashboard(): Promise<AdminDashboard> {
  await requireAdmin();
  const [[counts], passRates, registrations, recent] = await Promise.all([getDashboardCounts(), getPassRateRecords(), getRegistrationRecords(), getRecentAttempts()]);

  return {
    stats: dashboardStats(counts, passRates),
    registrations: monthlyRegistrations(registrations, new Date()),
    passRates: coursePassRates(passRates),
    recentAttempts: recent.map(dashboardAttempt)
  }
}
