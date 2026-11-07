import { examLockNamespace } from "@/constants/student";
import type { Prisma } from "@/generated/prisma/client";
import { businessDate, isAnswerCorrect, isAttemptAbandoned, scoreAttempt } from "@/lib/helpers/exam";
import { prisma } from "@/lib/prisma";
import type { AttemptScore, StudentEnrollmentRecord } from "@/types/student";

const examTransactionTimeoutMs = 15_000;

export async function withEnrollmentLock<T>(enrollmentId: number, work: (tx: Prisma.TransactionClient) => Promise<T>) {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(${examLockNamespace}::int, ${enrollmentId}::int)`;
    return work(tx);
  }, { timeout: examTransactionTimeoutMs });
}

export async function finishAttempt(tx: Prisma.TransactionClient, attemptId: number, enrollmentId: number, submittedAt: Date): Promise<AttemptScore | null> {
  const attempt = await tx.attempt.findUniqueOrThrow({
    where: { id: attemptId },
    select: { submittedAt: true, passMarkPct: true, questionCount: true, answers: { select: { id: true, answerText: true, correctAnswerText: true } } }
  });
  if (attempt.submittedAt) return null;

  const correctIds = attempt.answers.filter(isAnswerCorrect).map((answer) => answer.id);
  const score = scoreAttempt(correctIds.length, attempt.questionCount, attempt.passMarkPct);

  await tx.attemptAnswer.updateMany({ where: { attemptId }, data: { isCorrect: false } });
  await tx.attemptAnswer.updateMany({ where: { id: { in: correctIds } }, data: { isCorrect: true } });
  await tx.attempt.update({ where: { id: attemptId }, data: { submittedAt, correctCount: score.correctCount, passed: score.passed } });
  if (score.passed) await tx.enrollment.updateMany({ where: { id: enrollmentId, passedOn: null }, data: { passedOn: businessDate(submittedAt) } });

  return score;
}

export async function finishAbandonedAttempts(record: StudentEnrollmentRecord, now: Date) {
  const abandoned = record.attempts.filter((attempt) => isAttemptAbandoned(attempt, now));
  if (abandoned.length === 0) return false;

  await withEnrollmentLock(record.id, async (tx) => {
    for (const attempt of abandoned) await finishAttempt(tx, attempt.id, record.id, attempt.expiresAt);
  });
  return true;
}
