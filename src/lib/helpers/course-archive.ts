import { courseArchiveParams } from "@/constants/courses";
import type { CourseArchiveLabels, CourseArchiveState, CourseCode, CourseListItem } from "@/types/courses";
import type { SearchParamsLike } from "@/types/navigation";
import { interpolate } from "./format";

export function normalizeSearch(value: string) {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
}

export function matchesCourseQuery(course: CourseListItem, query: string) {
  const needle = normalizeSearch(query);
  if (!needle) return true;
  return normalizeSearch(`${course.title} ${course.description} ${course.mode}`).includes(needle);
}

export function filterByTransport(courses: CourseListItem[], transport: CourseCode[]) {
  return transport.length === 0 ? courses : courses.filter((course) => transport.includes(course.code));
}

export function toggleCode(selected: CourseCode[], code: CourseCode, checked: boolean) {
  return checked ? [...selected, code] : selected.filter((item) => item !== code);
}

export function readCourseArchiveState(params: SearchParamsLike, codes: CourseCode[], query: string): CourseArchiveState {
  const transport = (params.get(courseArchiveParams.transport) ?? "").split(",");
  return {
    view: params.get(courseArchiveParams.view) === "list" ? "list" : "grid",
    query,
    transport: transport.filter((code): code is CourseCode => codes.includes(code as CourseCode))
  }
}

export function courseArchiveHref(pathname: string, params: SearchParamsLike, changes: Partial<Record<keyof typeof courseArchiveParams, string | null>>) {
  const next = new URLSearchParams(params.toString());
  for (const [key, value] of Object.entries(changes)) {
    const name = courseArchiveParams[key as keyof typeof courseArchiveParams];
    if (value) next.set(name, value);
    else next.delete(name);
  }
  const search = next.toString();
  return search ? `${pathname}?${search}` : pathname;
}

export function courseResultsStatus(labels: CourseArchiveLabels, count: number) {
  if (count === 0) return labels.showingNone;
  if (count === 1) return labels.showingOne;
  return interpolate(labels.showing, { from: 1, to: count, total: count });
}
