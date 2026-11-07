import { Award, ChartNoAxesColumn, ClipboardCheck, Clock, FileText, Languages, LayoutGrid, List, Plane, Truck, UserCheck, Users, type LucideIcon } from "lucide-react";
import type { CourseArchiveState, CourseCode, CourseFeatureKey, CurriculumItemKind } from "@/types/courses";

export const courseArchiveParams = {
  view: "view",
  query: "q",
  transport: "transport"
} as const;

export const defaultCourseArchiveState: CourseArchiveState = {
  view: "grid",
  query: "",
  transport: []
}

export const courseViewOptions = [
  { view: "grid", labelKey: "gridView", Icon: LayoutGrid },
  { view: "list", labelKey: "listView", Icon: List }
] as const;

export const courseModeIcons = {
  ground: Truck,
  air: Plane
}

export const courseFeatureIcons: Record<CourseFeatureKey, LucideIcon> = {
  lectures: FileText,
  quizzes: ClipboardCheck,
  duration: Clock,
  skillLevel: ChartNoAxesColumn,
  language: Languages,
  students: Users,
  certificate: Award,
  assessments: UserCheck
}

export const curriculumIcons: Record<CurriculumItemKind, LucideIcon> = {
  lecture: FileText,
  quiz: ClipboardCheck
}

export const ratingMax = 5;

export const ratingScale = [5, 4, 3, 2, 1];

export const courseCodes: CourseCode[] = ["ground", "air"];

export const courseLectureCount = 1;

export const courseQuizCount = 1;
