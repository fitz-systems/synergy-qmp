import { ratingScale } from "@/constants/courses";
import type { Locale } from "@/i18n/config";
import type { CourseReview, RatingSummary } from "@/types/courses";
import { formatRating } from "./format";

export function summarizeRatings(reviews: CourseReview[], locale: Locale): RatingSummary {
  const ratings = reviews.flatMap((review) => (review.rating === null ? [] : [review.rating]));
  const average = ratings.length ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0;

  return {
    average,
    averageLabel: formatRating(locale, average),
    ratedCount: ratings.length,
    buckets: ratingScale.map((stars) => {
      const count = ratings.filter((rating) => rating === stars).length;
      return { stars, count, share: ratings.length ? (count / ratings.length) * 100 : 0 }
    })
  }
}
