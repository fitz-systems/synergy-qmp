import Link from "next/link";

import type { Metadata } from "next";
import { Plus, Star } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ToggleBadge } from "@/components/admin/admin-table-parts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminRoutes } from "@/constants/admin";
import { getAdminReviews } from "@/lib/admin-reviews";
import { adminReviewHref, languageLabel } from "@/lib/helpers/admin";

export const metadata: Metadata = {
  title: "Reviews"
}

export default async function AdminReviewsPage() {
  const reviews = await getAdminReviews();

  return (
    <>
      <AdminPageHeader
        title="Reviews"
        description="Published reviews appear on the course pages in their language. Only publish reviews from real students who agreed to be quoted."
        crumbs={[{ label: "Dashboard", href: adminRoutes.dashboard }, { label: "Reviews" }]}
        actions={<Button asChild><Link href={adminRoutes.newReview}><Plus/>Add review</Link></Button>}
      />
      <Card className="gap-0 overflow-hidden py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Author</TableHead>
              <TableHead>Review</TableHead>
              <TableHead>Language</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead className="text-right">Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-4 text-right"><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map((review) => (
              <TableRow key={review.id}>
                <TableCell className="pl-4">
                  <p className="font-medium">{review.author}</p>
                  <p className="text-xs text-muted-foreground">{review.roleCompany}</p>
                </TableCell>
                <TableCell className="max-w-sm whitespace-normal text-muted-foreground">{review.body}</TableCell>
                <TableCell>{languageLabel(review.locale)}</TableCell>
                <TableCell>
                  {review.rating === null
                    ? <span className="text-muted-foreground">—</span>
                    : (
                      <span className="inline-flex items-center gap-1 tabular-nums" aria-label={`${review.rating} out of 5`}>
                        <Star aria-hidden className="size-4 fill-primary text-primary"/>{review.rating}
                      </span>
                    )}
                </TableCell>
                <TableCell className="text-right tabular-nums">{review.sortOrder}</TableCell>
                <TableCell><ToggleBadge on={review.published} onLabel="Published" offLabel="Draft"/></TableCell>
                <TableCell className="pr-4 text-right">
                  <Button variant="ghost" size="sm" asChild><Link href={adminReviewHref(review.id)}>Edit</Link></Button>
                </TableCell>
              </TableRow>
            ))}
            {reviews.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">No reviews yet.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
