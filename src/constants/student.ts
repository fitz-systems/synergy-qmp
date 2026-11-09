import { Award, BookOpen, ClipboardCheck, LayoutDashboard, type LucideIcon } from "lucide-react";
import type { Prisma } from "@/generated/prisma/client";
import type { AccountMenuLinkKind, CourseStepKey } from "@/types/student";

export const courseStepIcons: Record<CourseStepKey, LucideIcon> = {
  material: BookOpen,
  exam: ClipboardCheck,
  certificate: Award
}

export const accountMenuLinkIcons: Record<AccountMenuLinkKind, LucideIcon> = {
  myCourse: BookOpen,
  adminPortal: LayoutDashboard
}

export const courseStepOrder: CourseStepKey[] = ["material", "exam", "certificate"];

export const certificateCredits = 1;

export const examTimeWarningMinutes = [5, 1];

export const examTimerTickMs = 1000;

export const certificatePdfHref = "/api/certificate";

export const certificateNumberPrefix = "SQMP-C";

export const certificateNumberDigits = 6;

export const pdfWinAnsiExtras = new Set("€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ");

export const pdfLetterFallbacks: Record<string, string> = {
  Ł: "L",
  ł: "l",
  Đ: "D",
  đ: "d",
  Ħ: "H",
  ħ: "h",
  ı: "i",
  Ŧ: "T",
  ŧ: "t"
}

export const studentEnrollmentSelect = {
  id: true,
  courseId: true,
  locale: true,
  createdAt: true,
  passedOn: true,
  attemptsResetAt: true,
  certificateNumber: true,
  courseLocale: {
    select: {
      name: true,
      certificateCode: true,
      materialFileKey: true,
      course: {
        select: { code: true, passMarkPct: true, questionsPerAttempt: true, timeLimitMinutes: true, maxAttempts: true, shuffleQuestions: true, shuffleAnswers: true, certificateValidMonths: true }
      }
    }
  },
  attempts: {
    select: { id: true, startedAt: true, expiresAt: true, submittedAt: true, passMarkPct: true, correctCount: true, questionCount: true, passed: true },
    orderBy: { startedAt: "asc" }
  }
} satisfies Prisma.EnrollmentSelect;

export const examGraceSeconds = 60;

export const bankQuestionSelect = {
  id: true,
  type: true,
  prompt: true,
  options: true,
  correctIndex: true
} satisfies Prisma.QuestionSelect;

export const fixedOrderQuestionType = "trueFalse";

export const examAnswerSelect = {
  id: true,
  questionText: true,
  options: true,
  selectedIndex: true,
  answerText: true,
  correctAnswerText: true,
  isCorrect: true
} satisfies Prisma.AttemptAnswerSelect;

export const examLockNamespace = 7201;

export const businessTimeZone = "America/Toronto";
