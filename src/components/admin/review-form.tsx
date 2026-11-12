"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { CircleAlert } from "lucide-react";
import { AdminField, AdminFormActions, AdminFormSection, AdminSwitchField } from "@/components/admin/admin-form-parts";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { languageOptions, ratingOptions, reviewFormFailedNotice } from "@/constants/admin";
import { useActionSubmit } from "@/hooks/use-action-submit";
import type { ReviewFormField, ReviewFormState } from "@/types/admin";

interface ReviewFormProps {
  action: (state: ReviewFormState, formData: FormData) => Promise<ReviewFormState>;
  initialState: ReviewFormState;
  submitLabel: string;
  cancelHref: string;
}

function fieldId(field: ReviewFormField) {
  return `review-${field}`;
}

export function ReviewForm({ action, initialState, submitLabel, cancelHref }: ReviewFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const submit = useActionSubmit(formAction);
  const [locale, setLocale] = useState(initialState.values.locale);
  const [rating, setRating] = useState(initialState.values.rating);
  const [published, setPublished] = useState(initialState.values.published);
  const formRef = useRef<HTMLFormElement>(null);
  const noticeRef = useRef<HTMLDivElement>(null);
  const { values, errors } = state;

  useEffect(() => {
    if (state.status === "invalid") formRef.current?.querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
    else if (state.status === "failed") noticeRef.current?.focus();
  }, [state]);

  function invalidProps(field: ReviewFormField) {
    return { "aria-invalid": errors[field] ? true : undefined, "aria-describedby": errors[field] ? `${fieldId(field)}-error` : undefined }
  }

  return (
    <form ref={formRef} onSubmit={submit} noValidate className="space-y-6">
      {state.status === "failed" && (
        <div ref={noticeRef} tabIndex={-1} role="alert" className="flex gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive focus-visible:outline-none">
          <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0"/>
          {reviewFormFailedNotice}
        </div>
      )}

      <AdminFormSection title="Review" description="Only publish reviews from real students who agreed to be quoted.">
        <AdminField id={fieldId("author")} label="Author" error={errors.author}>
          <Input id={fieldId("author")} name="author" defaultValue={values.author} required {...invalidProps("author")}/>
        </AdminField>
        <AdminField id="review-role" label="Role or company">
          <Input id="review-role" name="roleCompany" defaultValue={values.roleCompany}/>
        </AdminField>
        <AdminField id={fieldId("body")} label="Review" error={errors.body} className="grid gap-2 sm:col-span-2">
          <Textarea id={fieldId("body")} name="body" rows={5} defaultValue={values.body} required {...invalidProps("body")}/>
        </AdminField>
        <AdminField id={fieldId("locale")} label="Language" hint="Shown on pages in this language only." error={errors.locale}>
          <Select name="locale" value={locale} onValueChange={setLocale}>
            <SelectTrigger id={fieldId("locale")} className="w-full" {...invalidProps("locale")}><SelectValue/></SelectTrigger>
            <SelectContent>{languageOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
          </Select>
        </AdminField>
        <AdminField id={fieldId("rating")} label="Rating" error={errors.rating}>
          <Select name="rating" value={rating} onValueChange={setRating}>
            <SelectTrigger id={fieldId("rating")} className="w-full" {...invalidProps("rating")}><SelectValue/></SelectTrigger>
            <SelectContent>{ratingOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
          </Select>
        </AdminField>
        <AdminField id={fieldId("sortOrder")} label="Order" hint="Lower numbers show first." error={errors.sortOrder}>
          <Input id={fieldId("sortOrder")} name="sortOrder" type="number" inputMode="numeric" min={0} max={9999} defaultValue={values.sortOrder} {...invalidProps("sortOrder")}/>
        </AdminField>
        <AdminSwitchField name="published" label="Published" hint="Drafts are saved but not shown on the site." checked={published} onCheckedChange={setPublished} className="sm:col-span-2"/>
      </AdminFormSection>
      <AdminFormActions submitLabel={submitLabel} cancelHref={cancelHref} pending={pending}/>
    </form>
  );
}
