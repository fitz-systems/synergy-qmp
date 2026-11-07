import { bankQuestionSelect, examAnswerSelect, studentEnrollmentSelect } from "@/constants/student";
import type { Prisma } from "@/generated/prisma/client";
import { finishAttempt, withEnrollmentLock } from "@/lib/attempts";
import { getCurrentEnrollment } from "@/lib/enrollment";
import { drawQuestions, examQuestion, graceCutoff, optionIndex, savedAnswers } from "@/lib/helpers/exam";
import { canStartAttempt } from "@/lib/helpers/student";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import type { ExamAnswers, ExamSession } from "@/types/student";

async function examSession(tx: Prisma.TransactionClient, attempt: { id: number; expiresAt: Date }): Promise<ExamSession> {
  const answers = await tx.attemptAnswer.findMany({ where: { attemptId: attempt.id }, orderBy: { sortOrder: "asc" }, select: examAnswerSelect });
  return { attemptId: attempt.id, deadline: attempt.expiresAt.getTime(), questions: answers.map(examQuestion), answers: savedAnswers(answers) }
}

export async function startOrResumeExam(): Promise<ExamSession | null> {
  const current = await getCurrentEnrollment();
  if (!current) return null;

  return withEnrollmentLock(current.id, async (tx) => {
    const now = new Date();
    const unsubmitted = await tx.attempt.findMany({ where: { enrollmentId: current.id, submittedAt: null }, select: { id: true, expiresAt: true } });
    const open = unsubmitted.find((attempt) => attempt.expiresAt > now);
    if (open) return examSession(tx, open);
    for (const attempt of unsubmitted) await finishAttempt(tx, attempt.id, current.id, attempt.expiresAt);

    const record = await tx.enrollment.findUniqueOrThrow({ where: { id: current.id }, select: studentEnrollmentSelect });
    if (!canStartAttempt(record)) return null;

    const { course } = record.courseLocale;
    const bank = await tx.question.findMany({
      where: { courseId: record.courseId, locale: record.locale, active: true },
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      select: bankQuestionSelect
    });
    if (bank.length === 0) throw new Error(`No active questions for course ${record.courseId} (${record.locale}).`);

    const draws = drawQuestions(bank, course.questionsPerAttempt, course);
    const attempt = await tx.attempt.create({
      data: {
        enrollmentId: record.id,
        startedAt: now,
        expiresAt: new Date(now.getTime() + course.timeLimitMinutes * 60_000),
        passMarkPct: course.passMarkPct,
        questionCount: draws.length,
        answers: { create: draws.map((draw, index) => ({ ...draw, sortOrder: index })) }
      },
      select: { id: true, expiresAt: true }
    });
    return examSession(tx, attempt);
  });
}

function openAttemptWhere(attemptId: number, userId: number): Prisma.AttemptWhereInput {
  return { id: attemptId, submittedAt: null, expiresAt: { gt: graceCutoff(new Date()) }, enrollment: { userId } }
}

export async function saveExamAnswer(attemptId: number, answerId: number, optionId: string) {
  const user = await requireUser();
  const answer = await prisma.attemptAnswer.findFirst({ where: { id: answerId, attempt: openAttemptWhere(attemptId, user.id) }, select: { options: true } });
  const index = answer ? optionIndex(optionId, answer.options.length) : null;
  if (!answer || index === null) return false;

  const { count } = await prisma.attemptAnswer.updateMany({
    where: { id: answerId, attempt: openAttemptWhere(attemptId, user.id) },
    data: { selectedIndex: index, answerText: answer.options[index] }
  });
  return count === 1;
}

export async function submitExamAttempt(attemptId: number, answers: ExamAnswers) {
  const user = await requireUser();
  const attempt = await prisma.attempt.findFirst({ where: { id: attemptId, enrollment: { userId: user.id } }, select: { id: true, enrollmentId: true, expiresAt: true } });
  if (!attempt) return false;

  await withEnrollmentLock(attempt.enrollmentId, async (tx) => {
    const latest = await tx.attempt.findUniqueOrThrow({ where: { id: attempt.id }, select: { submittedAt: true } });
    if (latest.submittedAt) return;

    const now = new Date();
    const inTime = attempt.expiresAt > graceCutoff(now);

    if (inTime) {
      const stored = await tx.attemptAnswer.findMany({ where: { attemptId }, select: { id: true, options: true, selectedIndex: true } });
      for (const answer of stored) {
        const index = optionIndex(answers[answer.id], answer.options.length);
        if (index === null || index === answer.selectedIndex) continue;
        await tx.attemptAnswer.update({ where: { id: answer.id }, data: { selectedIndex: index, answerText: answer.options[index] } });
      }
    }

    await finishAttempt(tx, attempt.id, attempt.enrollmentId, inTime && now < attempt.expiresAt ? now : attempt.expiresAt);
  });
  return true;
}
