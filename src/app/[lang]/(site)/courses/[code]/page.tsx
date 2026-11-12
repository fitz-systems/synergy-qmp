import Image from "next/image";
import bannerImage from "@/assets/images/stats-glovebox.jpg";
import courseImage from "@/assets/images/course-tdg.jpg";

import type { Metadata } from "next";
import { Suspense } from "react";
import { CurriculumPanel, DescriptionPanel, InstructorsPanel, ReviewsPanel } from "@/components/courses/course-panels";
import { OurCourses, SidebarSearch } from "@/components/courses/course-sidebar";
import { CourseTabs } from "@/components/courses/course-tabs";
import { CourseTile } from "@/components/courses/course-tile";
import { RatingStars } from "@/components/courses/rating-stars";
import { ShareLinks } from "@/components/courses/share-links";
import { PageBanner } from "@/components/shared/page-banner";
import { ButtonLink } from "@/components/ui/button-link";
import { courseCodes } from "@/constants/routes";
import { siteName } from "@/constants/seo";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { getCourseListItems } from "@/lib/course-list";
import { courseCodeFromParams, getCourse, getPublishedReviews } from "@/lib/courses";
import { interpolate, plural } from "@/lib/helpers/format";
import { summarizeRatings } from "@/lib/helpers/reviews";
import { courseHref, localizedHref } from "@/lib/helpers/routes";
import { localizedMetadata } from "@/lib/helpers/seo";

export async function generateStaticParams() {
  return courseCodes.map((code) => ({ code }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/courses/[code]">): Promise<Metadata> {
  const [code, locale] = await Promise.all([courseCodeFromParams(params), getLocale()]);
  const course = await getCourse(code, locale);
  return localizedMetadata({
    locale,
    title: `${course.title} | ${siteName}`,
    description: course.description,
    path: (language) => courseHref(language, code)
  });
}

export default function CoursePage({ params }: PageProps<"/[lang]/courses/[code]">) {
  return (
    <Suspense fallback={<CourseShell/>}>
      <CourseDetail params={params}/>
    </Suspense>
  );
}

async function CourseShell() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const copy = dict.coursesPage;

  return (
    <>
      <PageBanner
        title={copy.detail.bannerTitle}
        subtitle={copy.detail.bannerSubtitle}
        current={null}
        trail={[{ label: copy.bannerTitle, href: localizedHref(locale, "courses") }]}
        titleAsHeading={false}
        image={bannerImage}
      />
      <div aria-hidden className="container-site grid gap-14 py-14 md:py-16 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <div>
          <div className="h-10 w-2/3 rounded-md bg-canvas-alt"/>
          <div className="mt-6 h-24 rounded-md bg-canvas-alt"/>
          <div className="mt-8 aspect-[8/5] rounded-xl bg-canvas-alt"/>
        </div>
        <div className="hidden h-80 rounded-xl bg-canvas-alt lg:block"/>
      </div>
    </>
  );
}

async function CourseDetail({ params }: Pick<PageProps<"/[lang]/courses/[code]">, "params">) {
  const code = await courseCodeFromParams(params);
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const [course, reviews, listItems] = await Promise.all([getCourse(code, locale), getPublishedReviews(locale), getCourseListItems()]);

  const copy = dict.coursesPage;
  const detail = copy.detail;
  const archiveHref = localizedHref(locale, "courses");
  const contactHref = localizedHref(locale, "contact");

  const ratings = summarizeRatings(reviews, locale);
  const related = listItems.filter((item) => item.code !== code);

  const tabs = [
    { id: "description", label: detail.tabs.description, content: <DescriptionPanel course={course} copy={copy} locale={locale}/> },
    { id: "curriculum", label: detail.tabs.curriculum, content: <CurriculumPanel course={course} copy={copy} locale={locale}/> },
    { id: "instructors", label: detail.tabs.instructors, content: <InstructorsPanel name={copy.teacherName} bio={dict.about.body}/> },
    { id: "reviews", label: detail.tabs.reviews, content: <ReviewsPanel reviews={reviews} summary={ratings} copy={copy} locale={locale}/> }
  ];

  return (
    <>
      <PageBanner
        title={detail.bannerTitle}
        subtitle={detail.bannerSubtitle}
        current={course.title}
        trail={[{ label: copy.bannerTitle, href: archiveHref }]}
        titleAsHeading={false}
        image={bannerImage}
      />

      <div className="container-site grid gap-14 py-14 md:py-16 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <article className="min-w-0">
          <header>
            <h1 className="text-3xl font-bold text-ink sm:text-4xl">{course.title}</h1>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-x-8 gap-y-5 border-y border-line py-5">
              <dl className="flex flex-wrap gap-x-8 gap-y-4 sm:shrink-0 sm:flex-nowrap">
                <div>
                  <dt className="text-xs font-medium text-ink-subtle">{detail.teacher}</dt>
                  <dd className="mt-1 flex items-center gap-2 text-sm font-semibold text-ink">
                    <span aria-hidden className="inline-flex size-6 items-center justify-center rounded-full bg-brand text-[0.625rem] font-bold text-ink">SQ</span>
                    {copy.teacherName}
                  </dd>
                </div>
                <div className="sm:border-l sm:border-line sm:pl-8">
                  <dt className="text-xs font-medium text-ink-subtle">{detail.category}</dt>
                  <dd className="mt-1 text-sm font-semibold leading-6 text-ink">{detail.categoryValue}</dd>
                </div>
                <div className="sm:border-l sm:border-line sm:pl-8">
                  <dt className="text-xs font-medium text-ink-subtle">{detail.review}</dt>
                  <dd className="mt-1 flex items-center gap-2 text-sm font-semibold leading-6 text-ink">
                    <RatingStars rating={ratings.average} label={interpolate(detail.ratingLabel, { rating: ratings.averageLabel })}/>
                    <span className="font-medium text-ink-muted">{plural(locale, detail.reviewCount, reviews.length)}</span>
                  </dd>
                </div>
              </dl>
              <div className="flex flex-wrap items-center gap-5">
                <ButtonLink href={contactHref}>{detail.enroll}</ButtonLink>
              </div>
            </div>
          </header>

          <Image
            src={courseImage}
            alt={copy.imageAlt}
            placeholder="blur"
            priority
            sizes="(min-width: 1280px) 820px, (min-width: 1024px) 65vw, 100vw"
            className="mt-8 h-auto w-full rounded-xl"
          />

          <CourseTabs tabs={tabs} label={detail.tabsLabel} enrollHref={contactHref} enrollLabel={detail.enroll}/>

          <div className="mt-12 border-t border-line pt-6">
            <ShareLinks title={course.title} labels={detail.share}/>
          </div>
        </article>

        <aside className="space-y-10">
          <SidebarSearch
            title={copy.sidebar.search}
            action={archiveHref}
            label={copy.archive.searchLabel}
            placeholder={copy.archive.searchPlaceholder}
            submit={copy.sidebar.searchSubmit}
          />
          <OurCourses title={copy.sidebar.ourCourses} courses={listItems} currentCode={code}/>
        </aside>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="bg-canvas-alt">
          <div className="container-site py-16 md:py-20">
            <h2 id="related-title" className="text-2xl font-bold text-ink sm:text-3xl">{detail.youMayLike}</h2>
            <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <li key={item.code} className="flex">
                  <CourseTile course={item} headingLevel="h3"/>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
