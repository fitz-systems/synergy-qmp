import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ReviewForm } from "@/components/admin/review-form";
import { adminRoutes } from "@/constants/admin";

export const metadata: Metadata = {
  title: "Add review"
}

export default function AdminNewReviewPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AdminPageHeader
        title="Add review"
        crumbs={[{ label: "Dashboard", href: adminRoutes.dashboard }, { label: "Reviews", href: adminRoutes.reviews }, { label: "Add review" }]}
      />
      <ReviewForm submitLabel="Add review" cancelHref={adminRoutes.reviews}/>
    </div>
  );
}
