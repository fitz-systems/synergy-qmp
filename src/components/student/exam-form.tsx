"use client";

import { useRef, useState, useTransition } from "react";
import { CircleAlert, Clock, Send, TimerOff } from "lucide-react";
import { saveAnswer, submitExam } from "@/app/[lang]/(student)/my-course/exam/actions";
import { FormNotice } from "@/components/ui/form-notice";
import { useCountdown } from "@/hooks/use-countdown";
import type { Locale } from "@/i18n/config";
import { interpolate, plural } from "@/lib/helpers/format";
import { answeredCount, examAnswerField, progressPct, questionAnchor, unansweredIds } from "@/lib/helpers/student";
import type { ExamAnswers, ExamLabels, ExamSession } from "@/types/student";
import { ExamTimer } from "./exam-timer";

interface ExamFormProps {
  locale: Locale;
  session: ExamSession;
  timeLimitMinutes: number;
  labels: ExamLabels;
}

interface ExamProgressProps {
  answered: number;
  total: number;
  labels: ExamLabels;
  compact?: boolean;
  children?: React.ReactNode;
}

export function ExamForm({ locale, session, timeLimitMinutes, labels }: ExamFormProps) {
  const { attemptId, questions, deadline } = session;
  const [answers, setAnswers] = useState<ExamAnswers>(session.answers);
  const [expired, setExpired] = useState(false);
  const [submitFailed, setSubmitFailed] = useState(false);
  const [submitting, startSubmit] = useTransition();
  const [timeAnnouncement, setTimeAnnouncement] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const timeUpRef = useRef<HTMLDialogElement>(null);
  const failedRef = useRef<HTMLDivElement>(null);

  const total = questions.length;
  const answered = answeredCount(answers);
  const unanswered = unansweredIds(questions.map((question) => question.id), answers);

  const choose = (questionId: number, optionId: string) => {
    setAnswers((current) => ({ ...current, [questionId]: optionId }));
    saveAnswer(attemptId, questionId, optionId).catch(() => undefined);
  }

  const goToFirstUnanswered = () => {
    dialogRef.current?.close();
    const first = unanswered[0];
    if (first) document.getElementById(questionAnchor(first))?.querySelector<HTMLInputElement>("input")?.focus();
  }

  const submit = () => {
    dialogRef.current?.close();
    setSubmitFailed(false);
    startSubmit(async () => {
      const status = await submitExam(locale, attemptId, answers);
      if (status === "failed") {
        timeUpRef.current?.close();
        setSubmitFailed(true);
        failedRef.current?.focus();
      }
    });
  }

  const remaining = useCountdown(deadline, {
    onWarning: (minutesLeft) => setTimeAnnouncement(plural(locale, labels.timeWarning, minutesLeft)),
    onExpire: () => {
      setExpired(true);
      dialogRef.current?.close();
      timeUpRef.current?.showModal();
      submit();
    }
  });

  const submitButton = (className = "") => (
    <button
      type="button"
      onClick={() => dialogRef.current?.showModal()}
      disabled={submitting || (expired && !submitFailed)}
      className={`inline-flex h-12 items-center justify-center gap-2 rounded-md bg-brand px-6 text-base font-semibold text-ink transition-colors duration-200 hover:bg-brand-hover disabled:pointer-events-none disabled:opacity-50 ${className}`}
    >
      <Send aria-hidden className="size-4" strokeWidth={2}/>
      {submitting ? labels.submitting : labels.submit}
    </button>
  );

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-12">
      {submitFailed && (
        <div className="lg:col-span-2">
          <FormNotice ref={failedRef} notice={labels.submitFailed}/>
        </div>
      )}
      <ol className="space-y-5">
        {questions.map((question, index) => (
          <li key={question.id} id={questionAnchor(question.id)} className="scroll-mt-28">
            <fieldset disabled={expired} className="rounded-xl border border-line bg-canvas p-5 sm:p-6">
              <legend className="float-left w-full pb-5">
                <span className="block text-sm font-semibold text-ink-subtle">{interpolate(labels.questionLabel, { n: index + 1, total })}</span>
                <span className="mt-1.5 block text-lg font-semibold leading-snug text-ink">{question.prompt}</span>
              </legend>
              <div className="clear-left grid gap-2.5">
                {question.options.map((option) => (
                  <label
                    key={option.id}
                    className="flex min-h-12 cursor-pointer items-center gap-3.5 rounded-lg border border-line px-4 py-3 text-ink transition-colors duration-150 hover:border-line-strong hover:bg-canvas-alt has-checked:border-ink has-checked:bg-brand-soft has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink"
                  >
                    <input
                      type="radio"
                      name={examAnswerField(question.id)}
                      value={option.id}
                      checked={answers[question.id] === option.id}
                      onChange={() => choose(question.id, option.id)}
                      className="size-[1.125rem] shrink-0 cursor-pointer accent-ink focus-visible:outline-none"
                    />
                    <span className="leading-snug">{option.text}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </li>
        ))}
      </ol>

      <aside className="hidden space-y-6 lg:sticky lg:top-28 lg:block">
        <div className="rounded-xl border border-line bg-canvas p-5">
          <ExamTimer remaining={remaining} label={labels.timeLeft}/>
          <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-ink-muted">
            <Clock aria-hidden className="size-4" strokeWidth={1.75}/>
            {interpolate(labels.timeLimit, { minutes: timeLimitMinutes })}
          </p>
          <ExamProgress answered={answered} total={total} labels={labels}/>

          <h2 className="mt-6 text-sm font-semibold text-ink-muted">{labels.navigator}</h2>
          <ol className="mt-3 grid grid-cols-5 gap-2">
            {questions.map((question, index) => {
              const isAnswered = question.id in answers;
              return (
                <li key={question.id}>
                  <a
                    href={`#${questionAnchor(question.id)}`}
                    aria-label={interpolate(labels.jumpTo, { n: index + 1, state: isAnswered ? labels.answered : labels.unanswered })}
                    className={`flex aspect-square items-center justify-center rounded-md text-sm font-semibold tabular-nums transition-colors ${isAnswered ? "bg-ink text-canvas hover:bg-night" : "border border-line-strong text-ink-muted hover:border-ink hover:text-ink"}`}
                  >
                    {index + 1}
                  </a>
                </li>
              );
            })}
          </ol>

          {submitButton("mt-6 w-full")}
        </div>
      </aside>

      <div data-sticky-footer className="sticky bottom-0 z-20 -mx-5 border-t border-line bg-canvas/95 px-5 py-3 backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-4">
          <div className="min-w-0 flex-1">
            <ExamProgress answered={answered} total={total} labels={labels} compact>
              <ExamTimer remaining={remaining} label={labels.timeLeft} compact/>
            </ExamProgress>
          </div>
          {submitButton("shrink-0")}
        </div>
      </div>

      <p aria-live="assertive" className="sr-only">{timeAnnouncement}</p>

      <dialog
        ref={timeUpRef}
        aria-labelledby="exam-time-up-title"
        onCancel={(event) => event.preventDefault()}
        className="m-auto w-[min(32rem,calc(100%-2.5rem))] rounded-2xl border border-line bg-canvas p-0 text-ink shadow-raise backdrop:bg-night/60 backdrop:backdrop-blur-sm"
      >
        <div className="p-6 sm:p-8">
          <TimerOff aria-hidden className="size-7 text-danger" strokeWidth={1.75}/>
          <h2 id="exam-time-up-title" className="mt-3 text-xl font-bold">{labels.timeUp.title}</h2>
          <p className="mt-2 leading-relaxed text-ink-muted">{labels.timeUp.body}</p>
        </div>
      </dialog>

      <dialog
        ref={dialogRef}
        aria-labelledby="exam-confirm-title"
        className="m-auto w-[min(32rem,calc(100%-2.5rem))] rounded-2xl border border-line bg-canvas p-0 text-ink shadow-raise backdrop:bg-night/60 backdrop:backdrop-blur-sm"
      >
        <div className="p-6 sm:p-8">
          {unanswered.length > 0 ? (
            <>
              <CircleAlert aria-hidden className="size-7 text-danger" strokeWidth={1.75}/>
              <h2 id="exam-confirm-title" className="mt-3 text-xl font-bold">{plural(locale, labels.confirm.unansweredTitle, unanswered.length)}</h2>
              <p className="mt-2 leading-relaxed text-ink-muted">{labels.confirm.unansweredBody}</p>
            </>
          ) : (
            <>
              <h2 id="exam-confirm-title" className="text-xl font-bold">{labels.confirm.title}</h2>
              <p className="mt-2 leading-relaxed text-ink-muted">{labels.confirm.body}</p>
            </>
          )}
          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              autoFocus
              onClick={unanswered.length > 0 ? goToFirstUnanswered : () => dialogRef.current?.close()}
              className="inline-flex h-12 items-center justify-center rounded-md border border-line-strong px-5 font-semibold text-ink transition-colors hover:border-ink"
            >
              {labels.confirm.keep}
            </button>
            <button
              type="button"
              onClick={submit}
              className="inline-flex h-12 items-center justify-center rounded-md bg-brand px-5 font-semibold text-ink transition-colors hover:bg-brand-hover"
            >
              {labels.confirm.submit}
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}

function ExamProgress({ answered, total, labels, compact = false, children }: ExamProgressProps) {
  const pct = progressPct(answered, total);
  return (
    <div className={compact ? "" : "mt-4"}>
      <div className="flex items-center justify-between gap-3">
        <p aria-live="polite" className={`font-semibold tabular-nums text-ink ${compact ? "text-sm" : "text-lg"}`}>
          {interpolate(labels.progress, { answered, total })}
        </p>
        {children}
      </div>
      <div
        role="progressbar"
        aria-label={labels.progressLabel}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={answered}
        className="mt-2 h-2 overflow-hidden rounded-full bg-canvas-alt"
      >
        <div className="h-full rounded-full bg-brand transition-[width] duration-300 ease-out-expo" style={{ width: `${pct}%` }}/>
      </div>
    </div>
  );
}
