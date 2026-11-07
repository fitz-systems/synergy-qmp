import { studentEnrollmentSelect } from "@/constants/student";
import { isCourseCode } from "@/lib/courses";
import { getCurrentEnrollment, loadCurrentEnrollment } from "@/lib/enrollment";
import { certificateNumber, studentCertificate } from "@/lib/helpers/certificate";
import { resolveLocale } from "@/lib/helpers/locale";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import type { SessionUser } from "@/types/auth";
import type { CertificateHolder, StudentCertificate, StudentEnrollmentRecord } from "@/types/student";

async function assignCertificateNumber(record: StudentEnrollmentRecord, passedOn: Date) {
  const number = certificateNumber(record.id, passedOn);
  await prisma.enrollment.updateMany({ where: { id: record.id, certificateNumber: null }, data: { certificateNumber: number, certificateIssuedAt: new Date() } });
  const stored = await prisma.enrollment.findUniqueOrThrow({ where: { id: record.id }, select: { certificateNumber: true } });
  return stored.certificateNumber ?? number;
}

async function issueCertificate(record: StudentEnrollmentRecord | null, holder: CertificateHolder): Promise<StudentCertificate | null> {
  const courseCode = record?.courseLocale.course.code;
  const passedOn = record?.passedOn;
  if (!record || !passedOn || !courseCode || !isCourseCode(courseCode)) return null;

  const number = record.certificateNumber ?? await assignCertificateNumber(record, passedOn);
  return studentCertificate({ ...record, passedOn }, holder, courseCode, resolveLocale(record.locale), number);
}

export async function getStudentCertificate() {
  const [record, user] = await Promise.all([getCurrentEnrollment(), requireUser()]);
  return issueCertificate(record, user);
}

export async function getCertificateForUser(user: SessionUser) {
  return issueCertificate(await loadCurrentEnrollment(user.id), user);
}

export async function getCertificateForEnrollment(enrollmentId: number) {
  const record = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    select: { ...studentEnrollmentSelect, user: { select: { firstName: true, lastName: true } } }
  });
  return record ? issueCertificate(record, record.user) : null;
}
