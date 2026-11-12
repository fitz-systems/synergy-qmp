import { adminLoginPath, courseCodes, routes, unlocalizedSegments, type Route } from "@/constants/routes";
import { hasLocale, type Locale } from "@/i18n/config";

export function localizedHref(locale: Locale, route: Route) {
  return `/${locale}${routes[route]}`;
}

export function courseHref(locale: Locale, code: string) {
  return `${localizedHref(locale, "courses")}/${code}`;
}

export function signInPathFor(pathname: string) {
  const [, first = "", second = ""] = pathname.split("/");
  if (first === unlocalizedSegments[0]) return pathname === adminLoginPath || pathname.startsWith(`${adminLoginPath}/`) ? null : adminLoginPath;
  if (hasLocale(first) && `/${second}` === routes.myCourse) return localizedHref(first, "login");
  return null;
}

export function isUnknownCoursePath(pathname: string) {
  const [, first = "", second = "", code = "", ...rest] = pathname.split("/");
  return hasLocale(first) && `/${second}` === routes.courses && code !== "" && rest.every((part) => part === "") && !courseCodes.some((known) => known === code);
}
