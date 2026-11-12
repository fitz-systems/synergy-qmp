import { getSessionCookie } from "better-auth/cookies";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { unlocalizedSegments } from "@/constants/routes";
import { defaultLocale, hasLocale, type Locale } from "@/i18n/config";
import { signInPathFor } from "@/lib/helpers/routes";

function preferredLocale(request: NextRequest): Locale {
  const header = request.headers.get("accept-language") ?? "";
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { lang: tag.toLowerCase().split("-")[0], q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  const match = ranked.find((entry) => hasLocale(entry.lang));
  return match && hasLocale(match.lang) ? match.lang : defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const signInPath = signInPathFor(pathname);
  if (signInPath && !getSessionCookie(request)) return NextResponse.redirect(new URL(signInPath, request.url));

  const firstSegment = pathname.split("/")[1] ?? "";
  if (hasLocale(firstSegment) || unlocalizedSegments.includes(firstSegment)) return;

  request.nextUrl.pathname = `/${preferredLocale(request)}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"]
}
