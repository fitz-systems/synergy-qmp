import { CircleAlert } from "lucide-react";
import type { FieldIds } from "@/types/forms";

interface FormFieldProps {
  name: string;
  ids: FieldIds;
  label: string;
  error?: string;
  required?: boolean;
  defaultValue?: string;
  type?: "text" | "email" | "password";
  autoComplete?: string;
  maxLength?: number;
  multiline?: boolean;
  trailing?: React.ReactNode;
}

const controlClass = "block w-full rounded-md border border-line-strong bg-canvas px-3.5 text-base text-ink transition-[border-color,box-shadow] duration-200 hover:border-ink-subtle focus:border-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ink/10 aria-invalid:border-danger aria-invalid:focus-visible:ring-danger/15";

export function FormField({ name, ids, label, error, required = true, defaultValue, type = "text", autoComplete, maxLength, multiline = false, trailing }: FormFieldProps) {
  const shared = {
    id: ids.input,
    name,
    defaultValue,
    maxLength,
    "aria-required": required,
    "aria-invalid": Boolean(error),
    "aria-describedby": error ? ids.error : undefined
  }

  return (
    <div>
      <label htmlFor={ids.input} className="block text-[0.9375rem] font-semibold text-ink">
        {label}
        {required && <span aria-hidden className="ml-0.5 text-danger">*</span>}
      </label>
      <div className="relative mt-2">
        {multiline
          ? <textarea {...shared} rows={6} className={`${controlClass} min-h-40 resize-y py-3 leading-relaxed`}/>
          : <input {...shared} type={type} autoComplete={autoComplete} className={`${controlClass} h-12 ${trailing ? "pr-12" : ""}`}/>}
        {trailing && <div className="absolute inset-y-0 right-0 flex items-center pr-1">{trailing}</div>}
      </div>
      {error && (
        <p id={ids.error} className="mt-2 flex items-start gap-1.5 text-sm font-medium text-danger">
          <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" strokeWidth={2}/>
          {error}
        </p>
      )}
    </div>
  );
}
