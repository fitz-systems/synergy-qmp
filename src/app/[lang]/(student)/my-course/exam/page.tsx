import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ExamForm } from "@/components/student/exam-form";
import { StudentPageHeader } from "@/components/student/student-page-header";
import type { Locale } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { getCourse } from "@/lib/courses";
import { startOrResumeExam } from "@/lib/exam";
import { localizedHref } from "@/lib/helpers/routes";
import { canTakeExam } from "@/lib/helpers/student";
import { getStudentCourse } from "@/lib/student";
import type { ExamLabels, ExamSettings } from "@/types/student";

interface ExamSessionProps {
  locale: Locale;
  settings: ExamSettings;
  labels: ExamLabels;
}

interface ExamFallbackProps {
  count: number;
}

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.student.exam.metaTitle, robots: { index: false } }
}

export default async function ExamPage() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const studentCourse = await getStudentCourse();
  if (!studentCourse || !canTakeExam(studentCourse.enrollment)) redirect(localizedHref(locale, "myCourse"));

  const { enrollment, settings } = studentCourse;
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
          <Suspense fallback={<ExamFallback count={settings.questionCount}/>}>
            <ExamSession locale={locale} settings={settings} labels={copy}/>
          </Suspense>
        </div>
      </div>
    </>
  );
}

async function ExamSession({ locale, settings, labels }: ExamSessionProps) {
  const session = await startOrResumeExam();
  if (!session) redirect(localizedHref(locale, "myCourse"));

  return <ExamForm locale={locale} session={session} timeLimitMinutes={settings.timeLimitMinutes} labels={labels}/>;
}

function ExamFallback({ count }: ExamFallbackProps) {
  return (
    <div aria-hidden className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-12">
      <div className="space-y-5">
        {Array.from({ length: Math.min(count, 3) }, (_, index) => (
          <div key={index} className="h-80 animate-pulse rounded-xl border border-line bg-canvas"/>
        ))}
      </div>
      <div className="hidden h-96 animate-pulse rounded-xl border border-line bg-canvas lg:block"/>
    </div>
  );
}
