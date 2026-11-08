import type { MetadataRoute } from "next";
import { courseCodes } from "@/constants/courses";
import { sitemapRoutes } from "@/constants/seo";
import { courseHref, localizedHref } from "@/lib/helpers/routes";
import { sitemapEntry } from "@/lib/helpers/sitemap";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...sitemapRoutes.flatMap((route) => sitemapEntry((locale) => localizedHref(locale, route))),
    ...courseCodes.flatMap((code) => sitemapEntry((locale) => courseHref(locale, code)))
  ];
}
