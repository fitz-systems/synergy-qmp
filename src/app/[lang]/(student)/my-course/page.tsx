import bannerImage from "@/assets/images/hero-hot-cell.jpg";

import type { Metadata } from "next";
import { PageBanner } from "@/components/shared/page-banner";
import { StudentCourseSidebar } from "@/components/student/course-sidebar";
import { CourseSteps } from "@/components/student/course-steps";
import { contact } from "@/constants/contact";
import { courseMaterialPlaceholderHref } from "@/constants/student";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { getCourse } from "@/lib/courses";
import { interpolate } from "@/lib/helpers/format";
import { localizedHref } from "@/lib/helpers/routes";
import { courseDetailRows, courseStepContent, courseSteps } from "@/lib/helpers/student";
import { getExamQuestions, getExamSettings, getStudentAccount, getStudentEnrollment } from "@/lib/student";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.student.myCourse.metaTitle, robots: { index: false } }
}

export default async function MyCoursePage() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const [account, enrollment, settings, questions] = await Promise.all([getStudentAccount(), getStudentEnrollment(), getExamSettings(), getExamQuestions(locale)]);
  const course = await getCourse(enrollment.courseCode, locale);
  const copy = dict.student.myCourse;

  const steps = courseStepContent(courseSteps(enrollment), enrollment, settings, questions.length, {
    material: courseMaterialPlaceholderHref,
    materialDownload: courseMaterialPlaceholderHref,
    exam: localizedHref(locale, "exam"),
    certificate: localizedHref(locale, "certificate")
  }, copy.steps, locale);

  return (
    <>
      <PageBanner
        title={interpolate(copy.greeting, { name: account.firstName })}
        subtitle={course.title}
        current={dict.nav.myCourse}
        image={bannerImage}
      />
      <div className="bg-canvas-alt">
        <div className="container-site grid items-start gap-10 py-14 md:py-16 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-12">
          <CourseSteps steps={steps} labels={copy}/>
          <StudentCourseSidebar
            detailsTitle={copy.details.title}
            rows={courseDetailRows(course.title, enrollment, settings, questions.length, copy.details, locale)}
            helpTitle={copy.help.title}
            helpBody={interpolate(copy.help.body, { email: contact.email, phone: contact.phoneDisplay })}
          />
        </div>
      </div>
    </>
  );
}
