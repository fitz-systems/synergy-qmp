import { Award, BookOpen, ClipboardCheck, type LucideIcon } from "lucide-react";
import type { CourseStepKey } from "@/types/student";

export const courseStepIcons: Record<CourseStepKey, LucideIcon> = {
  material: BookOpen,
  exam: ClipboardCheck,
  certificate: Award
}

export const courseStepOrder: CourseStepKey[] = ["material", "exam", "certificate"];

export const certificateValidYears = 3;

export const certificateCredits = 1;

// Todo: Point at the auth-checked course material route once the PDFs are in private storage
export const courseMaterialPlaceholderHref = "#course-material";

// Todo: Point at the generated certificate PDF route
export const certificatePdfPlaceholderHref = "#certificate-pdf";
