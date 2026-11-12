import Image from "next/image";
import Link from "next/link";
import courseImage from "@/assets/images/course-tdg.jpg";

import { ArrowRight, MessageSquare, Users } from "lucide-react";
import { courseModeIcons } from "@/constants/courses";
import type { CourseListItem, CourseView } from "@/types/courses";

interface CourseTileProps {
  course: CourseListItem;
  layout?: CourseView;
  readMore?: string;
  headingLevel?: "h2" | "h3";
}

export function CourseTile({ course, layout = "grid", readMore, headingLevel = "h2" }: CourseTileProps) {
  const Icon = courseModeIcons[course.code];
  const Heading = headingLevel;
  const isList = layout === "list";

  return (
    <article
      className={`group relative flex w-full flex-col overflow-hidden rounded-xl border border-line bg-canvas transition-[box-shadow,border-color] duration-300 ease-out-expo hover:border-line-strong hover:shadow-raise has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-ink ${isList ? "sm:flex-row" : ""}`}
    >
      <div className={`relative overflow-hidden bg-night ${isList ? "sm:w-64 sm:shrink-0 md:w-72" : ""}`}>
        <Image
          src={courseImage}
          alt={course.imageAlt}
          placeholder="blur"
          sizes={isList ? "(min-width: 640px) 288px, 100vw" : "(min-width: 1024px) 420px, (min-width: 640px) 50vw, 100vw"}
          className={`aspect-[8/5] w-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.03] ${isList ? "sm:h-full" : ""}`}
        />
      </div>

      <div className={`flex flex-1 flex-col ${isList ? "p-5 sm:p-6" : "p-5"}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-ink-subtle">{course.teacher}</p>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-2.5 py-0.5 text-[0.8125rem] font-semibold text-on-brand">
            <Icon aria-hidden className="size-3.5" strokeWidth={2}/>
            {course.mode}
          </span>
        </div>
        <Heading className="mt-2 text-lg font-semibold leading-snug text-ink">
          <Link href={course.href} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
            {course.title}
          </Link>
        </Heading>
        {isList && <p className="mt-2 leading-relaxed text-ink-muted">{course.description}</p>}

        <div className="mt-auto pt-5">
          <div className="flex items-center justify-between gap-4 border-t border-line pt-4 text-sm text-ink-subtle">
            <span className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5">
                <Users aria-hidden className="size-4" strokeWidth={1.75}/>
                {course.students}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MessageSquare aria-hidden className="size-4" strokeWidth={1.75}/>
                {course.reviews}
              </span>
            </span>
          </div>
        </div>

        {isList && readMore && (
          <span aria-hidden className="mt-4 inline-flex items-center gap-1.5 text-[0.9375rem] font-semibold text-ink">
            {readMore}
            <ArrowRight className="size-4 transition-transform duration-300 ease-out-expo group-hover:translate-x-1" strokeWidth={2}/>
          </span>
        )}
      </div>
    </article>
  );
}
