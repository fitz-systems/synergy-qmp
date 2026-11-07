import { noRatingValue } from "@/constants/admin";
import { defaultLocale, hasLocale } from "@/i18n/config";
import type { AdminReview, AdminReviewRecord, ReviewFormState, ReviewFormValues } from "@/types/admin";
import { changeDetails, languageLabel, localeOf } from "./admin";
import { readFormString } from "./forms";

export function adminReview(record: AdminReviewRecord): AdminReview {
  return {
    id: record.id,
    author: record.author,
    roleCompany: record.roleCompany ?? "",
    locale: localeOf(record.locale),
    body: record.body,
    rating: record.rating,
    published: record.published,
    sortOrder: record.sortOrder
  }
}

export function reviewFormValues(review: AdminReview | undefined, nextSortOrder: number): ReviewFormValues {
  return {
    author: review?.author ?? "",
    roleCompany: review?.roleCompany ?? "",
    body: review?.body ?? "",
    locale: review?.locale ?? defaultLocale,
    rating: review ? (review.rating === null ? noRatingValue : String(review.rating)) : "5",
    sortOrder: String(review?.sortOrder ?? nextSortOrder),
    published: review?.published ?? false
  }
}

export function initialReviewFormState(review: AdminReview | undefined, nextSortOrder: number): ReviewFormState {
  return { status: "idle", values: reviewFormValues(review, nextSortOrder), errors: {} }
}

export function readReviewForm(formData: FormData): ReviewFormValues {
  return {
    author: readFormString(formData, "author").replace(/\s+/g, " "),
    roleCompany: readFormString(formData, "roleCompany").replace(/\s+/g, " "),
    body: readFormString(formData, "body"),
    locale: readFormString(formData, "locale"),
    rating: readFormString(formData, "rating"),
    sortOrder: readFormString(formData, "sortOrder"),
    published: formData.get("published") === "on"
  }
}

function ratingOf(value: string) {
  if (value === noRatingValue) return null;
  return /^[1-5]$/.test(value) ? Number(value) : undefined;
}

export function validateReviewForm(values: ReviewFormValues): ReviewFormState["errors"] {
  const errors: ReviewFormState["errors"] = {}
  if (!values.author) errors.author = "Enter the author's name.";
  if (!values.body) errors.body = "Enter the review.";
  if (!hasLocale(values.locale)) errors.locale = "Choose a language.";
  if (ratingOf(values.rating) === undefined) errors.rating = "Choose a rating.";
  if (!/^\d{1,4}$/.test(values.sortOrder)) errors.sortOrder = "Enter a whole number from 0 to 9999.";
  return errors;
}

export function reviewData(values: ReviewFormValues) {
  return {
    author: values.author,
    roleCompany: values.roleCompany || null,
    body: values.body,
    locale: localeOf(values.locale),
    rating: ratingOf(values.rating) ?? null,
    sortOrder: Number(values.sortOrder),
    published: values.published
  }
}

export function reviewChanges(before: AdminReview, values: ReviewFormValues) {
  const after = reviewData(values);
  const changes: [boolean, string][] = [
    [before.author !== after.author, "author"],
    [before.roleCompany !== (after.roleCompany ?? ""), "role or company"],
    [before.body !== after.body, "review text"],
    [before.locale !== after.locale, `language to ${languageLabel(after.locale)}`],
    [before.rating !== after.rating, "rating"],
    [before.sortOrder !== after.sortOrder, "order"]
  ];
  const changed = changes.filter(([isChanged]) => isChanged).map(([, label]) => label);
  return changeDetails(changed, before.published === after.published ? undefined : after.published ? "Published" : "Unpublished");
}

export function reviewDetails(values: ReviewFormValues) {
  const data = reviewData(values);
  return `${languageLabel(data.locale)}, ${data.published ? "published" : "draft"}`;
}
