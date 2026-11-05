import Image from "next/image";
import camrtLogo from "@/assets/images/camrt-logo.jpg";
import logoReversed from "@/assets/images/logo-reversed.png";

import { Check, MessageSquare } from "lucide-react";
import { courseFeatureIcons, curriculumIcons } from "@/constants/courses";
import { externalLinks } from "@/constants/links";
import type { Locale } from "@/i18n/config";
import { courseCurriculumItems, courseFeatureRows } from "@/lib/helpers/course-details";
import { formatRating, interpolate, plural } from "@/lib/helpers/format";
import type { Course, CourseReview, CoursesCopy, RatingSummary } from "@/types/courses";
import { RatingStars } from "./rating-stars";

interface PanelProps {
  course: Course;
  copy: CoursesCopy;
  locale: Locale;
}

export function DescriptionPanel({ course, copy, locale }: PanelProps) {
  const { features } = copy.detail;

  return (
    <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_17rem] xl:gap-12">
      <div className="max-w-2xl">
        <h2 className="text-xl font-semibold text-ink">{copy.detail.descriptionTitle}</h2>
        <p className="mt-2 leading-relaxed text-ink-muted">{course.description}</p>

        <h2 className="mt-10 text-xl font-semibold text-ink">{copy.certification.title}</h2>
        <p className="mt-2 leading-relaxed text-ink-muted">
          {copy.certification.before}
          <a
            href={externalLinks.camrt}
            className="font-medium text-ink underline decoration-brand decoration-2 underline-offset-[0.25em] transition-colors hover:decoration-ink"
          >
            {copy.certification.link}
          </a>
          {copy.certification.after}
        </p>
        <Image src={camrtLogo} alt={copy.certification.logoAlt} className="mt-5 h-auto w-48"/>

        <h2 className="mt-10 text-xl font-semibold text-ink">{copy.outcomes.title}</h2>
        <p className="mt-2 text-ink-muted">{copy.outcomes.intro}</p>
        <ul className="mt-4 space-y-3">
          {course.outcomes.map((outcome) => (
            <li key={outcome} className="flex gap-3 leading-relaxed text-ink">
              <Check aria-hidden className="mt-[0.3em] size-4 shrink-0 text-brand-ink" strokeWidth={2.5}/>
              {outcome}
            </li>
          ))}
        </ul>
      </div>

      <section aria-labelledby="features-title" className="self-start rounded-xl bg-canvas-alt px-5 pt-5 pb-2">
        <h2 id="features-title" className="text-lg font-semibold text-ink">{features.title}</h2>
        <dl className="mt-2 divide-y divide-line">
          {courseFeatureRows(course, features, locale).map(({ key, label, value }) => {
            const Icon = courseFeatureIcons[key];
            return (
              <div key={key} className="flex items-center gap-3 py-3">
                <Icon aria-hidden className="size-4 shrink-0 text-ink-subtle" strokeWidth={1.75}/>
                <dt className="flex-1 text-[0.9375rem] text-ink-muted">{label}</dt>
                <dd className="text-[0.9375rem] font-semibold tabular-nums text-ink">{value}</dd>
              </div>
            );
          })}
        </dl>
      </section>
    </div>
  );
}

