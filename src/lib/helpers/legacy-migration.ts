import type { Locale } from "@/i18n/config";
import type { CourseContent } from "@/types/courses";
import type { AttemptSeed, CourseSeed, LegacyAnswer, LegacyDump, LegacyQuestion, LegacyUser, MigrationPlan, MigrationReport, PersonSeed, PersonSplit } from "@/types/legacy-migration";
import { legacyAttemptGapSeconds, legacyCourses, legacyMd5Pattern, legacyPassMarkPct, legacyQuestionsPerAttempt } from "../../constants/legacy-migration.ts";
import { legacyTimestamp } from "./legacy-dump.ts";
import { buildQuestionBanks, createAnswerLinker } from "./legacy-questions.ts";
import { comparableName, createTextCleaner, normalizeEmail, unprefixedEmail } from "./legacy-text.ts";

type AnswerLinker = ReturnType<typeof createAnswerLinker>["link"];

export function buildMigrationPlan(dump: LegacyDump, courseContent: CourseContent[], questionRows: LegacyQuestion[] | null): MigrationPlan {
  const cleaner = createTextCleaner();
  const users = dump.users.map((user) => cleanUser(user, cleaner.clean));
  const courses = buildCourses(dump, courseContent);
  const organizations = buildOrganizations(users);
  const { people, splits } = buildPeople(users);
  const banks = questionRows ? buildQuestionBanks(questionRows, cleaner.clean) : null;
  const linker = createAnswerLinker(banks?.questions ?? null);
  const { attempts, orphanAnswers, unusualAttemptSizes } = buildAttempts(dump.answers, users, cleaner.clean, linker.link);

  const report: MigrationReport = {
    legacyUsers: dump.users.length,
    legacyAnswers: dump.answers.length,
    people: people.length,
    mergedRows: users.length - people.length,
    splits,
    organizations: organizations.names.length,
    organizationSpellingsMerged: organizations.spellings - organizations.names.length,
    textRepairs: { mojibake: cleaner.repairs.mojibake, entities: cleaner.repairs.entities, unknownEntities: [...cleaner.repairs.unknownEntities] },
    attempts: attempts.length,
    attemptsPassed: attempts.filter((attempt) => attempt.passed).length,
    unusualAttemptSizes,
    orphanAnswers,
    questions: banks ? { banks: banks.banks, skippedRows: banks.skippedRows, ...linker.stats() } : null
  }

  return { courses, organizations: organizations.names, people, attempts, questions: banks?.questions ?? null, report }
}

function cleanUser(user: LegacyUser, clean: (value: string) => string): LegacyUser {
  if (!legacyCourses[user.course]) throw new Error(`Legacy user ${user.id} has an unknown course "${user.course}"`);
  if (!legacyMd5Pattern.test(user.password)) throw new Error(`Legacy user ${user.id} has a password that is not an MD5 hash`);
  const company = user.company ? clean(user.company) : "";
  return {
    ...user,
    firstName: clean(user.firstName),
    lastName: clean(user.lastName),
    email: normalizeEmail(user.email),
    password: user.password.toLowerCase(),
    company: company || null,
    notes: user.notes?.trim() || null
  }
}

function buildCourses(dump: LegacyDump, courseContent: CourseContent[]): CourseSeed[] {
  return courseContent.map((course) => ({
    code: course.code,
    questionsPerAttempt: legacyQuestionsPerAttempt[course.code],
    locales: (Object.keys(course.locales) as Locale[]).map((locale) => {
      const legacyCourse = `${course.code}-${locale}`;
      const certificateCode = dump.certificateCodes[legacyCourse];
      if (!certificateCode) throw new Error(`No RCEEM certificate code for ${legacyCourse}`);
      const content = course.locales[locale];
      return { locale, name: content.title, description: content.description, certificateCode }
    })
  }));
}

export function organizationKey(name: string) {
  return name.toLowerCase();
}

function buildOrganizations(users: LegacyUser[]) {
  const spellings = new Map<string, Map<string, number>>();
  for (const user of users) {
    if (!user.company) continue;
    const key = organizationKey(user.company);
    const counts = spellings.get(key) ?? new Map<string, number>();
    counts.set(user.company, (counts.get(user.company) ?? 0) + 1);
    spellings.set(key, counts);
  }
  const names = [...spellings.values()].map((counts) => [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0]);
  const spellingCount = [...spellings.values()].reduce((total, counts) => total + counts.size, 0);
  return { names, spellings: spellingCount }
}

function byCreated(a: LegacyUser, b: LegacyUser) {
  return a.created.localeCompare(b.created) || a.id - b.id;
}

function buildPeople(users: LegacyUser[]) {
  const plainEmails = new Set(users.map((user) => user.email));
  const groups = new Map<string, LegacyUser[]>();
  for (const user of users) {
    const unprefixed = unprefixedEmail(user.email);
    const key = plainEmails.has(unprefixed) ? unprefixed : user.email;
    groups.set(key, [...(groups.get(key) ?? []), user]);
  }

  const grouped = [...groups].map(([key, rows]) => {
    const sorted = [...rows].sort(byCreated);
    const clusters = clusterByPerson(sorted);
    const owner = sorted.findLast((row) => row.email === key) ?? newest(sorted);
    const primary = clusters.find((cluster) => cluster.includes(owner))!;
    return { key, clusters, primary }
  });

  const emails = new Map<LegacyUser[], string>();
  const taken = new Set(grouped.map((group) => group.key));
  for (const group of grouped) emails.set(group.primary, group.key);

  for (const group of grouped) {
    for (const cluster of group.clusters.filter((candidate) => candidate !== group.primary)) {
      const own = newest(cluster).email;
      let email = own;
      for (let n = 1; taken.has(email); n++) email = `${n}${unprefixedEmail(own)}`;
      taken.add(email);
      emails.set(cluster, email);
    }
  }

  const people: PersonSeed[] = [...emails].map(([cluster, email]) => toPerson(email, cluster));
  const splits: PersonSplit[] = grouped.filter((group) => group.clusters.length > 1).map((group) => ({
    key: group.key,
    people: group.clusters.map((cluster) => ({ email: emails.get(cluster)!, name: fullName(newest(cluster)), legacyIds: cluster.map((row) => row.id) }))
  }));

  return { people, splits }
}

