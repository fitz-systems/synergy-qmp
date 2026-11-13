import { adminAnswerSelect, adminPageSize, adminUserDetailSelect } from "@/constants/admin";
import { adminRole } from "@/constants/auth";
import { studentEnrollmentSelect } from "@/constants/student";
import { Prisma } from "@/generated/prisma/client";
import { finishAbandonedAttempts } from "@/lib/attempts";
import { adminUserDetail, adminUserRow, likePattern, pageCount } from "@/lib/helpers/admin";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import type { AdminAnswer, AdminUserDetail, AdminUserListQuery, AdminUserListRecord, AdminUserPage } from "@/types/admin";

function userListSql(query: AdminUserListQuery) {
  const conditions = [Prisma.sql`role <> ${adminRole}`];
  if (query.search) {
    const pattern = likePattern(query.search);
    conditions.push(Prisma.sql`((first_name || ' ' || last_name) ILIKE ${pattern} OR email ILIKE ${pattern} OR company ILIKE ${pattern})`);
  }
  if (query.course) conditions.push(Prisma.sql`course_code = ${query.course}`);
  if (query.status) conditions.push(Prisma.sql`status = ${query.status}`);
  if (query.distributor) conditions.push(Prisma.sql`distributor_id = ${query.distributor}`);
  if (query.company) conditions.push(Prisma.sql`company_id = ${query.company}`);

  return Prisma.sql`
    WITH latest AS (
      SELECT DISTINCT ON (user_id) id, user_id, course_id, locale, organization_id, passed_on, attempts_reset_at, created_at
      FROM "synergy"."enrollments"
      ORDER BY user_id, created_at DESC, id DESC
    ), students AS (
      SELECT
        u.id, u.first_name, u.last_name, u.email, u.active, u.role,
        o.name AS company, o.id AS company_id, o.distributor_id, c.code AS course_code, l.locale, l.created_at AS enrolled_on,
        CASE
          WHEN l.id IS NULL THEN NULL
          WHEN l.passed_on IS NOT NULL THEN 'passed'
          WHEN EXISTS (SELECT 1 FROM "synergy"."attempts" a WHERE a.enrollment_id = l.id AND a.submitted_at IS NULL AND a.expires_at > now()) THEN 'inProgress'
          WHEN EXISTS (
            SELECT 1 FROM "synergy"."attempts" a
            WHERE a.enrollment_id = l.id AND a.submitted_at IS NOT NULL AND (l.attempts_reset_at IS NULL OR a.started_at > l.attempts_reset_at)
          ) THEN 'failed'
          ELSE 'notStarted'
        END AS status
      FROM "synergy"."users" u
      LEFT JOIN latest l ON l.user_id = u.id
      LEFT JOIN "synergy"."courses" c ON c.id = l.course_id
      LEFT JOIN "synergy"."organizations" o ON o.id = l.organization_id
    )
    SELECT id, first_name, last_name, email, active, company, course_code, locale, enrolled_on, status
    FROM students
    WHERE ${Prisma.join(conditions, " AND ")}`;
}

export async function getAdminUserPage(query: AdminUserListQuery): Promise<AdminUserPage> {
  await requireAdmin();
  const sql = userListSql(query);
  const [{ total }] = await prisma.$queryRaw<{ total: number }[]>`SELECT count(*)::int AS total FROM (${sql}) matches`;
  const pages = pageCount(total, adminPageSize);
  const page = Math.min(query.page, pages);
  const offset = (page - 1) * adminPageSize;
  const records = await prisma.$queryRaw<AdminUserListRecord[]>`${sql} ORDER BY enrolled_on DESC NULLS LAST, id DESC LIMIT ${adminPageSize} OFFSET ${offset}`;

  return {
    rows: records.map(adminUserRow),
    total,
    page,
    pageCount: pages,
    from: total === 0 ? 0 : offset + 1,
    to: offset + records.length
  }
}

async function finishCurrentAbandonedAttempts(userId: number) {
  const record = await prisma.enrollment.findFirst({ where: { userId }, orderBy: [{ createdAt: "desc" }, { id: "desc" }], select: studentEnrollmentSelect });
  if (record) await finishAbandonedAttempts(record, new Date());
}

export async function getAdminUserDetail(id: number): Promise<AdminUserDetail | null> {
  await requireAdmin();
  if (!Number.isInteger(id) || id <= 0) return null;
  await finishCurrentAbandonedAttempts(id);
  const record = await prisma.user.findFirst({ where: { id, role: { not: adminRole } }, select: adminUserDetailSelect });
  return record ? adminUserDetail(record, new Date()) : null;
}

export async function getAdminAttemptAnswers(userId: number, attemptId: number): Promise<AdminAnswer[]> {
  await requireAdmin();
  const answers = await prisma.attemptAnswer.findMany({
    where: { attemptId, attempt: { enrollment: { userId } } },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    select: adminAnswerSelect
  });
  return answers.map((answer) => ({ id: answer.id, question: answer.questionText, answer: answer.answerText, correctAnswer: answer.correctAnswerText, correct: answer.isCorrect }));
}
