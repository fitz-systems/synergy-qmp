import { get } from "@vercel/blob";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import type { NextRequest } from "next/server";
import { adminRole } from "@/constants/auth";
import { courseMaterialContentType, courseMaterialMaxBytes } from "@/constants/admin";
import { hasLocale } from "@/i18n/config";
import { isCourseOption } from "@/lib/helpers/admin";
import { courseMaterialFileName, courseMaterialKey } from "@/lib/helpers/course-material";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

async function isAdmin() {
  const user = await getCurrentUser();
  return user?.role === adminRole;
}

export async function GET(request: NextRequest) {
  if (!await isAdmin()) return new Response("Unauthorized", { status: 401 });

  const code = request.nextUrl.searchParams.get("code") ?? "";
  const locale = request.nextUrl.searchParams.get("locale") ?? "";
  if (!isCourseOption(code) || !hasLocale(locale)) return new Response("Not found", { status: 404 });

  const row = await prisma.courseLocale.findFirst({ where: { locale, course: { code } }, select: { materialFileKey: true } });
  const blob = row?.materialFileKey ? await get(row.materialFileKey, { access: "private" }) : null;
  if (!blob || blob.statusCode !== 200) return new Response("No course material", { status: 404 });

  return new Response(blob.stream, {
    headers: {
      "Content-Type": courseMaterialContentType,
      "Content-Disposition": `inline; filename="${courseMaterialFileName(code, locale)}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff"
    }
  });
}

export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (!await isAdmin()) throw new Error("Not an admin");
        const { code, locale } = JSON.parse(clientPayload ?? "{}") as { code?: string; locale?: string };
        if (!code || !locale || !isCourseOption(code) || !hasLocale(locale) || pathname !== courseMaterialKey(code, locale)) throw new Error("Invalid course material path");
        return { allowedContentTypes: [courseMaterialContentType], maximumSizeInBytes: courseMaterialMaxBytes, addRandomSuffix: true }
      }
    });
    return Response.json(result);
  } catch (error) {
    console.error("Course material upload token failed", error);
    return Response.json({ error: "Upload refused" }, { status: 400 });
  }
}
