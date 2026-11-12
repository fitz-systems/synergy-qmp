import { adminPageSize, renewalWindowDays } from "@/constants/admin";
import { adminRole } from "@/constants/auth";
import { Prisma } from "@/generated/prisma/client";
import { adminRenewalRow, likePattern, pageCount } from "@/lib/helpers/admin";
import { businessDate } from "@/lib/helpers/exam";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import type { AdminRenewalPage, AdminRenewalQuery, AdminRenewalRecord, RenewalStatus } from "@/types/admin";

function renewalSql(query: AdminRenewalQuery, day: string, withStatus: boolean) {
  const conditions = [Prisma.sql`valid_until <= ${day}::date + ${renewalWindowDays}::int`];
  if (query.search) {
    const pattern = likePattern(query.search);
    conditions.push(Prisma.sql`((first_name || ' ' || last_name) ILIKE ${pattern} OR email ILIKE ${pattern} OR company ILIKE ${pattern})`);
  }
  if (query.course) conditions.push(Prisma.sql`course_code = ${query.course}`);
  if (withStatus && query.status) conditions.push(Prisma.sql`status = ${query.status}`);

  return Prisma.sql`
    WITH latest AS (
      SELECT DISTINCT ON (user_id, course_id) id, user_id, course_id, locale, organization_id, passed_on
      FROM "synergy"."enrollments"
      WHERE passed_on IS NOT NULL
      ORDER BY user_id, course_id, passed_on DESC, id DESC
    ), certificates AS (
      SELECT
        l.id AS enrollment_id, u.id AS user_id, u.first_name, u.last_name, u.email,
        o.name AS company, c.code AS course_code, l.locale,
        (l.passed_on + make_interval(months => c.certificate_valid_months))::date AS valid_until
      FROM latest l
      JOIN "synergy"."users" u ON u.id = l.user_id
      JOIN "synergy"."courses" c ON c.id = l.course_id
      LEFT JOIN "synergy"."organizations" o ON o.id = l.organization_id
      WHERE u.role <> ${adminRole} AND u.active
    ), renewals AS (
      SELECT *, CASE WHEN valid_until < ${day}::date THEN 'expired' ELSE 'expiring' END AS status
      FROM certificates
    )
    SELECT enrollment_id, user_id, first_name, last_name, email, company, course_code, locale, valid_until, status
    FROM renewals
    WHERE ${Prisma.join(conditions, " AND ")}`;
}

export async function getAdminRenewalPage(query: AdminRenewalQuery): Promise<AdminRenewalPage> {
  await requireAdmin();
  const today = businessDate(new Date());
  const day = today.toISOString().slice(0, 10);
  const sql = renewalSql(query, day, true);
  const statusCounts = await prisma.$queryRaw<{ status: RenewalStatus; total: number }[]>`SELECT status, count(*)::int AS total FROM (${renewalSql(query, day, false)}) matches GROUP BY status`;
  const counts: Record<RenewalStatus, number> = { expiring: 0, expired: 0 }
  for (const row of statusCounts) counts[row.status] = row.total;

  const total = query.status ? counts[query.status] : counts.expiring + counts.expired;
  const pages = pageCount(total, adminPageSize);
  const page = Math.min(query.page, pages);
  const offset = (page - 1) * adminPageSize;
  const records = await prisma.$queryRaw<AdminRenewalRecord[]>`${sql} ORDER BY status = 'expired', abs(valid_until - ${day}::date), enrollment_id LIMIT ${adminPageSize} OFFSET ${offset}`;

  return {
    rows: records.map((record) => adminRenewalRow(record, today)),
    counts,
    total,
    page,
    pageCount: pages,
    from: total === 0 ? 0 : offset + 1,
    to: offset + records.length
  }
}
