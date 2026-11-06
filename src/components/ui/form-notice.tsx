import { CircleAlert } from "lucide-react";
import type { NoticeLabels } from "@/types/forms";

interface FormNoticeProps {
  notice: NoticeLabels;
  ref?: React.Ref<HTMLDivElement>;
}

export function FormNotice({ notice, ref }: FormNoticeProps) {
  return (
    <div ref={ref} tabIndex={-1} role="alert" className="flex gap-3 rounded-lg border border-danger/25 bg-danger-soft p-4 focus-visible:outline-none">
      <CircleAlert aria-hidden className="mt-0.5 size-5 shrink-0 text-danger" strokeWidth={1.75}/>
      <div>
        <p className="font-semibold text-ink">{notice.title}</p>
        <p className="mt-1 text-[0.9375rem] leading-relaxed text-ink-muted">{notice.body}</p>
      </div>
    </div>
  );
}
