import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ReviewForm } from "@/components/admin/review-form";
import { adminRoutes } from "@/constants/admin";
import { getAdminReview } from "@/lib/admin";

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
      />
      <ReviewForm review={review} submitLabel="Save changes" cancelHref={adminRoutes.reviews}/>
    </div>
  );
}
