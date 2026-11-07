import { cacheLife, cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { coursesCacheTag, enrollmentsCacheTag, reviewsCacheTag } from "@/constants/cache";
import { courseCodes, courseLectureCount, courseQuizCount } from "@/constants/courses";
import type { Locale } from "@/i18n/config";
import { prisma } from "@/lib/prisma";
import type { Course, CourseCode, CourseReview } from "@/types/courses";

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
  cacheTag(enrollmentsCacheTag);

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

async function getCourseCopy(locale: Locale): Promise<Omit<Course, "students">[]> {
  "use cache";
  cacheTag(coursesCacheTag);
  cacheLife("hours");

  const rows = await prisma.courseLocale.findMany({
    where: { locale, course: { code: { in: courseCodes } } },
    select: {
      name: true,
      description: true,
      lectureTitle: true,
      outcomes: true,
      course: { select: { code: true, priceCents: true, durationHours: true, lectureMinutes: true, questionsPerAttempt: true } }
    }
  });

  return rows
    .map(({ course, ...copy }) => ({
      code: course.code as CourseCode,
      title: copy.name,
      description: copy.description ?? "",
      lectureTitle: copy.lectureTitle,
      outcomes: copy.outcomes,
      price: course.priceCents / 100,
      lectures: courseLectureCount,
      quizzes: courseQuizCount,
      durationHours: course.durationHours,
      lectureMinutes: course.lectureMinutes,
      examQuestions: course.questionsPerAttempt
    }))
    .sort((a, b) => courseCodes.indexOf(a.code) - courseCodes.indexOf(b.code));
}

export async function getCourses(locale: Locale): Promise<Course[]> {
  const [copy, counts] = await Promise.all([getCourseCopy(locale), getStudentCounts()]);
  return copy.map((course) => ({ ...course, students: counts[course.code] ?? 0 }));
}

export async function getCourse(code: CourseCode, locale: Locale): Promise<Course> {
  const all = await getCourses(locale);
  const course = all.find((item) => item.code === code);
  if (!course) notFound();
  return course;
}

export async function getPublishedReviews(locale: Locale): Promise<CourseReview[]> {
  "use cache";
  cacheTag(reviewsCacheTag);

  try {
    const reviews = await prisma.review.findMany({
      where: { locale, published: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, author: true, roleCompany: true, body: true, rating: true }
    });
    cacheLife("hours");
    return reviews;
  } catch (error) {
    console.error("Failed to load published reviews", error);
    cacheLife("seconds");
    return [];
  }
}
