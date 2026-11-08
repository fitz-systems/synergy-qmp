import { routes, type Route } from "@/constants/routes";
import { locales } from "@/i18n/config";

export const siteUrl = "https://www.synergyqmp.com";

export const sitemapRoutes: Route[] = ["home", "about", "courses", "contact", "privacy"];

export const crawlerBlockedPaths = ["/admin", "/api", ...locales.map((locale) => `/${locale}${routes.myCourse}`)];
