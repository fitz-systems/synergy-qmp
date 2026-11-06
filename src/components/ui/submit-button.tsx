import { LoaderCircle } from "lucide-react";

interface SubmitButtonProps {
  pending: boolean;
  label: string;
  pendingLabel: string;
  className?: string;
}

export function SubmitButton({ pending, label, pendingLabel, className = "" }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex h-12 items-center justify-center gap-2 rounded-md bg-brand px-7 text-base font-semibold text-ink transition-[background-color,transform] duration-200 ease-out-expo hover:bg-brand-hover active:translate-y-px disabled:cursor-wait disabled:opacity-70 ${className}`}
    >
      {pending && <LoaderCircle aria-hidden className="size-4 animate-spin" strokeWidth={2}/>}
      {pending ? pendingLabel : label}
    </button>
  );
}
