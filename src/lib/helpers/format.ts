import type { Locale } from "@/i18n/config";
import type { PluralForms } from "@/types/i18n";

export function interpolate(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}

export function plural(locale: Locale, forms: PluralForms, count: number) {
  const form = new Intl.PluralRules(locale).select(count) === "one" ? forms.one : forms.other;
  return interpolate(form, { count: count.toLocaleString(locale) });
}

export function formatPrice(locale: Locale, amount: number) {
  return new Intl.NumberFormat(`${locale}-CA`, { style: "currency", currency: "CAD" }).format(amount);
}

export function formatRating(locale: Locale, rating: number) {
  return rating.toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export function formatDate(locale: Locale, isoDate: string) {
  return new Intl.DateTimeFormat(`${locale}-CA`, { dateStyle: "long", timeZone: "UTC" }).format(new Date(isoDate));
}

export function formatPercent(locale: Locale, percent: number) {
  return new Intl.NumberFormat(`${locale}-CA`, { style: "percent", maximumFractionDigits: 0 }).format(percent / 100);
}

export function formatCountdown(ms: number) {
  const totalSeconds = Math.ceil(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return hours > 0 ? `${hours}:${String(minutes).padStart(2, "0")}:${seconds}` : `${minutes}:${seconds}`;
}
