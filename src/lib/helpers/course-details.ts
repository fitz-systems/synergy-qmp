import type { Locale } from "@/i18n/config";
import type { Course, CourseFeatureRow, CoursesCopy, CurriculumItem } from "@/types/courses";
import { interpolate, plural } from "./format";

export function courseFeatureRows(course: Course, features: CoursesCopy["detail"]["features"], locale: Locale): CourseFeatureRow[] {
  return [
    { key: "lectures", label: features.lectures, value: course.lectures },
    { key: "quizzes", label: features.quizzes, value: course.quizzes },
    { key: "duration", label: features.duration, value: plural(locale, features.durationValue, course.durationHours) },
    { key: "skillLevel", label: features.skillLevel, value: features.skillLevelValue },
    { key: "language", label: features.language, value: features.languageValue },
    { key: "students", label: features.students, value: course.students.toLocaleString(locale) },
    { key: "certificate", label: features.certificate, value: features.certificateValue },
    { key: "assessments", label: features.assessments, value: features.assessmentsValue }
  ];
}

export function courseCurriculumItems(course: Course, curriculum: CoursesCopy["detail"]["curriculum"], locale: Locale): CurriculumItem[] {
  return [
    {
      kind: "lecture",
      label: `${curriculum.lecture} 1.1`,
      title: course.lectureTitle,
      meta: interpolate(curriculum.minutes, { count: course.lectureMinutes })
    },
    {
      kind: "quiz",
      label: `${curriculum.quiz} 1.1`,
      title: curriculum.examTitle,
      meta: plural(locale, curriculum.questions, course.examQuestions)
    }
  ];
}