export function CurriculumPanel({ course, copy, locale }: PanelProps) {
  const { curriculum } = copy.detail;
  const items = courseCurriculumItems(course, curriculum, locale);

  return (
    <section aria-labelledby="curriculum-title" className="overflow-hidden rounded-xl border border-line">
      <div className="bg-canvas-alt px-5 py-4">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 id="curriculum-title" className="text-lg font-semibold text-ink">{course.title}</h2>
          <span className="text-sm font-medium tabular-nums text-ink-muted">{plural(locale, curriculum.items, items.length)}</span>
        </div>
        <p className="mt-1 text-[0.9375rem] leading-relaxed text-ink-muted">{course.description}</p>
      </div>
      <ol className="divide-y divide-line border-t border-line">
        {items.map(({ kind, label, title, meta }) => {
          const Icon = curriculumIcons[kind];
          return (
            <li key={kind} className="flex items-center gap-4 px-5 py-4">
              <Icon aria-hidden className="size-5 shrink-0 text-ink-subtle" strokeWidth={1.75}/>
              <div className="flex min-w-0 flex-1 flex-col sm:flex-row sm:items-baseline sm:gap-4">
                <span className="text-sm font-medium text-ink-subtle sm:w-24 sm:shrink-0">{label}</span>
                <span className="font-medium text-ink">{title}</span>
              </div>
              <span className="shrink-0 text-sm tabular-nums text-ink-muted">{meta}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

interface InstructorsPanelProps {
  name: string;
  bio: string;
}

export function InstructorsPanel({ name, bio }: InstructorsPanelProps) {
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
      <div className="flex h-24 w-40 shrink-0 items-center justify-center rounded-xl bg-night px-5">
        <Image src={logoReversed} alt="" className="h-auto w-full"/>
      </div>
      <div className="max-w-2xl">
        <h2 className="text-xl font-semibold text-ink">{name}</h2>
        <p className="mt-2 leading-relaxed text-ink-muted">{bio}</p>
      </div>
    </div>
  );
}

interface ReviewsPanelProps {
  reviews: CourseReview[];
  summary: RatingSummary;
  copy: CoursesCopy;
  locale: Locale;
}

export function ReviewsPanel({ reviews, summary, copy, locale }: ReviewsPanelProps) {
  const labels = copy.detail.reviews;

  return (
    <div>
      <div className="grid gap-8 sm:grid-cols-[13rem_minmax(0,1fr)] sm:gap-10">
        <div className="flex flex-col items-center justify-center rounded-xl bg-canvas-alt px-6 py-7 text-center">
          <h2 className="text-sm font-semibold text-ink-muted">{labels.average}</h2>
          <p className="mt-1 text-5xl font-semibold tabular-nums tracking-tight text-ink">{summary.averageLabel}</p>
          <div className="mt-2">
            <RatingStars rating={summary.average} label={interpolate(copy.detail.ratingLabel, { rating: summary.averageLabel })}/>
          </div>
          <p className="mt-2 text-sm text-ink-muted">{plural(locale, labels.ratings, summary.ratedCount)}</p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-ink-muted">{labels.detailed}</h2>
          <ul className="mt-3 space-y-3">
            {summary.buckets.map(({ stars, count, share }) => (
              <li key={stars} className="grid grid-cols-[5.5rem_minmax(0,1fr)_2rem] items-center gap-3 text-sm">
                <span className="text-ink-muted">{plural(locale, labels.stars, stars)}</span>
                <span aria-hidden className="h-2 overflow-hidden rounded-full bg-canvas-alt">
                  <span className="block h-full rounded-full bg-brand" style={{ width: `${share}%` }}/>
                </span>
                <span className="text-right font-medium tabular-nums text-ink">{count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {reviews.length > 0 ? (
        <ul className="mt-10 divide-y divide-line border-t border-line">
          {reviews.map((review) => (
            <li key={review.id} className="py-6">
              {review.rating !== null && (
                <RatingStars rating={review.rating} label={interpolate(copy.detail.ratingLabel, { rating: formatRating(locale, review.rating) })}/>
              )}
              <blockquote className="mt-3 leading-relaxed text-ink">{review.body}</blockquote>
              <p className="mt-3 text-sm">
                <span className="font-semibold text-ink">{review.author}</span>
                {review.roleCompany && <span className="text-ink-muted"> · {review.roleCompany}</span>}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-10 flex flex-col items-center rounded-xl border border-dashed border-line-strong px-6 py-10 text-center">
          <MessageSquare aria-hidden className="size-7 text-ink-subtle" strokeWidth={1.5}/>
          <h3 className="mt-3 text-lg font-semibold text-ink">{labels.emptyTitle}</h3>
          <p className="mt-1 text-ink-muted">{labels.emptyBody}</p>
        </div>
      )}
    </div>
  );
}
