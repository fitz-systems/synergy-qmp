import { cache } from "react";
import { examAnswerSelect } from "@/constants/student";
import { mockCertificate } from "@/content/mock-student";
import { isCourseCode } from "@/lib/courses";
import { getCurrentEnrollment } from "@/lib/enrollment";
import { examResult } from "@/lib/helpers/exam";
import { resolveLocale } from "@/lib/helpers/locale";
import { attemptsLeft, studentCourse } from "@/lib/helpers/student";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import type { ExamResult, StudentAccount, StudentCertificate, StudentCourse } from "@/types/student";

export async function getStudentAccount(): Promise<StudentAccount> {
  const { firstName, lastName, email } = await requireUser();
  return { firstName, lastName, email }
}

export const getStudentCourse = cache(async (): Promise<StudentCourse | null> => {
  const record = await getCurrentEnrollment();
  const courseCode = record?.courseLocale.course.code;
  if (!record || !courseCode || !isCourseCode(courseCode)) return null;
  return studentCourse(record, courseCode, resolveLocale(record.locale), new Date());
});

export async function getLatestExamResult(): Promise<ExamResult | null> {
  const [record, course] = await Promise.all([getCurrentEnrollment(), getStudentCourse()]);
  const attempt = record?.attempts.filter((item) => item.submittedAt).sort((a, b) => Number(a.submittedAt) - Number(b.submittedAt)).at(-1);
  if (!attempt?.submittedAt || !course) return null;

  const answers = await prisma.attemptAnswer.findMany({ where: { attemptId: attempt.id }, orderBy: { sortOrder: "asc" }, select: examAnswerSelect });
  return examResult({ ...attempt, submittedAt: attempt.submittedAt }, answers, attemptsLeft(course.enrollment));
}

// Todo: Read the certificate from the enrollment (number, issue date, validity) once certificate numbering is in place
export async function getStudentCertificate(): Promise<StudentCertificate | null> {
  return mockCertificate;
}
