import type { Metadata } from "next";
import { ExamForm } from "@/components/student/exam-form";
import { StudentPageHeader } from "@/components/student/student-page-header";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { getCourse } from "@/lib/courses";
import { localizedHref } from "@/lib/helpers/routes";
import { getExamQuestions, getExamSettings, getStudentEnrollment } from "@/lib/student";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.student.exam.metaTitle, robots: { index: false } }
}

export default async function ExamPage() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const [enrollment, settings, questions] = await Promise.all([getStudentEnrollment(), getExamSettings(), getExamQuestions(locale)]);
  const course = await getCourse(enrollment.courseCode, locale);
  const copy = dict.student.exam;

  return (
    <>
      <StudentPageHeader
        title={copy.title}
        subtitle={course.title}
        crumbs={[{ label: dict.nav.myCourse, href: localizedHref(locale, "myCourse") }]}
        current={dict.nav.exam}
        breadcrumbLabel={dict.nav.breadcrumb}
      >
        <p className="mt-4 max-w-2xl leading-relaxed text-ink-muted">{copy.intro}</p>
      </StudentPageHeader>
      <div className="bg-canvas-alt">
        <div className="container-site pt-10 md:pt-12 lg:pb-16">
          <ExamForm
            locale={locale}
            questions={questions}
            timeLimitMinutes={settings.timeLimitMinutes}
            resultsHref={localizedHref(locale, "examResults")}
            labels={copy}
          />
        </div>
      </div>
    </>
  );
}
