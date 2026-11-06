import type { Locale } from "@/i18n/config";
import type { NotFoundLinks } from "@/types/not-found";
import { localizedHref } from "./routes";

export function notFoundLinks(locale: Locale): NotFoundLinks {
  return {
    home: localizedHref(locale, "home"),
    courses: localizedHref(locale, "courses"),
    contact: localizedHref(locale, "contact")
  }
}
