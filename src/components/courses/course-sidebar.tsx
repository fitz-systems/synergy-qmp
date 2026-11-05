import Image from "next/image";
import Link from "next/link";
import courseImage from "@/assets/images/course-tdg.jpg";

import { Search } from "lucide-react";
import type { CourseListItem } from "@/types/courses";

interface SidebarWidgetProps {
  title: string;
  titleId: string;
  children: React.ReactNode;
}

export function SidebarWidget({ title, titleId, children }: SidebarWidgetProps) {
  return (
    <section
      aria-labelledby={titleId}
      className="relative border-t border-line-strong pt-5 before:absolute before:-top-px before:left-0 before:h-0.5 before:w-10 before:bg-brand"
    >
      <h2 id={titleId} className="text-lg font-semibold text-ink">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

interface OurCoursesProps {
  title: string;
  courses: CourseListItem[];
  currentCode?: string;
}

export function OurCourses({ title, courses, currentCode }: OurCoursesProps) {
  return (
    <SidebarWidget title={title} titleId="our-courses-title">
      <ul className="space-y-4">
        {courses.map((course) => (
          <li key={course.code} className="group relative flex items-start gap-3.5">
            <Image
              src={courseImage}
              alt=""
              sizes="96px"
              className="aspect-[8/5] w-24 shrink-0 rounded-md object-cover"
            />
            <div className="min-w-0">
              <Link
                href={course.href}
                aria-current={course.code === currentCode ? "page" : undefined}
                className="text-[0.9375rem] font-semibold leading-snug text-ink underline decoration-transparent decoration-2 underline-offset-[0.25em] transition-colors after:absolute after:inset-0 after:content-[''] group-hover:decoration-brand aria-[current=page]:decoration-brand"
              >
                {course.title}
              </Link>
              <p className="mt-1 text-sm font-semibold tabular-nums text-ink-muted">{course.price}</p>
            </div>
          </li>
        ))}
      </ul>
    </SidebarWidget>
  );
}

interface SidebarSearchProps {
  title: string;
  action: string;
  label: string;
  placeholder: string;
  submit: string;
}

export function SidebarSearch({ title, action, label, placeholder, submit }: SidebarSearchProps) {
  return (
    <SidebarWidget title={title} titleId="sidebar-search-title">
      <form action={action} role="search" className="relative">
        <label htmlFor="sidebar-search" className="sr-only">{label}</label>
        <input
          id="sidebar-search"
          type="search"
          name="q"
          placeholder={placeholder}
          className="h-11 w-full rounded-md border border-line-strong bg-canvas pl-3.5 pr-11 text-[0.9375rem] text-ink placeholder:text-ink-subtle transition-colors hover:border-ink-subtle focus:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/15"
        />
        <button
          type="submit"
          className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center rounded-r-md text-ink-muted transition-colors hover:text-ink"
        >
          <Search aria-hidden className="size-4" strokeWidth={2}/>
          <span className="sr-only">{submit}</span>
        </button>
      </form>
    </SidebarWidget>
  );
}
