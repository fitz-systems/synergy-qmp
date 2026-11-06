import { Mail } from "lucide-react";
import type { CourseDetailRow } from "@/types/student";

interface StudentCourseSidebarProps {
  detailsTitle: string;
  rows: CourseDetailRow[];
  helpTitle: string;
  helpBody: string;
}

export function StudentCourseSidebar({ detailsTitle, rows, helpTitle, helpBody }: StudentCourseSidebarProps) {
  return (
    <div className="space-y-6">
      <section aria-labelledby="course-details-title" className="rounded-xl border border-line bg-canvas p-5 sm:p-6">
        <h2 id="course-details-title" className="text-lg font-semibold text-ink">{detailsTitle}</h2>
        <dl className="mt-3 divide-y divide-line">
          {rows.map((row) => (
            <div key={row.label} className="flex items-baseline justify-between gap-4 py-3">
              <dt className="text-[0.9375rem] text-ink-muted">{row.label}</dt>
              <dd className="text-right text-[0.9375rem] font-semibold text-ink">{row.value}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section aria-labelledby="course-help-title" className="rounded-xl bg-night p-5 text-canvas sm:p-6">
        <Mail aria-hidden className="size-5 text-brand" strokeWidth={1.75}/>
        <h2 id="course-help-title" className="mt-3 text-lg font-semibold">{helpTitle}</h2>
        <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-canvas/80">{helpBody}</p>
      </section>
    </div>
  );
}
