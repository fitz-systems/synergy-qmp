"use server";

import { updateTag } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { adminRoutes, reviewActionMessages } from "@/constants/admin";
import { reviewsCacheTag } from "@/constants/cache";
import { deleteReview as deleteStoredReview, saveReview as saveStoredReview } from "@/lib/admin-review-mutations";
import { readReviewForm, validateReviewForm } from "@/lib/helpers/admin-reviews";
import { requireAdmin } from "@/lib/session";
import type { AdminActionResult, ReviewFormState } from "@/types/admin";

export async function saveReview(reviewId: number | null, _previous: ReviewFormState, formData: FormData): Promise<ReviewFormState> {
  const admin = await requireAdmin();
  if (reviewId !== null && !Number.isInteger(reviewId)) notFound();
  const values = readReviewForm(formData);
  const errors = validateReviewForm(values);
  if (Object.keys(errors).length > 0) return { status: "invalid", values, errors }

  let saved: Awaited<ReturnType<typeof saveStoredReview>>;
  try {
    saved = await saveStoredReview(admin.id, reviewId, values);
  } catch (error) {
    console.error("Saving review failed", error);
    return { status: "failed", values, errors: {} }
  }
  if (!saved) notFound();

  updateTag(reviewsCacheTag);
  redirect(adminRoutes.reviews);
}

export async function deleteReview(reviewId: number): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  if (!Number.isInteger(reviewId)) return { ok: false, error: reviewActionMessages.notFound }

  let result: AdminActionResult;
  try {
    result = await deleteStoredReview(admin.id, reviewId);
  } catch (error) {
    console.error("Deleting review failed", error);
    return { ok: false, error: reviewActionMessages.failed }
  }
  if (!result.ok) return result;

  updateTag(reviewsCacheTag);
  redirect(adminRoutes.reviews);
}
