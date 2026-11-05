"use client";

import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { Check, Link as LinkIcon } from "lucide-react";
import { shareIcons } from "@/constants/links";
import { copyFeedbackMs } from "@/constants/ui";
import { subscribeNever } from "@/lib/helpers/function";
import { buildShareLinks } from "@/lib/helpers/share";
import type { CourseShareLabels } from "@/types/courses";

interface ShareLinksProps {
  title: string;
  labels: CourseShareLabels;
}

const buttonClass = "inline-flex size-10 items-center justify-center rounded-full border border-line-strong text-ink-muted transition-colors duration-200 hover:border-ink hover:bg-ink hover:text-canvas";

export function ShareLinks({ title, labels }: ShareLinksProps) {
  const pathname = usePathname();
  const origin = useSyncExternalStore(subscribeNever, () => window.location.origin, () => "");
  const [copied, setCopied] = useState(false);

  const url = `${origin}${pathname}`;

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), copyFeedbackMs);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-[0.9375rem] font-semibold text-ink-muted">{labels.label}</span>
      <ul className="flex items-center gap-2">
        {buildShareLinks(url, title).map((link) => {
          const Icon = shareIcons[link.key];
          return (
            <li key={link.key}>
              <a
                href={link.href}
                className={buttonClass}
                {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                <Icon className="size-4"/>
                <span className="sr-only">{labels[link.key]}</span>
              </a>
            </li>
          );
        })}
        <li>
          <button type="button" onClick={copy} className={buttonClass}>
            {copied ? <Check aria-hidden className="size-4" strokeWidth={2}/> : <LinkIcon aria-hidden className="size-4" strokeWidth={1.75}/>}
            <span className="sr-only">{labels.copy}</span>
          </button>
        </li>
      </ul>
      <span aria-live="polite" className={`text-sm font-medium text-ink-muted transition-opacity duration-200 ${copied ? "opacity-100" : "opacity-0"}`}>
        {copied ? labels.copied : ""}
      </span>
    </div>
  );
}
