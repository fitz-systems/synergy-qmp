import { createHash } from "node:crypto";

import { describe, expect, it } from "vitest";
import { buildMigrationPlan } from "@/lib/helpers/legacy-migration";
import type { LegacyAnswer, LegacyDump, LegacyUser } from "@/types/legacy-migration";

const md5 = (value: string) => createHash("md5").update(value).digest("hex");

const certificateCodes = { "ground-en": "SQMP-2020-111", "ground-fr": "SQMP-2020-113", "air-en": "SQMP-2020-112", "air-fr": "SQMP-2020-114" }

function user(overrides: Partial<LegacyUser> & Pick<LegacyUser, "id">): LegacyUser {
  return {
    firstName: "Jane",
    lastName: "Doe",
    email: "jane@example.com",
    password: md5("secret"),
    company: null,
    course: "ground-en",
    paid: true,
    passedOn: null,
    created: "2020-01-01 10:00:00",
    notes: null,
    ...overrides
  }
}

let nextAnswerId = 1;

function submission(userId: number, createdAt: string, size: number, correct: number): LegacyAnswer[] {
  return Array.from({ length: size }, (_, index) => ({ id: nextAnswerId++, userId, question: `Question ${index + 1}`, answer: "An answer", isCorrect: index < correct, createdAt }));
}

const users = [
  user({ id: 1, company: "Alberta Health", created: "2020-01-01 10:00:00" }),
  user({ id: 2, email: "1jane@example.com", company: "alberta health", created: "2023-01-01 10:00:00" }),
  user({ id: 3, firstName: "Bob", lastName: "Smith", email: "Shared@Example.com", course: "air-fr", created: "2021-01-01 10:00:00" }),
  user({ id: 4, firstName: "Alice", lastName: "Wong", email: "shared@example.com", course: "air-en", created: "2022-01-01 10:00:00" })
];

const dump: LegacyDump = {
  users,
  answers: [
    ...submission(1, "2020-02-01 10:00:00", 20, 15),
    ...submission(1, "2020-03-01 10:00:00", 20, 14),
    ...submission(99, "2020-04-01 10:00:00", 2, 1)
  ],
  certificateCodes
}

describe("buildMigrationPlan", () => {
  const plan = buildMigrationPlan(dump, null);

  it("folds a renewal row (digit-prefixed email) into the original student", () => {
    const jane = plan.people.find((person) => person.email === "jane@example.com")!;
    expect(jane.rows.map((row) => row.id)).toEqual([1, 2]);
    expect(plan.report.mergedRows).toBe(1);
  });

  it("splits different people who shared one email address", () => {
    const shared = plan.people.filter((person) => person.email.endsWith("shared@example.com"));
    expect(shared.map((person) => `${person.firstName} ${person.email}`).sort()).toEqual(["Alice shared@example.com", "Bob 1shared@example.com"]);
    expect(plan.report.splits).toHaveLength(1);
  });

  it("normalises email case and keeps the MD5 hash as the password", () => {
    expect(plan.people.every((person) => person.email === person.email.toLowerCase())).toBe(true);
    expect(plan.people.find((person) => person.email === "jane@example.com")!.passwordHash).toBe(md5("secret"));
  });

  it("sets the preferred language from the course", () => {
    expect(plan.people.find((person) => person.firstName === "Bob")!.preferredLocale).toBe("fr");
  });

  it("merges organisation names that differ only in case", () => {
    expect(plan.organizations).toEqual(["Alberta Health"]);
    expect(plan.report.organizationSpellingsMerged).toBe(1);
  });

  it("groups answers into attempts and scores them at 75%", () => {
    expect(plan.attempts.map((attempt) => [attempt.correctCount, attempt.questionCount, attempt.passed])).toEqual([[15, 20, true], [14, 20, false]]);
    expect(plan.report.attemptsPassed).toBe(1);
  });

  it("reports answers from deleted users instead of importing them", () => {
    expect(plan.report.orphanAnswers).toEqual([{ legacyUserId: 99, count: 2 }]);
  });

  it("attaches the RCEEM certificate code to each course language", () => {
    const ground = plan.courses.find((course) => course.code === "ground")!;
    expect(ground.locales.find((locale) => locale.locale === "en")!.certificateCode).toBe("SQMP-2020-111");
  });

  it("refuses to run on data it doesn't understand", () => {
    expect(() => buildMigrationPlan({ ...dump, users: [user({ id: 5, course: "boat-en" })] }, null)).toThrow(/unknown course/);
    expect(() => buildMigrationPlan({ ...dump, users: [user({ id: 6, password: "plaintext" })] }, null)).toThrow(/not an MD5 hash/);
    expect(() => buildMigrationPlan({ ...dump, certificateCodes: {} }, null)).toThrow(/RCEEM/);
  });
});
