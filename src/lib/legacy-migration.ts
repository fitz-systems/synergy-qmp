import pg from "pg";

import type { MigrationPlan } from "@/types/legacy-migration";
import { legacyAccountProvider, legacyAttemptWindowMinutes, legacyCourses, legacyMd5Pattern, legacyPassMarkPct } from "../constants/legacy-migration.ts";
import { legacyTimestamp } from "./helpers/legacy-dump.ts";
import { organizationKey } from "./helpers/legacy-migration.ts";

type Column = [name: string, type: string];

const insertBatchSize = 5000;

const migratedStudents = `
  SELECT u.id FROM "synergy"."users" u
  WHERE u.role = 'student' AND EXISTS (
    SELECT 1 FROM "synergy"."enrollments" e WHERE e.user_id = u.id AND e.legacy_user_id IS NOT NULL
  )`;

export interface WriteOptions {
  force: boolean
}

export async function writeMigrationPlan(connectionString: string, plan: MigrationPlan, options: WriteOptions) {
  const client = new pg.Client({ connectionString });
  await client.connect();
  try {
    await client.query("BEGIN");
    await assertSafeToReplace(client, options);
    await assertNoEmailConflicts(client, plan);
    if (plan.questions) await assertQuestionsReplaceable(client, plan, options);
    const removed = await client.query(`DELETE FROM "synergy"."users" WHERE id IN (${migratedStudents})`);
    const courseIds = await writeCourses(client, plan);
    const organizationIds = await writeOrganizations(client, plan);
    const questionIds = plan.questions ? await writeQuestions(client, plan, courseIds) : [];
    await writePeople(client, plan, courseIds, organizationIds, questionIds);
    await client.query("COMMIT");
    return { removedUsers: removed.rowCount ?? 0 }
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    await client.end();
  }
}

async function assertSafeToReplace(client: pg.Client, options: WriteOptions) {
  const { rows } = await client.query<{ sessions: number; upgraded: number }>(`
    SELECT
      (SELECT count(*)::int FROM "synergy"."sessions" WHERE user_id IN (${migratedStudents})) AS sessions,
      (SELECT count(*)::int FROM "synergy"."accounts" WHERE user_id IN (${migratedStudents}) AND password !~* '${legacyMd5Pattern.source}') AS upgraded`);
  const { sessions, upgraded } = rows[0];
  if ((sessions || upgraded) && !options.force) {
    throw new Error(`Migrated students have used the new site (${sessions} sessions, ${upgraded} upgraded passwords). Re-run with --force to replace them anyway.`);
  }
}

function questionBanks(plan: MigrationPlan) {
  const banks = new Map((plan.questions ?? []).map((question) => [`${question.code}-${question.locale}`, { code: question.code, locale: question.locale }]));
  return [...banks.values()];
}

async function assertQuestionsReplaceable(client: pg.Client, plan: MigrationPlan, options: WriteOptions) {
  const banks = questionBanks(plan);
  const { rows } = await client.query<{ answers: number }>(`
    SELECT count(*)::int AS answers
    FROM "synergy"."attempt_answers" aa
    JOIN "synergy"."questions" q ON q.id = aa.question_id
    JOIN "synergy"."courses" c ON c.id = q.course_id
    JOIN "synergy"."attempts" a ON a.id = aa.attempt_id
    JOIN "synergy"."enrollments" e ON e.id = a.enrollment_id
    WHERE e.legacy_user_id IS NULL AND (c.code, q.locale) IN (SELECT * FROM unnest($1::text[], $2::text[]))`,
  [banks.map((bank) => bank.code), banks.map((bank) => bank.locale)]);
  if (rows[0].answers && !options.force) {
    throw new Error(`${rows[0].answers} answers from exams taken on the new site use the current questions. Re-run with --force to replace the question banks anyway.`);
  }
}

async function writeQuestions(client: pg.Client, plan: MigrationPlan, courseIds: Map<string, number>) {
  const questions = plan.questions!;
  for (const bank of questionBanks(plan)) {
    await client.query(`DELETE FROM "synergy"."questions" WHERE course_id = $1 AND locale = $2`, [courseIds.get(bank.code), bank.locale]);
  }
  const ids = await nextIds(client, "questions", questions.length);
  const now = new Date().toISOString();
  await insertRows(client, "questions", [
    ["id", "int"], ["course_id", "int"], ["locale", "text"], ["type", "text"], ["prompt", "text"],
    ["options", "text[]"], ["correct_index", "int"], ["sort_order", "int"], ["updated_at", "timestamptz"]
  ], questions.map((question, index) => [
    ids[index], courseIds.get(question.code)!, question.locale, question.type, question.prompt,
    question.options, question.correctIndex, question.sortOrder, now
  ]));
  return ids;
}

