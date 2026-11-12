import type { NextConfig } from "next";
import { legacyRedirects } from "./src/constants/legacy-redirects.ts";
import { securityHeaders } from "./src/constants/security.ts";

const nextConfig: NextConfig = {
  async redirects() {
    return legacyRedirects.map((redirect) => ({ ...redirect, statusCode: 301 as const }));
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
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
