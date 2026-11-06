import Link from "next/link";

import { Check, Download, Lock } from "lucide-react";
import { courseStepIcons } from "@/constants/student";
import { interpolate } from "@/lib/helpers/format";
import type { CourseStepContent, StudentCopy } from "@/types/student";

interface CourseStepsProps {
  steps: CourseStepContent[];
  labels: StudentCopy["myCourse"];
}

const stateBadge = {
  done: "bg-success-soft text-success",
  current: "bg-brand-soft text-on-brand",
  locked: "bg-canvas-alt text-ink-subtle"
}

export function CourseSteps({ steps, labels }: CourseStepsProps) {
  return (
    <section aria-labelledby="progress-title">
      <h2 id="progress-title" className="text-2xl font-bold text-ink">{labels.progressTitle}</h2>
      <ol className="mt-6 space-y-4">
        {steps.map((step, index) => {
          const Icon = courseStepIcons[step.key];
          const locked = step.state === "locked";
          return (
            <li
              key={step.key}
              className={`flex flex-col gap-5 rounded-xl border bg-canvas p-5 sm:flex-row sm:p-6 ${step.state === "current" ? "border-brand shadow-raise" : "border-line"}`}
            >
              <span
                aria-hidden
                className={`flex size-12 shrink-0 items-center justify-center rounded-lg ${step.state === "done" ? "bg-success text-canvas" : locked ? "bg-canvas-alt text-ink-subtle" : "bg-brand text-ink"}`}
              >
                {step.state === "done" ? <Check className="size-6" strokeWidth={2.25}/> : locked ? <Lock className="size-5" strokeWidth={1.75}/> : <Icon className="size-6" strokeWidth={1.75}/>}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <p className="text-sm font-medium text-ink-subtle">{interpolate(labels.stepLabel, { n: index + 1 })}</p>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${stateBadge[step.state]}`}>{labels.states[step.state]}</span>
                </div>
                <h3 className={`mt-1 text-xl font-semibold ${locked ? "text-ink-muted" : "text-ink"}`}>{step.title}</h3>
                <p className="mt-1.5 leading-relaxed text-ink-muted">{step.body}</p>
                {step.note && <p className="mt-2 text-sm font-medium text-ink-subtle">{step.note}</p>}

                {step.actions.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-3">
                    {step.actions.map((action) => (
                      <Link
                        key={action.label}
                        href={action.href}
                        className={`inline-flex h-11 items-center justify-center gap-2 rounded-md px-5 text-[0.9375rem] font-semibold transition-colors duration-200 ${action.variant === "primary" ? "bg-brand text-ink hover:bg-brand-hover" : "border border-line-strong text-ink hover:border-ink"}`}
                      >
                        {action.icon === "download" && <Download aria-hidden className="size-4" strokeWidth={2}/>}
                        {action.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
