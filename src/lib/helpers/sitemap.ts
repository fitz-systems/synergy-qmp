import type { MetadataRoute } from "next";
import { siteUrl } from "@/constants/seo";
import { locales, type Locale } from "@/i18n/config";

export function sitemapEntry(path: (locale: Locale) => string): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(locales.map((locale) => [locale, `${siteUrl}${path(locale)}`]));
  return locales.map((locale) => ({ url: languages[locale], alternates: { languages } }));
}
