import { dashboardAttemptSelect, dashboardMonths, dashboardRecentAttempts, noDistributorValue } from "@/constants/admin";
import { adminRole } from "@/constants/auth";
import { businessTimeZone } from "@/constants/student";
import { Prisma } from "@/generated/prisma/client";
import { coursePassRates, dashboardAttempt, dashboardEnrollmentWhere, dashboardStats, monthlyRegistrations } from "@/lib/helpers/admin";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import type { AdminDashboard, AdminDashboardQuery, DashboardCountsRecord, MonthlyRegistrationsRecord, PassRateRecord } from "@/types/admin";

function scopeSql(query: AdminDashboardQuery, alias: string) {
  const column = Prisma.raw(`${alias}.organization_id`);
  const conditions = [Prisma.sql`TRUE`];
  if (query.company) conditions.push(Prisma.sql`${column} = ${query.company}`);
  if (query.distributor === noDistributorValue) {
    conditions.push(Prisma.sql`(${column} IS NULL OR ${column} IN (SELECT id FROM "synergy"."organizations" WHERE distributor_id IS NULL))`);
  } else if (query.distributor) {
    conditions.push(Prisma.sql`${column} IN (SELECT id FROM "synergy"."organizations" WHERE distributor_id = ${query.distributor})`);
  }
  return Prisma.join(conditions, " AND ");
}

function getDashboardCounts(query: AdminDashboardQuery) {
  return prisma.$queryRaw<DashboardCountsRecord[]>`
    WITH bounds AS (
      SELECT
        date_trunc('month', now() AT TIME ZONE ${businessTimeZone}) AT TIME ZONE ${businessTimeZone} AS month_start,
        date_trunc('year', now() AT TIME ZONE ${businessTimeZone})::date AS year_start
    ), latest AS (
      SELECT DISTINCT ON (user_id) user_id, organization_id
      FROM "synergy"."enrollments"
      ORDER BY user_id, created_at DESC, id DESC
    ), students AS (
      SELECT u.active
      FROM "synergy"."users" u
      LEFT JOIN latest l ON l.user_id = u.id
      WHERE u.role <> ${adminRole} AND ${scopeSql(query, "l")}
    ), scoped_enrollments AS (
      SELECT e.id, e.passed_on FROM "synergy"."enrollments" e WHERE ${scopeSql(query, "e")}
    ), scoped_attempts AS (
      SELECT a.submitted_at, a.passed FROM "synergy"."attempts" a JOIN scoped_enrollments e ON e.id = a.enrollment_id
    )
    SELECT
      (SELECT count(*)::int FROM students WHERE active) AS active_students,
      (SELECT count(*)::int FROM students WHERE NOT active) AS deactivated_students,
      (SELECT count(*)::int FROM scoped_attempts WHERE submitted_at >= bounds.month_start) AS attempts_this_month,
      (SELECT count(*)::int FROM scoped_attempts WHERE submitted_at >= bounds.month_start AND passed) AS passed_attempts_this_month,
      (SELECT count(*)::int FROM scoped_enrollments WHERE passed_on >= bounds.year_start) AS passed_this_year,
      (SELECT count(*)::int FROM scoped_enrollments WHERE passed_on IS NOT NULL) AS passed_total
    FROM bounds`;
}

function getPassRateRecords(query: AdminDashboardQuery) {
  return prisma.$queryRaw<PassRateRecord[]>`
    SELECT c.code AS course_code, e.locale, count(*)::int AS submitted, count(*) FILTER (WHERE a.passed)::int AS passed
    FROM "synergy"."attempts" a
    JOIN "synergy"."enrollments" e ON e.id = a.enrollment_id
    JOIN "synergy"."courses" c ON c.id = e.course_id
    WHERE a.submitted_at >= now() - interval '12 months' AND ${scopeSql(query, "e")}
    GROUP BY c.code, e.locale`;
}

function getRegistrationRecords(query: AdminDashboardQuery) {
  return prisma.$queryRaw<MonthlyRegistrationsRecord[]>`
    SELECT to_char(e.created_at AT TIME ZONE ${businessTimeZone}, 'YYYY-MM') AS month, count(*)::int AS registrations
    FROM "synergy"."enrollments" e
    WHERE e.created_at >= (date_trunc('month', now() AT TIME ZONE ${businessTimeZone}) - make_interval(months => ${dashboardMonths - 1})) AT TIME ZONE ${businessTimeZone}
      AND ${scopeSql(query, "e")}
    GROUP BY 1`;
}

function getRecentAttempts(query: AdminDashboardQuery) {
  return prisma.attempt.findMany({
    where: { submittedAt: { not: null }, passed: { not: null }, enrollment: dashboardEnrollmentWhere(query) },
    orderBy: [{ submittedAt: "desc" }, { id: "desc" }],
    take: dashboardRecentAttempts,
    select: dashboardAttemptSelect
  });
}

export async function getAdminDashboard(query: AdminDashboardQuery): Promise<AdminDashboard> {
  await requireAdmin();
  const [[counts], passRates, registrations, recent] = await Promise.all([getDashboardCounts(query), getPassRateRecords(query), getRegistrationRecords(query), getRecentAttempts(query)]);

  return {
    stats: dashboardStats(counts, passRates),
    registrations: monthlyRegistrations(registrations, new Date()),
    passRates: coursePassRates(passRates),
    recentAttempts: recent.map(dashboardAttempt)
  }
}
