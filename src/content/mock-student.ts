import type { Locale } from "@/i18n/config";
import type { ExamAttempt, ExamQuestion, ExamResult, ExamSettings, MockStudentScenario, StudentAccount, StudentCertificate, StudentEnrollment } from "@/types/student";

// Todo: Placeholder data for designing the student area; replace with the signed-in student's records once auth and the migration are wired up
export const mockStudentAccount: StudentAccount = {
  firstName: "Jordan",
  lastName: "Tremblay",
  email: "jordan.tremblay@example.com"
}

const mockScenario = "notStarted" as MockStudentScenario;

const scenarioEnrollments: Record<MockStudentScenario, StudentEnrollment> = {
  notStarted: { courseCode: "ground", enrolledOn: "2026-10-28", examStatus: "notStarted", attemptsUsed: 0, maxAttempts: 3 },
  failed: { courseCode: "ground", enrolledOn: "2026-10-28", examStatus: "failed", attemptsUsed: 1, maxAttempts: 3 },
  noAttemptsLeft: { courseCode: "ground", enrolledOn: "2026-10-28", examStatus: "failed", attemptsUsed: 3, maxAttempts: 3 },
  unlimitedAttempts: { courseCode: "ground", enrolledOn: "2026-10-28", examStatus: "failed", attemptsUsed: 4, maxAttempts: null },
  passed: { courseCode: "ground", enrolledOn: "2026-10-28", examStatus: "passed", attemptsUsed: 1, maxAttempts: 3, passedOn: "2026-11-05", scorePct: 90 }
}

export const mockEnrollment = scenarioEnrollments[mockScenario];

export const mockExamSettings: ExamSettings = {
  timeLimitMinutes: 120,
  passMarkPct: 75
}

const placeholderPrompts: Record<Locale, (n: number) => string> = {
  en: (n) => n % 4 === 0
    ? `Sample question ${n}. This longer placeholder stands in for a real exam question that describes a shipping scenario in a few sentences before asking which action is correct.`
    : `Sample question ${n}. Placeholder text for a real exam question.`,
  fr: (n) => n % 4 === 0
    ? `Question type ${n}. Ce texte provisoire plus long remplace une vraie question d'examen qui décrit une situation d'expédition en quelques phrases avant de demander quelle action est la bonne.`
    : `Question type ${n}. Texte provisoire pour une vraie question d'examen.`
}

const placeholderOption: Record<Locale, string> = {
  en: "Sample answer",
  fr: "Réponse type"
}

export function mockExamQuestions(locale: Locale): ExamQuestion[] {
  return Array.from({ length: 20 }, (_, index) => ({
    id: index + 1,
    prompt: placeholderPrompts[locale](index + 1),
    options: ["A", "B", "C", "D"].map((letter) => ({ id: letter, text: `${placeholderOption[locale]} ${letter}` }))
  }));
}

export function mockExamAttempt(): ExamAttempt {
  return { startedAt: new Date().toISOString() }
}

export function mockExamResult(locale: Locale): ExamResult | null {
  if (mockScenario === "notStarted") return null;
  const passed = mockScenario === "passed";
  const wrong = passed ? [4, 11] : [2, 4, 7, 11, 13, 16, 19, 20];
  return {
    submittedAt: "2026-11-05T15:42:00Z",
    correctCount: 20 - wrong.length,
    questionCount: 20,
    passMarkPct: mockExamSettings.passMarkPct,
    passed,
    attemptsLeft: mockEnrollment.maxAttempts === null ? null : mockEnrollment.maxAttempts - mockEnrollment.attemptsUsed,
    answers: mockExamQuestions(locale).map((question) => ({
      questionId: question.id,
      prompt: question.prompt,
      answer: question.options[question.id % 4].text,
      correct: !wrong.includes(question.id)
    }))
  }
}

export const mockCertificate: StudentCertificate | null = mockScenario !== "passed" ? null : {
  studentName: "Jordan Tremblay",
  courseCode: "ground",
  certificateNumber: "SQMP-2026-0418",
  referenceCode: "SQMP-2020-114",
  issuedOn: "2026-11-05",
  validUntil: "2029-11-05",
  credits: 1
}
