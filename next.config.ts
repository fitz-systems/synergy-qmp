import type { NextConfig } from "next";
import { legacyRedirects } from "./src/constants/legacy-redirects.ts";

const nextConfig: NextConfig = {
  async redirects() {
    return legacyRedirects.map((redirect) => ({ ...redirect, statusCode: 301 as const }));
  },
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    globalNotFound: true,
    serverActions: {
      bodySizeLimit: "2mb"
    }
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css"
      }
    }
  }
}

export default nextConfig;
