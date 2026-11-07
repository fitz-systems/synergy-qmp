import { certificateCredits, certificateNumberDigits, certificateNumberPrefix, pdfLetterFallbacks, pdfWinAnsiExtras } from "@/constants/student";
import type { Locale } from "@/i18n/config";
import type { CourseCode } from "@/types/courses";
import type { StudentCertificate, StudentEnrollmentRecord } from "@/types/student";

export function certificateNumber(enrollmentId: number, passedOn: Date) {
  return `${certificateNumberPrefix}${passedOn.getUTCFullYear()}-${String(enrollmentId).padStart(certificateNumberDigits, "0")}`;
}

export function addMonths(date: Date, months: number) {
  const result = new Date(date);
  result.setUTCMonth(result.getUTCMonth() + months);
  return result;
}

interface CertificateHolder {
  firstName: string;
  lastName: string;
}

export function studentCertificate(record: StudentEnrollmentRecord & { passedOn: Date }, holder: CertificateHolder, courseCode: CourseCode, courseLocale: Locale, number: string): StudentCertificate {
  const { courseLocale: courseRecord } = record;
  return {
    studentName: `${holder.firstName} ${holder.lastName}`.trim(),
    courseCode,
    courseLocale,
    courseTitle: courseRecord.name,
    certificateNumber: number,
    referenceCode: courseRecord.certificateCode,
    issuedOn: record.passedOn.toISOString(),
    validUntil: addMonths(record.passedOn, courseRecord.course.certificateValidMonths).toISOString(),
    credits: certificateCredits
  }
}

export function formatCredits(locale: Locale, credits: number) {
  return credits.toLocaleString(`${locale}-CA`, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export function certificateFileName(certificate: StudentCertificate) {
  return `synergy-qmp-certificate-${certificate.certificateNumber}.pdf`;
}

export function pdfSafeText(text: string) {
  return Array.from(text.normalize("NFC"), (char) => {
    if (char.charCodeAt(0) <= 0xff || pdfWinAnsiExtras.has(char)) return char;
    const base = pdfLetterFallbacks[char] ?? char.normalize("NFD").replace(/\p{M}/gu, "");
    return base.length > 0 && base.charCodeAt(0) <= 0xff ? base : "?";
  }).join("");
}
