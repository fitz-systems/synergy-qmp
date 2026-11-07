import { businessTimeZone, examGraceSeconds, fixedOrderQuestionType } from "@/constants/student";
import type { AttemptScore, BankQuestion, ExamAnswerRecord, ExamAnswers, ExamQuestion, ExamResult, QuestionDraw } from "@/types/student";

function randomIndex(below: number) {
  return crypto.getRandomValues(new Uint32Array(1))[0] % below;
}

export function shuffled<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index--) {
    const swap = randomIndex(index + 1);
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

export function graceCutoff(now: Date) {
  return new Date(now.getTime() - examGraceSeconds * 1000);
}

export function isAttemptAbandoned(attempt: { submittedAt: Date | null; expiresAt: Date }, now: Date) {
  return attempt.submittedAt === null && attempt.expiresAt < graceCutoff(now);
}

export function isAttemptInProgress(attempt: { submittedAt: Date | null; expiresAt: Date }, now: Date) {
  return attempt.submittedAt === null && attempt.expiresAt > now;
}

interface DrawOptions {
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
}

export function drawQuestions(bank: BankQuestion[], count: number, { shuffleQuestions, shuffleAnswers }: DrawOptions): QuestionDraw[] {
  const ordered = shuffleQuestions ? shuffled(bank) : bank;
  return ordered.slice(0, count).map((question) => ({
    questionId: question.id,
    questionText: question.prompt,
    options: shuffleAnswers && question.type !== fixedOrderQuestionType ? shuffled(question.options) : question.options,
    correctAnswerText: question.options[question.correctIndex]
  }));
}

export function isAnswerCorrect(answer: { answerText: string | null; correctAnswerText: string | null }) {
  return answer.answerText !== null && answer.answerText === answer.correctAnswerText;
}

export function scoreAttempt(correctCount: number, questionCount: number, passMarkPct: number): AttemptScore {
  const pct = questionCount === 0 ? 0 : Math.round((correctCount / questionCount) * 100);
  return { correctCount, passed: pct >= passMarkPct }
}

export function optionIndex(optionId: unknown, optionCount: number) {
  const index = Number(optionId);
  return Number.isInteger(index) && index >= 0 && index < optionCount ? index : null;
}

export function examQuestion(answer: ExamAnswerRecord): ExamQuestion {
  return {
    id: answer.id,
    prompt: answer.questionText,
    options: answer.options.map((text, index) => ({ id: String(index), text }))
  }
}

export function savedAnswers(answers: ExamAnswerRecord[]): ExamAnswers {
  return Object.fromEntries(answers.filter((answer) => answer.selectedIndex !== null).map((answer) => [answer.id, String(answer.selectedIndex)]));
}

interface ResultAttempt {
  submittedAt: Date;
  correctCount: number | null;
  questionCount: number;
  passMarkPct: number;
  passed: boolean | null;
}

export function examResult(attempt: ResultAttempt, answers: ExamAnswerRecord[], attemptsLeft: number | null): ExamResult {
  return {
    submittedAt: attempt.submittedAt.toISOString(),
    correctCount: attempt.correctCount ?? 0,
    questionCount: attempt.questionCount,
    passMarkPct: attempt.passMarkPct,
    passed: attempt.passed ?? false,
    attemptsLeft,
    answers: answers.map((answer) => ({ questionId: answer.id, prompt: answer.questionText, answer: answer.answerText, correct: answer.isCorrect }))
  }
}

export function businessDate(moment: Date) {
  return new Date(`${moment.toLocaleDateString("en-CA", { timeZone: businessTimeZone })}T00:00:00Z`);
}
