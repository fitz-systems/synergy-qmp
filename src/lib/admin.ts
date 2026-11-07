import { mockAdminReviews, mockImportPreview } from "@/content/mock-admin";
import type { ImportKind, ImportPreviewRow, AdminReview } from "@/types/admin";

// Todo: Query the database (and check the admin session) instead of returning placeholder data

export async function getAdminReviews(): Promise<AdminReview[]> {
  return mockAdminReviews;
}

export async function getAdminReview(id: number): Promise<AdminReview | undefined> {
  return mockAdminReviews.find((review) => review.id === id);
}

export async function getImportPreview(): Promise<Record<ImportKind, ImportPreviewRow[]>> {
  return mockImportPreview;
}
