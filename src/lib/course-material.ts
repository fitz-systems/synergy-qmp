import { get } from "@vercel/blob";
import { isCourseCode } from "@/lib/courses";
import { loadCurrentEnrollment } from "@/lib/enrollment";
import { courseMaterialFileName } from "@/lib/helpers/course-material";
import { resolveLocale } from "@/lib/helpers/locale";
import type { SessionUser } from "@/types/auth";

export async function getCourseMaterialForUser(user: SessionUser) {
  const record = await loadCurrentEnrollment(user.id);
  const key = record?.courseLocale.materialFileKey;
  const code = record?.courseLocale.course.code;
  if (!record || !key || !code || !isCourseCode(code)) return null;

  const blob = await get(key, { access: "private" });
  if (!blob || blob.statusCode !== 200) return null;
  return { stream: blob.stream, fileName: courseMaterialFileName(code, resolveLocale(record.locale)) }
}
