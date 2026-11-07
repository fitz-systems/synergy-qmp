import type { Metadata } from "next";
import { saveReview } from "@/app/admin/(panel)/reviews/actions";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ReviewForm } from "@/components/admin/review-form";
import { adminRoutes } from "@/constants/admin";
import { getNextReviewSortOrder } from "@/lib/admin-reviews";
import { initialReviewFormState } from "@/lib/helpers/admin-reviews";

export const metadata: Metadata = {
  title: "Add review"
}

export default async function AdminNewReviewPage() {
  const nextSortOrder = await getNextReviewSortOrder();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AdminPageHeader
        title="Add review"
        crumbs={[{ label: "Dashboard", href: adminRoutes.dashboard }, { label: "Reviews", href: adminRoutes.reviews }, { label: "Add review" }]}
      />
      <ReviewForm action={saveReview.bind(null, null)} initialState={initialReviewFormState(undefined, nextSortOrder)} submitLabel="Add review" cancelHref={adminRoutes.reviews}/>
    </div>
  );
}
