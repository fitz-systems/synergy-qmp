"use server";

import { redirect } from "next/navigation";
import { saveExamAnswer, submitExamAttempt } from "@/lib/exam";
import { resolveLocale } from "@/lib/helpers/locale";
import { localizedHref } from "@/lib/helpers/routes";
import type { ExamAnswers, ExamSubmitStatus } from "@/types/student";

export async function saveAnswer(attemptId: number, answerId: number, optionId: string) {
  if (!Number.isInteger(attemptId) || !Number.isInteger(answerId)) return false;
  return saveExamAnswer(attemptId, answerId, String(optionId));
}

export async function submitExam(locale: string, attemptId: number, answers: ExamAnswers): Promise<ExamSubmitStatus> {
  if (!Number.isInteger(attemptId) || typeof answers !== "object" || answers === null) return "failed";

  try {
    if (!(await submitExamAttempt(attemptId, answers))) return "failed";
  } catch (error) {
    console.error("Exam submit failed", error);
    return "failed";
  }

  redirect(localizedHref(resolveLocale(locale), "examResults"));
}
