"use client";

import Link from "next/link";

import { useEffect, useRef, useState } from "react";
import { stickyHeaderOffset } from "@/constants/ui";
import { tabIndexForKey } from "@/lib/helpers/tabs";
import type { CourseTab } from "@/types/courses";

interface CourseTabsProps {
  tabs: CourseTab[];
  label: string;
  price: string;
  enrollHref: string;
  enrollLabel: string;
}

export function CourseTabs({ tabs, label, price, enrollHref, enrollLabel }: CourseTabsProps) {
  const [active, setActive] = useState(tabs[0].id);
  const [stuck, setStuck] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const element = sentinel.current;
    if (!element) return;

    const onScroll = () => setStuck(element.getBoundingClientRect().top < stickyHeaderOffset);
    window.addEventListener("scroll", onScroll, { passive: true });
    const frame = requestAnimationFrame(onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    }
  }, []);

  const select = (index: number, focus = false) => {
    setActive(tabs[index].id);
    if (focus) tabRefs.current[index]?.focus();
    if (stuck) sentinel.current?.scrollIntoView({ block: "start" });
  }

  const onKeyDown = (event: React.KeyboardEvent, index: number) => {
    const next = tabIndexForKey(event.key, index, tabs.length);
    if (next === null) return;
    event.preventDefault();
    select(next, true);
  }

  return (
    <div className="mt-10">
      <div ref={sentinel} aria-hidden className="h-px scroll-mt-[4.5rem] lg:scroll-mt-20"/>
      <div
        data-sticky-tabs
        className={`sticky top-[4.5rem] z-30 -mx-5 border-b border-line bg-canvas/95 px-5 backdrop-blur-md transition-shadow duration-300 sm:mx-0 sm:px-0 lg:top-20 ${stuck ? "shadow-[0_8px_16px_-12px_rgb(16_20_26/0.25)]" : ""}`}
      >
        <div className="flex items-center gap-4">
          <div role="tablist" aria-label={label} className="-mb-px flex overflow-x-auto [scrollbar-width:none]">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                ref={(element) => {
                  tabRefs.current[index] = element;
                }}
                type="button"
                role="tab"
                id={`tab-${tab.id}`}
                aria-controls={`panel-${tab.id}`}
                aria-selected={active === tab.id}
                tabIndex={active === tab.id ? 0 : -1}
                onClick={() => select(index)}
                onKeyDown={(event) => onKeyDown(event, index)}
                className="group relative shrink-0 rounded-md px-4 py-4 text-[0.9375rem] font-semibold text-ink-muted transition-colors duration-200 hover:text-ink focus-visible:outline-offset-[-4px] aria-selected:text-ink"
              >
                {tab.label}
                <span
                  aria-hidden
                  className="absolute inset-x-4 bottom-0 h-0.5 origin-left scale-x-0 rounded-full bg-brand transition-transform duration-300 ease-out-expo group-aria-selected:scale-x-100"
                />
              </button>
            ))}
          </div>

          <div
            inert={!stuck}
            className={`ml-auto hidden shrink-0 items-center gap-4 transition-[opacity,translate] duration-300 ease-out-expo md:flex ${stuck ? "opacity-100" : "pointer-events-none translate-y-1 opacity-0"}`}
          >
            <span className="text-lg font-bold tabular-nums text-ink">{price}</span>
            <Link
              href={enrollHref}
              className="inline-flex h-10 items-center rounded-md bg-brand px-4 text-[0.9375rem] font-semibold text-ink transition-colors duration-200 hover:bg-brand-hover"
            >
              {enrollLabel}
            </Link>
          </div>
        </div>
      </div>

      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          hidden={active !== tab.id}
          tabIndex={0}
          className="pt-8"
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
