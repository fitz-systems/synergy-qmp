import { AdminField, AdminFormActions, AdminFormSection } from "@/components/admin/admin-form-parts";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { languageOptions, ratingOptions } from "@/constants/admin";
import type { AdminReview } from "@/types/admin";

interface ReviewFormProps {
  review?: AdminReview;
  submitLabel: string;
  cancelHref: string;
}

export function ReviewForm({ review, submitLabel, cancelHref }: ReviewFormProps) {
  return (
    <form className="space-y-6">
      <AdminFormSection title="Review" description="Only publish reviews from real students who agreed to be quoted.">
        <AdminField id="review-author" label="Author">
          <Input id="review-author" name="author" defaultValue={review?.author} required/>
        </AdminField>
        <AdminField id="review-role" label="Role or company">
          <Input id="review-role" name="roleCompany" defaultValue={review?.roleCompany}/>
        </AdminField>
        <AdminField id="review-body" label="Review" className="grid gap-2 sm:col-span-2">
          <Textarea id="review-body" name="body" rows={5} defaultValue={review?.body} required/>
        </AdminField>
        <AdminField id="review-language" label="Language" hint="Shown on pages in this language only.">
          <Select name="locale" defaultValue={review?.locale ?? "en"}>
            <SelectTrigger id="review-language" className="w-full"><SelectValue/></SelectTrigger>
            <SelectContent>{languageOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
          </Select>
        </AdminField>
        <AdminField id="review-rating" label="Rating">
          <Select name="rating" defaultValue={String(review?.rating ?? 5)}>
            <SelectTrigger id="review-rating" className="w-full"><SelectValue/></SelectTrigger>
            <SelectContent>{ratingOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
          </Select>
        </AdminField>
        <AdminField id="review-order" label="Order" hint="Lower numbers show first.">
          <Input id="review-order" name="sortOrder" type="number" min={0} defaultValue={review?.sortOrder ?? 0}/>
        </AdminField>
        <div className="flex items-center justify-between gap-4 rounded-lg border p-4 sm:col-span-2">
          <div>
            <p className="text-sm font-medium">Published</p>
            <p className="text-xs text-muted-foreground">Drafts are saved but not shown on the site.</p>
          </div>
          <Switch name="published" defaultChecked={review?.published ?? false} aria-label="Published"/>
        </div>
      </AdminFormSection>
      <AdminFormActions submitLabel={submitLabel} cancelHref={cancelHref}/>
    </form>
  );
}
