import { describe, expect, it } from "vitest";
import { attemptsLeft, canStartAttempt, canTakeExam, countedAttempts, studentCourse } from "@/lib/helpers/student";
import { attemptRecord, enrollment, enrollmentRecord } from "../fixtures/enrollment";

const now = new Date("2026-02-01T12:00:00Z");

describe("attemptsLeft", () => {
  it("counts down from the course maximum and never goes negative", () => {
    expect(attemptsLeft(enrollment({ attemptsUsed: 1 }))).toBe(2);
    expect(attemptsLeft(enrollment({ attemptsUsed: 5 }))).toBe(0);
  });

  it("is unlimited when the course has no maximum", () => {
    expect(attemptsLeft(enrollment({ maxAttempts: null, attemptsUsed: 10 }))).toBeNull();
  });
});

describe("canTakeExam", () => {
  it("blocks students who have passed", () => {
    expect(canTakeExam(enrollment({ examStatus: "passed" }))).toBe(false);
  });

  it("blocks students who are out of attempts", () => {
    expect(canTakeExam(enrollment({ examStatus: "failed", attemptsUsed: 3 }))).toBe(false);
  });

  it("lets a student resume an attempt in progress even when it was their last", () => {
    expect(canTakeExam(enrollment({ attemptsUsed: 3, examInProgress: true }))).toBe(true);
  });
});

describe("countedAttempts and canStartAttempt", () => {
  const attempts = [
    attemptRecord({ id: 1, startedAt: new Date("2026-01-10T10:00:00Z") }),
    attemptRecord({ id: 2, startedAt: new Date("2026-01-11T10:00:00Z") }),
    attemptRecord({ id: 3, startedAt: new Date("2026-01-12T10:00:00Z") })
  ];

  it("stops a student after the maximum number of attempts", () => {
    expect(canStartAttempt(enrollmentRecord({ attempts }))).toBe(false);
    expect(canStartAttempt(enrollmentRecord({ attempts: attempts.slice(0, 2) }))).toBe(true);
  });

  it("only counts attempts started after an admin reset", () => {
    const record = enrollmentRecord({ attempts, attemptsResetAt: new Date("2026-01-11T12:00:00Z") });
    expect(countedAttempts(record).map((attempt) => attempt.id)).toEqual([3]);
    expect(canStartAttempt(record)).toBe(true);
  });

  it("blocks a student who has already passed", () => {
    expect(canStartAttempt(enrollmentRecord({ passedOn: new Date("2026-01-12T00:00:00Z") }))).toBe(false);
  });

  it("allows unlimited attempts when the course has no maximum", () => {
    expect(canStartAttempt(enrollmentRecord({ attempts }, null))).toBe(true);
  });
});

describe("studentCourse", () => {
  it("reports a failed exam with the attempts used", () => {
    const record = enrollmentRecord({ attempts: [attemptRecord({ id: 1 }), attemptRecord({ id: 2, startedAt: new Date("2026-01-11T10:00:00Z") })] });
    const { enrollment: result } = studentCourse(record, "ground", "en", now);
    expect(result.examStatus).toBe("failed");
    expect(result.attemptsUsed).toBe(2);
    expect(result.examInProgress).toBe(false);
  });

  it("reports an open attempt as in progress", () => {
    const open = attemptRecord({ submittedAt: null, startedAt: new Date("2026-02-01T11:30:00Z"), expiresAt: new Date("2026-02-01T13:30:00Z"), correctCount: null, passed: null });
    expect(studentCourse(enrollmentRecord({ attempts: [open] }), "ground", "en", now).enrollment.examInProgress).toBe(true);
  });

  it("reports a pass with the score from the passing attempt", () => {
    const passing = attemptRecord({ correctCount: 18, questionCount: 20, passed: true });
    const { enrollment: result } = studentCourse(enrollmentRecord({ passedOn: new Date("2026-01-10T00:00:00Z"), attempts: [passing] }), "ground", "en", now);
    expect(result.examStatus).toBe("passed");
    expect(result.scorePct).toBe(90);
  });
});
