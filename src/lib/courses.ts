import { cacheLife, cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { courses } from "@/content/courses";
import type { Locale } from "@/i18n/config";
import { prisma } from "@/lib/prisma";
import type { Course, CourseCode, CourseContent, CourseReview } from "@/types/courses";

export const courseCodes = courses.map((course) => course.code);

export function isCourseCode(value: string): value is CourseCode {
  return courseCodes.includes(value as CourseCode);
}

export async function courseCodeFromParams(params: Promise<{ code: string }>) {
  const { code } = await params;
  if (!isCourseCode(code)) notFound();
  return code;
}

async function getStudentCounts(): Promise<Partial<Record<CourseCode, number>>> {
  "use cache";
  cacheTag("enrollments");

  try {
    const rows = await prisma.course.findMany({
      select: { code: true, locales: { select: { _count: { select: { enrollments: true } } } } }
    });
    cacheLife("hours");
    return Object.fromEntries(rows.map((row) => [row.code, row.locales.reduce((sum, locale) => sum + locale._count.enrollments, 0)]));
  } catch (error) {
    console.error("Failed to load course student counts", error);
    cacheLife("seconds");
    return {}
  }
}

function localize(course: CourseContent, locale: Locale, students: number): Course {
  const { locales, ...rest } = course;
  return { ...rest, ...locales[locale], students }
}

export async function getCourses(locale: Locale): Promise<Course[]> {
  const counts = await getStudentCounts();
  return courses.map((course) => localize(course, locale, counts[course.code] ?? 0));
}

export async function getCourse(code: CourseCode, locale: Locale): Promise<Course> {
  const all = await getCourses(locale);
  return all.find((course) => course.code === code)!;
}

export async function getCourseReviews(locale: Locale): Promise<CourseReview[]> {
  "use cache";
  cacheTag("reviews");

  try {
    const reviews = await prisma.review.findMany({
      where: { locale, published: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, author: true, roleCompany: true, body: true, rating: true }
    });
    cacheLife("hours");
    return reviews;
  } catch (error) {
    console.error("Failed to load course reviews", error);
    cacheLife("seconds");
    return [];
  }
}
