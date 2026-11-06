import { defaultLocale, hasLocale, type Locale } from "@/i18n/config";

export function resolveLocale(value: unknown): Locale {
  const locale = String(value ?? "");
  return hasLocale(locale) ? locale : defaultLocale;
}
