import type { Metadata, MetadataRoute } from "next";
import { openGraphLocales, shareImageSize, siteName, siteUrl } from "@/constants/seo";
import { locales, type Locale } from "@/i18n/config";
import type { LocalizedMetadataInput } from "@/types/seo";

export function sitemapEntry(path: (locale: Locale) => string): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(locales.map((locale) => [locale, `${siteUrl}${path(locale)}`]));
  return locales.map((locale) => ({ url: languages[locale], alternates: { languages } }));
}

export function siteMetadataBase() {
  return process.env.VERCEL_ENV === "production" ? new URL(siteUrl) : undefined;
}

export function sharingMetadata(locale: Locale, title: string, description: string, url?: string): Pick<Metadata, "openGraph" | "twitter"> {
  const images = [{ url: `/${locale}/opengraph-image`, ...shareImageSize, alt: siteName }];
  return {
    openGraph: { type: "website", siteName, locale: openGraphLocales[locale], title, description, url, images },
    twitter: { card: "summary_large_image", title, description, images }
  }
}

export function localizedMetadata({ locale, title, description, path }: LocalizedMetadataInput): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: path(locale),
      languages: Object.fromEntries(locales.map((language) => [language, path(language)]))
    },
    ...sharingMetadata(locale, title, description, path(locale))
  }
}
