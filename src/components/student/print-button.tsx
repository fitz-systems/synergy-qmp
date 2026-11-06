"use client";

import { Printer } from "lucide-react";

interface PrintButtonProps {
  label: string;
}

export function PrintButton({ label }: PrintButtonProps) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-line-strong px-5 font-semibold text-ink transition-colors hover:border-ink"
    >
      <Printer aria-hidden className="size-4" strokeWidth={1.75}/>
      {label}
    </button>
  );
}
