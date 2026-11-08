import type { StudentAttemptRecord, StudentEnrollment, StudentEnrollmentRecord } from "@/types/student";

export function attemptRecord(overrides: Partial<StudentAttemptRecord> = {}): StudentAttemptRecord {
  return {
    id: 1,
    startedAt: new Date("2026-01-10T10:00:00Z"),
    expiresAt: new Date("2026-01-10T12:00:00Z"),
    submittedAt: new Date("2026-01-10T11:00:00Z"),
    passMarkPct: 75,
    correctCount: 10,
    questionCount: 20,
    passed: false,
    ...overrides
  }
}

export function enrollmentRecord(overrides: Partial<StudentEnrollmentRecord> = {}, maxAttempts: number | null = 3): StudentEnrollmentRecord {
  return {
    id: 1,
    courseId: 1,
    locale: "en",
    createdAt: new Date("2026-01-01T00:00:00Z"),
    passedOn: null,
    attemptsResetAt: null,
    certificateNumber: null,
    courseLocale: {
      name: "Ground",
      certificateCode: "SQMP-2020-111",
      materialFileKey: "course-material/ground-en.pdf",
      course: { code: "ground", passMarkPct: 75, questionsPerAttempt: 20, timeLimitMinutes: 120, maxAttempts, shuffleQuestions: true, shuffleAnswers: true, certificateValidMonths: 36 }
    },
    attempts: [],
    ...overrides
  }
}

export function enrollment(overrides: Partial<StudentEnrollment> = {}): StudentEnrollment {
  return {
    courseCode: "ground",
    courseLocale: "en",
    enrolledOn: "2026-01-01T00:00:00.000Z",
    examStatus: "notStarted",
    attemptsUsed: 0,
    maxAttempts: 3,
    examInProgress: false,
    materialAvailable: true,
    ...overrides
  }
}
