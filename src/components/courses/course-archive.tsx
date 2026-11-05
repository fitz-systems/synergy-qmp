"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, Search, SearchX, X } from "lucide-react";
import { courseArchiveParams, courseViewOptions, defaultCourseArchiveState } from "@/constants/courses";
import { courseArchiveHref, courseResultsStatus, filterByTransport, matchesCourseQuery, readCourseArchiveState, toggleCode } from "@/lib/helpers/course-archive";
import { noop } from "@/lib/helpers/function";
import type { CourseArchiveLabels, CourseArchiveState, CourseCode, CourseFilterOption, CourseListItem, CourseView } from "@/types/courses";
import { SidebarWidget } from "./course-sidebar";
import { CourseTile } from "./course-tile";

interface CourseArchiveProps {
  courses: CourseListItem[];
  modes: Record<CourseCode, string>;
  labels: CourseArchiveLabels;
  sidebar: React.ReactNode;
}

export function CourseArchive(props: CourseArchiveProps) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(params.get(courseArchiveParams.query) ?? "");

  const state = readCourseArchiveState(params, props.courses.map((course) => course.code), query);

  const pendingSearch = useRef<string | null>(null);
  useEffect(() => {
    pendingSearch.current = null;
  }, [params]);

  const update = (changes: Parameters<typeof courseArchiveHref>[2]) => {
    const href = courseArchiveHref(pathname, new URLSearchParams(pendingSearch.current ?? params.toString()), changes);
    pendingSearch.current = href.split("?")[1] ?? "";
    router.replace(href, { scroll: false });
  }

  return (
    <CourseArchiveView
      {...props}
      state={state}
      onView={(view) => update({ view: view === "list" ? "list" : null })}
      onQuery={(value) => {
        setQuery(value);
        update({ query: value.trim() || null });
      }}
      onTransport={(transport) => update({ transport: transport.length ? transport.join(",") : null })}
    />
  );
}

export function CourseArchiveFallback(props: CourseArchiveProps) {
  return <CourseArchiveView {...props} state={defaultCourseArchiveState} onView={noop} onQuery={noop} onTransport={noop}/>;
}

interface ArchiveViewProps extends CourseArchiveProps {
  state: CourseArchiveState;
  onView: (view: CourseView) => void;
  onQuery: (query: string) => void;
  onTransport: (transport: CourseCode[]) => void;
}