async function assertNoEmailConflicts(client: pg.Client, plan: MigrationPlan) {
  const { rows } = await client.query<{ email: string }>(
    `SELECT email FROM "synergy"."users" WHERE email = ANY($1::text[]) AND id NOT IN (${migratedStudents})`,
    [plan.people.map((person) => person.email)]
  );
  if (rows.length) throw new Error(`These emails already belong to accounts created on the new site: ${rows.map((row) => row.email).join(", ")}`);
}

async function writeCourses(client: pg.Client, plan: MigrationPlan) {
  const courseIds = new Map<string, number>();
  for (const course of plan.courses) {
    await client.query(
      `INSERT INTO "synergy"."courses" (code, questions_per_attempt, updated_at) VALUES ($1, $2, now()) ON CONFLICT (code) DO NOTHING`,
      [course.code, course.questionsPerAttempt]
    );
    const { rows } = await client.query<{ id: number }>(`SELECT id FROM "synergy"."courses" WHERE code = $1`, [course.code]);
    courseIds.set(course.code, rows[0].id);
    for (const locale of course.locales) {
      await client.query(
        `INSERT INTO "synergy"."course_locales" (course_id, locale, name, description, certificate_code) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (course_id, locale) DO NOTHING`,
        [rows[0].id, locale.locale, locale.name, locale.description, locale.certificateCode]
      );
    }
  }
  return courseIds;
}

async function writeOrganizations(client: pg.Client, plan: MigrationPlan) {
  const existing = await client.query<{ id: number; name: string }>(`SELECT id, name FROM "synergy"."organizations"`);
  const known = new Set(existing.rows.map((row) => organizationKey(row.name)));
  const missing = plan.organizations.filter((name) => !known.has(organizationKey(name)));
  await insertRows(client, "organizations", [["name", "text"]], missing.map((name) => [name]));
  const { rows } = await client.query<{ id: number; name: string }>(`SELECT id, name FROM "synergy"."organizations"`);
  return new Map(rows.map((row) => [organizationKey(row.name), row.id]));
}

async function writePeople(client: pg.Client, plan: MigrationPlan, courseIds: Map<string, number>, organizationIds: Map<string, number>, questionIds: number[]) {
  const userIds = await nextIds(client, "users", plan.people.length);
  const accountIds = await nextIds(client, "accounts", plan.people.length);
  const now = new Date().toISOString();

  await insertRows(client, "users", [
    ["id", "int"], ["name", "text"], ["email", "text"], ["first_name", "text"], ["last_name", "text"],
    ["preferred_locale", "text"], ["created_at", "timestamptz"], ["updated_at", "timestamptz"]
  ], plan.people.map((person, index) => [
    userIds[index], `${person.firstName} ${person.lastName}`.trim(), person.email, person.firstName, person.lastName,
    person.preferredLocale, legacyTimestamp(person.createdAt).toISOString(), now
  ]));

  await insertRows(client, "accounts", [
    ["id", "int"], ["user_id", "int"], ["account_id", "text"], ["provider_id", "text"], ["password", "text"], ["created_at", "timestamptz"], ["updated_at", "timestamptz"]
  ], plan.people.map((person, index) => [
    accountIds[index], userIds[index], String(userIds[index]), legacyAccountProvider, person.passwordHash, now, now
  ]));

  const rows = plan.people.flatMap((person, index) => person.rows.map((row) => ({ row, userId: userIds[index] })));
  const enrollmentIds = await nextIds(client, "enrollments", rows.length);
  const enrollmentByLegacyId = new Map(rows.map(({ row }, index) => [row.id, enrollmentIds[index]]));
  await insertRows(client, "enrollments", [
    ["id", "int"], ["user_id", "int"], ["course_id", "int"], ["locale", "text"], ["organization_id", "int"],
    ["paid", "bool"], ["passed_on", "date"], ["notes", "text"], ["legacy_user_id", "int"], ["created_at", "timestamptz"]
  ], rows.map(({ row, userId }, index) => {
    const { code, locale } = legacyCourses[row.course];
    return [
      enrollmentIds[index], userId, courseIds.get(code)!, locale, row.company ? organizationIds.get(organizationKey(row.company))! : null,
      row.paid, row.passedOn, row.notes, row.id, legacyTimestamp(row.created).toISOString()
    ]
  }));

  const attemptIds = await nextIds(client, "attempts", plan.attempts.length);
  await insertRows(client, "attempts", [
    ["id", "int"], ["enrollment_id", "int"], ["started_at", "timestamptz"], ["expires_at", "timestamptz"], ["submitted_at", "timestamptz"],
    ["pass_mark_pct", "int"], ["question_count", "int"], ["correct_count", "int"], ["passed", "bool"]
  ], plan.attempts.map((attempt, index) => {
    const submitted = legacyTimestamp(attempt.submittedAt);
    const expires = new Date(submitted.getTime() + legacyAttemptWindowMinutes * 60_000);
    return [
      attemptIds[index], enrollmentByLegacyId.get(attempt.legacyUserId)!, submitted.toISOString(), expires.toISOString(), submitted.toISOString(),
      legacyPassMarkPct, attempt.questionCount, attempt.correctCount, attempt.passed
    ]
  }));

  await insertRows(client, "attempt_answers", [
    ["attempt_id", "int"], ["question_id", "int"], ["sort_order", "int"], ["question_text", "text"], ["options", "text[]"],
    ["selected_index", "int"], ["answer_text", "text"], ["correct_answer_text", "text"], ["is_correct", "bool"]
  ], plan.attempts.flatMap((attempt, index) => attempt.answers.map((answer, order) => [
    attemptIds[index], answer.questionIndex === null ? null : questionIds[answer.questionIndex], order, answer.question, answer.options,
    answer.selectedIndex, answer.answer, answer.correctAnswerText, answer.isCorrect
  ])));
}

