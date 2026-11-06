import type { Locale } from "@/i18n/config";
import type { ExamQuestion, ExamResult, ExamSettings, StudentAccount, StudentCertificate, StudentEnrollment } from "@/types/student";

// Todo: Placeholder data for designing the student area; replace with the signed-in student's records once auth and the migration are wired up
export const mockStudentAccount: StudentAccount = {
  firstName: "Jordan",
  lastName: "Tremblay",
  email: "jordan.tremblay@example.com"
}

export const mockEnrollment: StudentEnrollment = {
  courseCode: "ground",
  enrolledOn: "2026-10-28",
  examStatus: "notStarted",
  attemptsUsed: 0,
  maxAttempts: 3
}

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

export function mockExamResult(locale: Locale): ExamResult {
  const wrong = [4, 11];
  return {
    submittedAt: "2026-11-05T15:42:00Z",
    correctCount: 18,
    questionCount: 20,
    passMarkPct: mockExamSettings.passMarkPct,
    passed: true,
    attemptsLeft: 2,
    answers: mockExamQuestions(locale).map((question) => ({
      questionId: question.id,
      prompt: question.prompt,
      answer: question.options[question.id % 4].text,
      correct: !wrong.includes(question.id)
    }))
  }
}

export const mockCertificate: StudentCertificate = {
  studentName: "Jordan Tremblay",
  courseCode: "ground",
  certificateNumber: "SQMP-2026-0418",
  issuedOn: "2026-11-05",
  validUntil: "2029-11-05",
  credits: 1
}
