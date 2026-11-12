import { resetLinkCallbackParam } from "@/constants/auth";
import { defaultLocale, hasLocale, type Locale } from "@/i18n/config";
import type { AuthUserProfile } from "@/types/auth";

export function resolveLocale(value: unknown): Locale {
  const locale = String(value ?? "");
  return hasLocale(locale) ? locale : defaultLocale;
}

export function resetLinkLocale(url: string, user: AuthUserProfile): Locale {
  const callback = new URL(url).searchParams.get(resetLinkCallbackParam) ?? "";
  const segment = callback.split("/")[1] ?? "";
  return hasLocale(segment) ? segment : resolveLocale(user.preferredLocale);
}
