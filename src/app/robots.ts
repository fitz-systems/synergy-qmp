import type { MetadataRoute } from "next";
import { crawlerBlockedPaths, siteUrl } from "@/constants/seo";

export default function robots(): MetadataRoute.Robots {
  if (process.env.VERCEL_ENV !== "production") return { rules: { userAgent: "*", disallow: "/" } }

  return {
    rules: { userAgent: "*", allow: "/", disallow: crawlerBlockedPaths },
    sitemap: `${siteUrl}/sitemap.xml`
  }
}
