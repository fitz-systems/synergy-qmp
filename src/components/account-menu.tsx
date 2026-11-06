"use client";

import Link from "next/link";

import { useEffect, useId, useRef, useState } from "react";
import { BookOpen, ChevronDown, LogOut } from "lucide-react";
import type { HeaderAccountMenu } from "@/types/student";

type AccountMenuProps = HeaderAccountMenu;

interface AccountAvatarProps {
  initials: string;
  className?: string;
}

export function AccountAvatar({ initials, className = "size-9 text-sm" }: AccountAvatarProps) {
  return (
    <span aria-hidden className={`inline-flex shrink-0 items-center justify-center rounded-full bg-brand font-bold text-ink ${className}`}>
      {initials}
    </span>
  );
}

export function AccountMenu({ account, myCourseHref, labels }: AccountMenuProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    }
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-11 items-center gap-2.5 rounded-full border border-line-strong py-1 pr-3 pl-1 text-[0.9375rem] font-semibold text-ink transition-colors duration-200 hover:border-ink"
      >
        <AccountAvatar initials={account.initials}/>
        <span className="max-w-40 truncate">{account.name}</span>
        <ChevronDown aria-hidden className={`size-4 text-ink-muted transition-transform duration-300 ease-out-expo ${open ? "rotate-180" : ""}`} strokeWidth={2}/>
        <span className="sr-only">{labels.menu}</span>
      </button>

      <div
        id={panelId}
        hidden={!open}
        className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-72 rounded-xl border border-line bg-canvas p-2 shadow-raise motion-safe:animate-[rise-in_250ms_var(--ease-out-expo)_both]"
      >
        <div className="border-b border-line px-3 pt-2 pb-3">
          <p className="text-xs font-medium text-ink-subtle">{labels.signedInAs}</p>
          <p className="mt-0.5 truncate font-semibold text-ink">{account.name}</p>
          <p className="truncate text-sm text-ink-muted">{account.email}</p>
        </div>
        <ul className="pt-1.5">
          <li>
            <Link
              href={myCourseHref}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-md px-3 py-2.5 text-[0.9375rem] font-medium text-ink transition-colors hover:bg-canvas-alt"
            >
              <BookOpen aria-hidden className="size-4 text-ink-muted" strokeWidth={1.75}/>
              {labels.myCourse}
            </Link>
          </li>
          <li>
            {/* Todo: Sign out through Better Auth */}
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-[0.9375rem] font-medium text-ink transition-colors hover:bg-canvas-alt"
            >
              <LogOut aria-hidden className="size-4 text-ink-muted" strokeWidth={1.75}/>
              {labels.logout}
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
