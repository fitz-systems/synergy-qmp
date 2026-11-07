import type { NextRequest } from "next/server";
import { courseMaterialDownloadParam } from "@/constants/course-material";
import { getCourseMaterialForUser } from "@/lib/course-material";
import { getCurrentUser } from "@/lib/session";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const material = await getCourseMaterialForUser(user);
  if (!material) return new Response("No course material", { status: 404 });

  const disposition = request.nextUrl.searchParams.has(courseMaterialDownloadParam) ? "attachment" : "inline";
  return new Response(material.stream, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${disposition}; filename="${material.fileName}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff"
    }
  });
}
