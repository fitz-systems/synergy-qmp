import { courseMaterialDownloadParam, courseMaterialFolder, courseMaterialHref } from "../../constants/course-material.ts";
import type { Locale } from "@/i18n/config";
import type { CourseCode } from "@/types/courses";

export function courseMaterialKey(code: CourseCode, locale: Locale) {
  return `${courseMaterialFolder}/${code}-${locale}.pdf`;
}

export function courseMaterialFileName(code: CourseCode, locale: Locale) {
  return `synergy-qmp-${code}-${locale}.pdf`;
}

export function courseMaterialDownloadHref() {
  return `${courseMaterialHref}?${courseMaterialDownloadParam}=1`;
}
