import { Clock } from "lucide-react";
import { formatCountdown } from "@/lib/helpers/format";
import { isTimeLow } from "@/lib/helpers/student";

interface ExamTimerProps {
  remaining: number;
  label: string;
  compact?: boolean;
}

export function ExamTimer({ remaining, label, compact = false }: ExamTimerProps) {
  const low = isTimeLow(remaining);

  if (compact) {
    return (
      <p className={`inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold tabular-nums ${low ? "text-danger" : "text-ink"}`}>
        <Clock aria-hidden className="size-4" strokeWidth={2}/>
        <span className="sr-only">{label}: </span>
        <span suppressHydrationWarning>{formatCountdown(remaining)}</span>
      </p>
    );
  }

  return (
    <div className={`rounded-lg px-4 py-3 transition-colors duration-300 ${low ? "bg-danger-soft text-danger" : "bg-canvas-alt text-ink"}`}>
      <p className={`text-sm font-medium ${low ? "text-danger" : "text-ink-muted"}`}>{label}</p>
      <p suppressHydrationWarning className="mt-0.5 text-3xl font-bold tabular-nums tracking-tight">{formatCountdown(remaining)}</p>
    </div>
  );
}