async function nextIds(client: pg.Client, table: string, count: number) {
  const { rows } = await client.query<{ id: number }>(
    `SELECT nextval(pg_get_serial_sequence('"synergy"."${table}"', 'id'))::int AS id FROM generate_series(1, $1)`,
    [count]
  );
  return rows.map((row) => row.id);
}

async function insertRows(client: pg.Client, table: string, columns: Column[], rows: unknown[][]) {
  const names = columns.map(([name]) => `"${name}"`).join(", ");
  const arrays = columns.map(([, type], index) => `$${index + 1}::${type === "text[]" ? "text" : type}[]`).join(", ");
  const aliases = columns.map((_, index) => `c${index}`).join(", ");
  const selects = columns.map(([, type], index) => type === "text[]" ? `ARRAY(SELECT json_array_elements_text(c${index}::json))` : `c${index}`).join(", ");
  for (let start = 0; start < rows.length; start += insertBatchSize) {
    const batch = rows.slice(start, start + insertBatchSize);
    const values = columns.map(([, type], index) => batch.map((row) => type === "text[]" ? JSON.stringify(row[index]) : row[index]));
    await client.query(`INSERT INTO "synergy"."${table}" (${names}) SELECT ${selects} FROM unnest(${arrays}) AS t(${aliases})`, values);
  }
}

export async function countMigratedRows(connectionString: string) {
  const client = new pg.Client({ connectionString });
  await client.connect();
  try {
    const { rows } = await client.query<Record<string, number>>(`
      SELECT
        (SELECT count(*)::int FROM "synergy"."users" WHERE id IN (${migratedStudents})) AS users,
        (SELECT count(*)::int FROM "synergy"."accounts" WHERE user_id IN (${migratedStudents})) AS accounts,
        (SELECT count(*)::int FROM "synergy"."enrollments" WHERE legacy_user_id IS NOT NULL) AS enrollments,
        (SELECT count(*)::int FROM "synergy"."organizations") AS organizations,
        (SELECT count(*)::int FROM "synergy"."attempts" a JOIN "synergy"."enrollments" e ON e.id = a.enrollment_id WHERE e.legacy_user_id IS NOT NULL) AS attempts,
        (SELECT count(*)::int FROM "synergy"."attempt_answers" aa JOIN "synergy"."attempts" a ON a.id = aa.attempt_id JOIN "synergy"."enrollments" e ON e.id = a.enrollment_id WHERE e.legacy_user_id IS NOT NULL) AS answers,
        (SELECT count(*)::int FROM "synergy"."course_locales") AS course_locales,
        (SELECT count(*)::int FROM "synergy"."questions") AS questions`);
    return rows[0];
  } finally {
    await client.end();
  }
}
