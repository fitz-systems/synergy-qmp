import { adminReviewSelect } from "@/constants/admin";
import { adminReview } from "@/lib/helpers/admin-reviews";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import type { AdminReview } from "@/types/admin";

export async function getAdminReviews(): Promise<AdminReview[]> {
  await requireAdmin();
  const records = await prisma.review.findMany({ orderBy: [{ locale: "asc" }, { sortOrder: "asc" }, { id: "asc" }], select: adminReviewSelect });
  return records.map(adminReview);
}

export async function getAdminReview(id: number): Promise<AdminReview | null> {
  await requireAdmin();
  if (!Number.isInteger(id) || id <= 0) return null;
  const record = await prisma.review.findUnique({ where: { id }, select: adminReviewSelect });
  return record ? adminReview(record) : null;
}

export async function getNextReviewSortOrder() {
  await requireAdmin();
  const { _max } = await prisma.review.aggregate({ _max: { sortOrder: true } });
  return (_max.sortOrder ?? 0) + 1;
}
