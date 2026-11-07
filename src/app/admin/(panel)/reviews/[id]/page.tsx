import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteReview, saveReview } from "@/app/admin/(panel)/reviews/actions";
import { AdminConfirmAction } from "@/components/admin/admin-actions";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ReviewForm } from "@/components/admin/review-form";
import { Button } from "@/components/ui/button";
import { adminRoutes } from "@/constants/admin";
import { getAdminReview } from "@/lib/admin-reviews";
import { initialReviewFormState } from "@/lib/helpers/admin-reviews";

export const metadata: Metadata = {
  title: "Edit review"
}

export default async function AdminReviewPage({ params }: PageProps<"/admin/reviews/[id]">) {
  const { id } = await params;
  const review = await getAdminReview(Number(id));
  if (!review) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AdminPageHeader
        title="Edit review"
        description={review.author}
        crumbs={[{ label: "Dashboard", href: adminRoutes.dashboard }, { label: "Reviews", href: adminRoutes.reviews }, { label: review.author }]}
        actions={(
          <AdminConfirmAction
            action={deleteReview.bind(null, review.id)}
            trigger={<Button variant="outline"><Trash2/>Delete</Button>}
            title="Delete this review?"
            description={review.published ? "It's removed from the site right away and can't be recovered. To hide it but keep it, turn off Published instead." : "The draft is removed for good."}
            confirmLabel="Delete review"
            destructive
          />
        )}
      />
      <ReviewForm action={saveReview.bind(null, review.id)} initialState={initialReviewFormState(review, review.sortOrder)} submitLabel="Save changes" cancelHref={adminRoutes.reviews}/>
    </div>
  );
}