function clusterByPerson(rows: LegacyUser[]) {
  const clusters: LegacyUser[][] = [];
  for (const row of rows) {
    const cluster = clusters.find((candidate) => candidate.some((member) => samePerson(member, row)));
    if (cluster) cluster.push(row);
    else clusters.push([row]);
  }
  return clusters;
}

function samePerson(a: LegacyUser, b: LegacyUser) {
  if (sameNameWords(a, b)) return true;
  return similarName(comparableName(a.lastName), comparableName(b.lastName), 1) && similarName(comparableName(a.firstName), comparableName(b.firstName), 2);
}

function sameNameWords(a: LegacyUser, b: LegacyUser) {
  const words = (user: LegacyUser) => new Set(`${user.firstName} ${user.lastName}`.split(/[\s()\-]+/).map(comparableName).filter(Boolean));
  const [first, second] = [words(a), words(b)];
  return first.size === second.size && [...first].every((word) => second.has(word));
}

function similarName(a: string, b: string, maxEdits: number) {
  if (a === b || a.includes(b) || b.includes(a)) return true;
  if (commonPrefixLength(a, b) >= 3) return true;
  return editDistance(a, b) <= maxEdits;
}

function commonPrefixLength(a: string, b: string) {
  let length = 0;
  while (length < a.length && a[length] === b[length]) length++;
  return length;
}

function editDistance(a: string, b: string) {
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) {
      current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    previous = current;
  }
  return previous[b.length];
}

function newest(rows: LegacyUser[]) {
  return rows[rows.length - 1];
}

function fullName(user: LegacyUser) {
  return `${user.firstName} ${user.lastName}`.trim();
}

function toPerson(email: string, rows: LegacyUser[]): PersonSeed {
  const latest = newest(rows);
  return {
    email,
    firstName: latest.firstName,
    lastName: latest.lastName,
    passwordHash: latest.password,
    preferredLocale: legacyCourses[latest.course].locale,
    createdAt: rows[0].created,
    rows
  }
}

function buildAttempts(answers: LegacyAnswer[], users: LegacyUser[], clean: (value: string) => string, link: AnswerLinker) {
  const usersById = new Map(users.map((user) => [user.id, user]));
  const byUser = new Map<number, LegacyAnswer[]>();
  const orphans = new Map<number, number>();
  for (const answer of answers) {
    if (!usersById.has(answer.userId)) {
      orphans.set(answer.userId, (orphans.get(answer.userId) ?? 0) + 1);
      continue;
    }
    byUser.set(answer.userId, [...(byUser.get(answer.userId) ?? []), { ...answer, question: clean(answer.question), answer: clean(answer.answer) }]);
  }

  const attempts: AttemptSeed[] = [];
  const unusualAttemptSizes: MigrationReport["unusualAttemptSizes"] = [];
  for (const [legacyUserId, userAnswers] of byUser) {
    const { code, locale } = legacyCourses[usersById.get(legacyUserId)!.course];
    const expected = legacyQuestionsPerAttempt[code];
    for (const submission of splitIntoSubmissions(userAnswers, expected)) {
      const group = submission.map((answer) => link(answer, code, locale));
      const correctCount = group.filter((answer) => answer.isCorrect).length;
      const questionCount = Math.max(expected, group.length);
      const attempt = {
        legacyUserId,
        submittedAt: submission[0].createdAt,
        answers: group,
        questionCount,
        correctCount,
        passed: Math.round((correctCount / questionCount) * 100) >= legacyPassMarkPct
      }
      attempts.push(attempt);
      if (group.length !== expected) unusualAttemptSizes.push({ legacyUserId, submittedAt: attempt.submittedAt, size: group.length, expected });
    }
  }

  const orphanAnswers = [...orphans.entries()].map(([legacyUserId, count]) => ({ legacyUserId, count }));
  return { attempts, orphanAnswers, unusualAttemptSizes }
}

function splitIntoSubmissions(answers: LegacyAnswer[], examSize: number) {
  const sorted = [...answers].sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id - b.id);
  const groups: LegacyAnswer[][] = [];
  let current: LegacyAnswer[] = [];
  let last = 0;
  for (const answer of sorted) {
    const time = legacyTimestamp(answer.createdAt).getTime();
    if (current.length && time - last > legacyAttemptGapSeconds * 1000) {
      groups.push(current);
      current = [];
    }
    current.push(answer);
    last = time;
  }
  if (current.length) groups.push(current);
  return groups.flatMap((group) => group.length > examSize ? chunk(group, examSize) : [group]);
}

function chunk<T>(items: T[], size: number) {
  return Array.from({ length: Math.ceil(items.length / size) }, (_, index) => items.slice(index * size, (index + 1) * size));
}