function CourseArchiveView({ courses, modes, labels, sidebar, state, onView, onQuery, onTransport }: ArchiveViewProps) {
  const searchId = useId();
  const searched = courses.filter((course) => matchesCourseQuery(course, state.query));
  const results = filterByTransport(searched, state.transport);
  const activeFilters = state.transport.length;
  const status = courseResultsStatus(labels, results.length);

  const filters = (
    <TransportFilter
      legend={labels.filterTransport}
      clearLabel={labels.clearFilters}
      options={courses.map((course) => ({
        code: course.code,
        label: modes[course.code],
        count: searched.filter((item) => item.code === course.code).length
      }))}
      selected={state.transport}
      onChange={onTransport}
    />
  );

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-14">
      <div className="min-w-0">
        <div className="flex flex-col gap-3 rounded-xl border border-line bg-canvas p-2.5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div role="group" aria-label={labels.layoutLabel} className="flex shrink-0 rounded-md bg-canvas-alt p-1">
              {courseViewOptions.map(({ view, labelKey, Icon }) => (
                <button
                  key={view}
                  type="button"
                  aria-pressed={state.view === view}
                  onClick={() => onView(view)}
                  className="inline-flex size-9 items-center justify-center rounded-[0.3rem] text-ink-subtle transition-[background-color,color,box-shadow] duration-200 hover:text-ink aria-pressed:bg-canvas aria-pressed:text-ink aria-pressed:shadow-[0_1px_2px_rgb(16_20_26/0.12)]"
                >
                  <Icon aria-hidden className="size-[1.125rem]" strokeWidth={1.75}/>
                  <span className="sr-only">{labels[labelKey]}</span>
                </button>
              ))}
            </div>
            <p aria-live="polite" className="text-[0.9375rem] text-ink-muted">{status}</p>
          </div>

          <div role="search" className="relative sm:ml-auto sm:w-72">
            <label htmlFor={searchId} className="sr-only">{labels.searchLabel}</label>
            <Search aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-subtle" strokeWidth={2}/>
            <input
              id={searchId}
              type="search"
              value={state.query}
              onChange={(event) => onQuery(event.target.value)}
              placeholder={labels.searchPlaceholder}
              className="h-11 w-full rounded-md border border-line-strong bg-canvas pl-10 pr-10 text-[0.9375rem] text-ink placeholder:text-ink-subtle transition-colors hover:border-ink-subtle focus:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/15 [&::-webkit-search-cancel-button]:hidden"
            />
            {state.query && (
              <button
                type="button"
                onClick={() => onQuery("")}
                className="absolute inset-y-0 right-0 inline-flex w-10 items-center justify-center rounded-r-md text-ink-subtle transition-colors hover:text-ink"
              >
                <X aria-hidden className="size-4" strokeWidth={2}/>
                <span className="sr-only">{labels.clearSearch}</span>
              </button>
            )}
          </div>
        </div>

        <details className="group mt-4 rounded-xl border border-line bg-canvas lg:hidden">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 font-semibold text-ink [&::-webkit-details-marker]:hidden">
            <span>
              {labels.filters}
              {activeFilters > 0 && (
                <span className="ml-2 inline-flex size-5 items-center justify-center rounded-full bg-brand text-xs font-bold tabular-nums text-ink">{activeFilters}</span>
              )}
            </span>
            <ChevronDown aria-hidden className="size-5 text-ink-muted transition-transform duration-300 ease-out-expo group-open:rotate-180" strokeWidth={1.75}/>
          </summary>
          <div className="border-t border-line px-4 py-4">{filters}</div>
        </details>

        {results.length > 0 ? (
          <ul className={`mt-8 ${state.view === "list" ? "flex flex-col gap-6" : "grid gap-6 sm:grid-cols-2"}`}>
            {results.map((course) => (
              <li key={course.code} className="flex">
                <CourseTile course={course} layout={state.view} readMore={labels.readMore}/>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-8 flex flex-col items-center rounded-xl border border-dashed border-line-strong bg-canvas px-6 py-14 text-center">
            <SearchX aria-hidden className="size-8 text-ink-subtle" strokeWidth={1.5}/>
            <h2 className="mt-4 text-xl font-semibold text-ink">{labels.emptyTitle}</h2>
            <p className="mt-2 max-w-md leading-relaxed text-ink-muted">{labels.emptyBody}</p>
            <button
              type="button"
              onClick={() => {
                onQuery("");
                onTransport([]);
              }}
              className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-ink px-5 text-[0.9375rem] font-semibold text-canvas transition-colors hover:bg-night"
            >
              {labels.clearFilters}
            </button>
          </div>
        )}
      </div>

      <aside className="space-y-10">
        <div className="hidden lg:block">
          <SidebarWidget title={labels.filters} titleId="filters-title">{filters}</SidebarWidget>
        </div>
        {sidebar}
      </aside>
    </div>
  );
}

interface TransportFilterProps {
  legend: string;
  clearLabel: string;
  options: CourseFilterOption[];
  selected: CourseCode[];
  onChange: (selected: CourseCode[]) => void;
}

function TransportFilter({ legend, clearLabel, options, selected, onChange }: TransportFilterProps) {
  const id = useId();

  return (
    <fieldset>
      <legend className="text-sm font-semibold text-ink-muted">{legend}</legend>
      <ul className="mt-2">
        {options.map((option) => (
          <li key={option.code}>
            <label
              htmlFor={`${id}-${option.code}`}
              className="flex min-h-11 cursor-pointer items-center gap-3 text-[0.9375rem] text-ink"
            >
              <input
                id={`${id}-${option.code}`}
                type="checkbox"
                checked={selected.includes(option.code)}
                onChange={(event) => onChange(toggleCode(selected, option.code, event.target.checked))}
                className="size-[1.125rem] shrink-0 cursor-pointer rounded accent-ink"
              />
              <span className="flex-1">{option.label}</span>
              <span className="rounded-full bg-canvas-alt px-2 py-0.5 text-xs font-semibold tabular-nums text-ink-muted">{option.count}</span>
            </label>
          </li>
        ))}
      </ul>
      {selected.length > 0 && (
        <button
          type="button"
          onClick={() => onChange([])}
          className="mt-2 text-sm font-semibold text-ink underline decoration-brand decoration-2 underline-offset-[0.3em] transition-colors hover:decoration-ink"
        >
          {clearLabel}
        </button>
      )}
    </fieldset>
  );
}
