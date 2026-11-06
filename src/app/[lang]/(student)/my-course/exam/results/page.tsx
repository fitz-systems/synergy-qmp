import Link from "next/link";

import type { Metadata } from "next";
import { Check, CircleCheck, CircleX, X } from "lucide-react";
import { StudentPageHeader } from "@/components/student/student-page-header";
import { ButtonLink } from "@/components/ui/button-link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { formatDate, formatPercent, interpolate, plural } from "@/lib/helpers/format";
import { localizedHref } from "@/lib/helpers/routes";
import { resultScorePct } from "@/lib/helpers/student";
import { getLatestExamResult } from "@/lib/student";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.student.results.metaTitle, robots: { index: false } }
}

export default async function ExamResultsPage() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const result = await getLatestExamResult(locale);
  const copy = dict.student.results;
  const myCourseHref = localizedHref(locale, "myCourse");

  return (
    <>
      <StudentPageHeader
        title={copy.title}
        crumbs={[{ label: dict.nav.myCourse, href: myCourseHref }]}
        current={dict.nav.examResults}
        breadcrumbLabel={dict.nav.breadcrumb}
      />
      <div className="bg-canvas-alt">
        <div className="container-site space-y-10 py-12 md:py-16">
          <section
            aria-labelledby="result-title"
            className={`grid gap-8 rounded-2xl border bg-canvas p-6 shadow-raise sm:p-8 md:grid-cols-[auto_minmax(0,1fr)] md:items-center md:gap-10 lg:p-10 ${result.passed ? "border-success/30" : "border-danger/30"}`}
          >
            <div className={`flex size-36 flex-col items-center justify-center rounded-full ${result.passed ? "bg-success-soft text-success" : "bg-danger-soft text-danger"}`}>
              {result.passed ? <CircleCheck aria-hidden className="size-8" strokeWidth={1.75}/> : <CircleX aria-hidden className="size-8" strokeWidth={1.75}/>}
              <p className="mt-1 text-4xl font-bold tabular-nums tracking-tight">{formatPercent(locale, resultScorePct(result))}</p>
            </div>
            <div>
              <h2 id="result-title" className="text-3xl font-bold text-ink">{result.passed ? copy.passedTitle : copy.failedTitle}</h2>
              <p className="mt-2 text-lg font-semibold tabular-nums text-ink">{interpolate(copy.score, { correct: result.correctCount, total: result.questionCount })}</p>
              <p className="mt-1 text-[0.9375rem] text-ink-muted">
                {interpolate(copy.passMark, { passMark: formatPercent(locale, result.passMarkPct) })}
                <span aria-hidden> · </span>
                {interpolate(copy.submitted, { date: formatDate(locale, result.submittedAt) })}
              </p>
              <p className="mt-4 leading-relaxed text-ink-muted">
                {result.passed ? copy.passedBody : plural(locale, copy.failedBody, result.attemptsLeft)}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
                {result.passed
                  ? <ButtonLink href={localizedHref(locale, "certificate")} arrow>{copy.viewCertificate}</ButtonLink>
                  : <ButtonLink href={localizedHref(locale, "exam")} arrow>{copy.retake}</ButtonLink>}
                <Link href={myCourseHref} className="font-semibold text-ink underline decoration-brand decoration-2 underline-offset-[0.3em] transition-colors hover:decoration-ink">
                  {copy.backToCourse}
                </Link>
              </div>
            </div>
          </section>

          <section aria-labelledby="answers-title">
            <h2 id="answers-title" className="text-2xl font-bold text-ink">{copy.answersTitle}</h2>
            <ol className="mt-6 divide-y divide-line overflow-hidden rounded-xl border border-line bg-canvas">
              {result.answers.map((answer, index) => (
                <li key={answer.questionId} className="flex gap-4 p-5 sm:p-6">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-canvas-alt text-sm font-semibold tabular-nums text-ink-muted">{index + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium leading-snug text-ink">{answer.prompt}</p>
                    <p className="mt-2 text-[0.9375rem] text-ink-muted">
                      <span className="font-medium">{copy.answerLabel}:</span> {answer.answer ?? copy.noAnswer}
                    </p>
                  </div>
                  <span className={`inline-flex h-7 shrink-0 items-center gap-1.5 self-start rounded-full px-2.5 text-xs font-semibold ${answer.correct ? "bg-success-soft text-success" : "bg-danger-soft text-danger"}`}>
                    {answer.correct ? <Check aria-hidden className="size-3.5" strokeWidth={2.5}/> : <X aria-hidden className="size-3.5" strokeWidth={2.5}/>}
                    {answer.correct ? copy.correct : copy.incorrect}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </>
  );
}
