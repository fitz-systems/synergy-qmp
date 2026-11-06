import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Download } from "lucide-react";
import { CertificatePreview } from "@/components/student/certificate-preview";
import { PrintButton } from "@/components/student/print-button";
import { StudentPageHeader } from "@/components/student/student-page-header";
import { certificatePdfPlaceholderHref } from "@/constants/student";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { getCourse } from "@/lib/courses";
import { interpolate } from "@/lib/helpers/format";
import { localizedHref } from "@/lib/helpers/routes";
import { certificateDetails } from "@/lib/helpers/student";
import { getStudentCertificate } from "@/lib/student";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.student.certificate.metaTitle, robots: { index: false } }
}

export default async function CertificatePage() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const certificate = await getStudentCertificate();
  if (!certificate) redirect(localizedHref(locale, "myCourse"));

  const course = await getCourse(certificate.courseCode, locale);
  const copy = dict.student.certificate;

  return (
    <>
      <div className="print:hidden">
        <StudentPageHeader
          title={copy.title}
          crumbs={[{ label: dict.nav.myCourse, href: localizedHref(locale, "myCourse") }]}
          current={dict.nav.certificate}
          breadcrumbLabel={dict.nav.breadcrumb}
        >
          <p className="mt-4 max-w-2xl leading-relaxed text-ink-muted">{copy.intro}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={certificatePdfPlaceholderHref}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-brand px-6 font-semibold text-ink transition-colors hover:bg-brand-hover"
            >
              <Download aria-hidden className="size-4" strokeWidth={2}/>
              {copy.download}
            </a>
            <PrintButton label={copy.print}/>
          </div>
        </StudentPageHeader>
      </div>
      <div className="bg-canvas-alt print:bg-canvas">
        <div className="container-site py-12 md:py-16 print:p-0">
          <CertificatePreview
            studentName={certificate.studentName}
            courseTitle={course.title}
            details={certificateDetails(certificate, copy, locale)}
            credits={interpolate(copy.credits, { credits: certificate.credits.toLocaleString(locale) })}
            labels={copy}
          />
        </div>
      </div>
    </>
  );
}
