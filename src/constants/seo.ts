import { routes, type Route } from "@/constants/routes";
import { locales, type Locale } from "@/i18n/config";

export const siteUrl = "https://www.synergyqmp.com";

export const sitemapRoutes: Route[] = ["home", "about", "courses", "contact", "privacy"];

export const crawlerBlockedPaths = ["/admin", "/api", ...locales.map((locale) => `/${locale}${routes.myCourse}`)];

export const siteName = "Synergy QMP";

export const openGraphLocales: Record<Locale, string> = {
  en: "en_CA",
  fr: "fr_CA"
}

export const shareImageSize = { width: 1200, height: 630 }

export const shareImageColors = {
  background: "#14171c",
  text: "#ffffff",
  muted: "#a3abb8",
  outline: "#2e343e",
  brand: "#ffb606"
}
