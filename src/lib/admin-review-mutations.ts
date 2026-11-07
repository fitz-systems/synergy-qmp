import { adminReviewSelect, reviewActionMessages } from "@/constants/admin";
import { recordAudit } from "@/lib/audit";
import { adminReview, reviewChanges, reviewData, reviewDetails } from "@/lib/helpers/admin-reviews";
import { prisma } from "@/lib/prisma";
import type { AdminActionResult, ReviewFormValues } from "@/types/admin";

export async function saveReview(adminId: number, reviewId: number | null, values: ReviewFormValues) {
  return prisma.$transaction(async (tx) => {
    const data = reviewData(values);
    if (reviewId === null) {
      const created = await tx.review.create({ data, select: { id: true } });
      await recordAudit(tx, { adminId, action: "reviewCreated", entity: "review", entityId: created.id, entityLabel: data.author, details: reviewDetails(values) });
      return created;
    }

    const record = await tx.review.findUnique({ where: { id: reviewId }, select: adminReviewSelect });
    if (!record) return null;
    await tx.review.update({ where: { id: reviewId }, data });
    const details = reviewChanges(adminReview(record), values);
    if (details) await recordAudit(tx, { adminId, action: "reviewUpdated", entity: "review", entityId: reviewId, entityLabel: data.author, details });
    return { id: reviewId }
  });
}

export async function deleteReview(adminId: number, reviewId: number): Promise<AdminActionResult> {
  return prisma.$transaction(async (tx) => {
    const record = await tx.review.findUnique({ where: { id: reviewId }, select: adminReviewSelect });
    if (!record) return { ok: false, error: reviewActionMessages.notFound }
    await tx.review.delete({ where: { id: reviewId } });
    await recordAudit(tx, { adminId, action: "reviewDeleted", entity: "review", entityLabel: record.author, details: record.published ? "Was published" : "Was a draft" });
    return { ok: true }
  });
}
