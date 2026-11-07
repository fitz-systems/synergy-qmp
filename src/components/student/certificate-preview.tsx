import Image from "next/image";
import camrtLogo from "@/assets/images/camrt-logo.jpg";
import logo from "@/assets/images/logo.png";

import type { CertificateDetail, StudentCertificateLabels } from "@/types/student";

interface CertificatePreviewProps {
  studentName: string;
  courseTitle: string;
  details: CertificateDetail[];
  credits: string;
  referenceCode: string;
  accreditation: string;
  labels: StudentCertificateLabels;
}

export function CertificatePreview({ studentName, courseTitle, details, credits, referenceCode, accreditation, labels }: CertificatePreviewProps) {
  return (
    <figure className="mx-auto w-full max-w-4xl rounded-lg bg-canvas p-3 shadow-raise print:max-w-none print:shadow-none sm:p-4">
      <div className="flex flex-col items-center rounded border-2 border-brand px-6 py-10 text-center sm:aspect-[1.414/1] sm:justify-center sm:px-12 sm:py-12">
        <Image src={logo} alt="Synergy QMP" className="h-7 w-auto sm:h-9"/>
        <p className="mt-6 text-sm font-semibold tracking-[0.18em] text-brand-ink uppercase sm:mt-8">{labels.heading}</p>
        <p className="mt-5 text-ink-muted">{labels.certifies}</p>
        <p className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-5xl">{studentName}</p>
        <div aria-hidden className="mt-3 h-px w-48 bg-line-strong sm:w-72"/>
        <p className="mt-4 text-ink-muted">{labels.completed}</p>
        <p className="mt-1 max-w-xl text-lg font-semibold text-balance text-ink sm:text-xl">{labels.course}</p>
        <p className="mt-1 text-ink-muted">{courseTitle}</p>

        <dl className="mt-8 grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
          {details.map((detail) => (
            <div key={detail.label}>
              <dt className="text-xs font-semibold tracking-wide text-ink-subtle uppercase">{detail.label}</dt>
              <dd className="mt-1 font-semibold tabular-nums text-ink">{detail.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-8 flex flex-col items-center gap-2">
          <p className="text-sm text-ink-muted">{credits}</p>
          <p className="text-sm font-medium tabular-nums text-ink">{referenceCode}</p>
          <p className="max-w-xl text-xs leading-relaxed text-balance text-ink-muted">{accreditation}</p>
          <span className="sr-only">{labels.accreditedBy}</span>
          <Image src={camrtLogo} alt="CAMRT / ACTRM" className="h-auto w-36"/>
        </div>
      </div>
    </figure>
  );
}
