import { Eye, EyeOff } from "lucide-react";

interface PasswordToggleProps {
  shown: boolean;
  onToggle: () => void;
  showLabel: string;
  hideLabel: string;
}

export function PasswordToggle({ shown, onToggle, showLabel, hideLabel }: PasswordToggleProps) {
  return (
    <button
      type="button"
      aria-pressed={shown}
      onClick={onToggle}
      className="inline-flex size-10 items-center justify-center rounded-md text-ink-subtle transition-colors hover:text-ink"
    >
      {shown ? <EyeOff aria-hidden className="size-[1.125rem]" strokeWidth={1.75}/> : <Eye aria-hidden className="size-[1.125rem]" strokeWidth={1.75}/>}
      <span className="sr-only">{shown ? hideLabel : showLabel}</span>
    </button>
  );
}
