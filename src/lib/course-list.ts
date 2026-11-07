import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { getCourses, getPublishedReviews } from "@/lib/courses";
import { formatPrice, plural } from "@/lib/helpers/format";
import { courseHref } from "@/lib/helpers/routes";
import type { CourseListItem } from "@/types/courses";

export async function getCourseListItems(): Promise<CourseListItem[]> {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const [courses, reviews] = await Promise.all([getCourses(locale), getPublishedReviews(locale)]);
  const copy = dict.coursesPage;

  return courses.map((course) => ({
    code: course.code,
    href: courseHref(locale, course.code),
    title: course.title,
    description: course.description,
    mode: copy.modes[course.code],
    teacher: copy.teacherName,
    price: formatPrice(locale, course.price),
    students: plural(locale, copy.archive.students, course.students),
    reviews: plural(locale, copy.archive.reviews, reviews.length),
    imageAlt: copy.imageAlt
  }));
}
