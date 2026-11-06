import bannerImage from "@/assets/images/about-classroom.jpg";

import type { Metadata } from "next";
import { Suspense } from "react";
import { CourseArchive, CourseArchiveFallback } from "@/components/courses/course-archive";
import { OurCourses } from "@/components/courses/course-sidebar";
import { CtaBand } from "@/components/shared/cta-band";
import { PageBanner } from "@/components/shared/page-banner";
import { locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getCourseListItems } from "@/lib/course-list";
import { localizedHref } from "@/lib/helpers/routes";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return {
    title: dict.coursesPage.metaTitle,
    description: dict.coursesPage.metaDescription,
    alternates: {
      languages: Object.fromEntries(locales.map((locale) => [locale, localizedHref(locale, "courses")]))
    }
  }
}

export default async function CoursesPage() {
  const [dict, courses] = await Promise.all([getDictionary(), getCourseListItems()]);
  const copy = dict.coursesPage;

  const archiveProps = {
    courses,
    modes: copy.modes,
    labels: copy.archive,
    sidebar: <OurCourses title={copy.sidebar.ourCourses} courses={courses}/>
  }

  return (
    <>
      <PageBanner title={copy.bannerTitle} image={bannerImage} imagePosition="object-[center_30%]"/>
      <section className="bg-canvas-alt">
        <div className="container-site py-16 md:py-20">
          <Suspense fallback={<CourseArchiveFallback {...archiveProps}/>}>
            <CourseArchive {...archiveProps}/>
          </Suspense>
        </div>
      </section>
      <CtaBand/>
    </>
  );
}
