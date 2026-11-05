import { routes, type Route } from "@/constants/routes";
import type { Locale } from "@/i18n/config";

export function localizedHref(locale: Locale, route: Route) {
  return `/${locale}${routes[route]}`;
}

export function courseHref(locale: Locale, code: string) {
  return `${localizedHref(locale, "courses")}/${code}`;
}
