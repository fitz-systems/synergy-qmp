"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

interface TestimonialItem {
  id: number;
  name: string;
  role: string | null;
  quote: string;
}

interface TestimonialsProps {
  items: TestimonialItem[];
  labels: { previous: string; next: string; list: string };
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : parts[0].slice(0, 2);
  return letters.toUpperCase();
}

export function Testimonials({ items, labels }: TestimonialsProps) {
  const [active, setActive] = useState(Math.floor(items.length / 2));
  
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const current = items[active];

  const go = (index: number, focus = false) => {
    const next = (index + items.length) % items.length;
    setActive(next);
    if (focus) tabs.current[next]?.focus();
  }

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowRight") go(active + 1, true);
    else if (event.key === "ArrowLeft") go(active - 1, true);
    else if (event.key === "Home") go(0, true);
    else if (event.key === "End") go(items.length - 1, true);
    else return;
    event.preventDefault();
  }

  const arrow =
    "inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-line-strong text-ink-muted transition-colors duration-200 hover:border-ink hover:text-ink";

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center justify-center gap-3 sm:gap-5">
        <button type="button" onClick={() => go(active - 1)} className={arrow}>
          <ChevronLeft aria-hidden className="size-5" strokeWidth={1.75} />
          <span className="sr-only">{labels.previous}</span>
        </button>

        <div role="tablist" aria-label={labels.list} onKeyDown={onKeyDown} className="flex items-center gap-2 sm:gap-3">
          {items.map((item, index) => {
            const selected = index === active;
            return (
              <button
                key={item.id}
                ref={(node) => {
                  tabs.current[index] = node;
                }}
                type="button"
                role="tab"
                id={`testimonial-tab-${item.id}`}
                aria-selected={selected}
                aria-controls="testimonial-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => go(index)}
                className={`flex shrink-0 items-center justify-center rounded-full font-semibold transition-all duration-300 ease-out-expo ${
                  selected
                    ? "size-16 bg-brand text-lg text-ink sm:size-20 sm:text-xl"
                    : "size-11 bg-canvas-alt text-sm text-ink-subtle hover:bg-brand-soft hover:text-ink sm:size-14 sm:text-base"
                }`}
              >
                <span aria-hidden>{initials(item.name)}</span>
                <span className="sr-only">{item.name}</span>
              </button>
            );
          })}
        </div>

        <button type="button" onClick={() => go(active + 1)} className={arrow}>
          <ChevronRight aria-hidden className="size-5" strokeWidth={1.75} />
          <span className="sr-only">{labels.next}</span>
        </button>
      </div>

      <figure
        id="testimonial-panel"
        role="tabpanel"
        aria-labelledby={`testimonial-tab-${current.id}`}
        className="mt-10 text-center"
      >
        <div key={current.id} className="motion-safe:animate-[quote-in_450ms_var(--ease-out-expo)_both]">
          <Quote aria-hidden className="mx-auto size-7 fill-brand text-brand" strokeWidth={0} />
          <blockquote className="mt-5 text-lg leading-relaxed text-ink sm:text-xl sm:leading-relaxed">
            <p>{current.quote}</p>
          </blockquote>
          <figcaption className="mt-6">
            <span className="block font-semibold text-ink">{current.name}</span>
            {current.role && <span className="mt-0.5 block text-[0.9375rem] text-ink-subtle">{current.role}</span>}
          </figcaption>
        </div>
      </figure>
    </div>
  );
}
