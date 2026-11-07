import type { Locale } from "@/i18n/config";
import type { CourseCode } from "@/types/courses";

export const courseMaterialHref = "/api/course-material";

export const courseMaterialDownloadParam = "download";

export const courseMaterialFolder = "course-material";

export const legacyCourseMaterialFiles: Record<string, { code: CourseCode; locale: Locale }> = {
  "TDG Ground.pdf": { code: "ground", locale: "en" },
  "TDG Air.pdf": { code: "air", locale: "en" },
  "TMD French ground.pdf": { code: "ground", locale: "fr" },
  "TMD Aerien.pdf": { code: "air", locale: "fr" }
}
