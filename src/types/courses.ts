import type { ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

export type CourseCode = "ground" | "air";

export type CourseView = "grid" | "list";

export type CoursesCopy = Dictionary["coursesPage"];

export type CourseArchiveLabels = CoursesCopy["archive"];

export type CourseShareLabels = CoursesCopy["detail"]["share"];

export type CourseFeatureKey = "lectures" | "quizzes" | "duration" | "skillLevel" | "language" | "students" | "certificate" | "assessments";

export type CurriculumItemKind = "lecture" | "quiz";

export interface CourseLocaleContent {
  title: string;
  description: string;
  lectureTitle: string;
  outcomes: string[];
}

export interface CourseContent {
  code: CourseCode;
  price: number;
  lectures: number;
  quizzes: number;
  durationHours: number;
  lectureMinutes: number;
  examQuestions: number;
  locales: Record<Locale, CourseLocaleContent>;
}

export interface Course extends Omit<CourseContent, "locales">, CourseLocaleContent {
  students: number;
}

export interface CourseReview {
  id: number;
  author: string;
  roleCompany: string | null;
  body: string;
  rating: number | null;
}

export interface CourseListItem {
  code: CourseCode;
  href: string;
  title: string;
  description: string;
  mode: string;
  teacher: string;
  price: string;
  students: string;
  reviews: string;
  imageAlt: string;
}

export interface CourseArchiveState {
  view: CourseView;
  query: string;
  transport: CourseCode[];
}

export interface CourseFilterOption {
  code: CourseCode;
  label: string;
  count: number;
}

export interface CourseFeatureRow {
  key: CourseFeatureKey;
  label: string;
  value: string | number;
}

export interface CurriculumItem {
  kind: CurriculumItemKind;
  label: string;
  title: string;
  meta: string;
}

export interface RatingBucket {
  stars: number;
  count: number;
  share: number;
}

export interface RatingSummary {
  average: number;
  averageLabel: string;
  ratedCount: number;
  buckets: RatingBucket[];
}

export interface CourseTab {
  id: string;
  label: string;
  content: ReactNode;
}

export interface ShareLink {
  key: "linkedin" | "facebook" | "email";
  href: string;
  external: boolean;
}
