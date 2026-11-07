import { connection } from "next/server";
import { mockCertificate, mockEnrollment, mockExamAttempt, mockExamQuestions, mockExamResult, mockExamSettings } from "@/content/mock-student";
import type { Locale } from "@/i18n/config";
import { requireUser } from "@/lib/session";
import type { ExamAttempt, ExamQuestion, ExamResult, ExamSettings, StudentAccount, StudentCertificate, StudentEnrollment } from "@/types/student";

export async function getStudentAccount(): Promise<StudentAccount> {
  const { firstName, lastName, email } = await requireUser();
  return { firstName, lastName, email }
}

// Todo: Read these from the database for the signed-in student (each one calling requireUser); they return placeholder data while the UI is designed

export async function getStudentEnrollment(): Promise<StudentEnrollment> {
  return mockEnrollment;
}

export async function getExamSettings(): Promise<ExamSettings> {
  return mockExamSettings;
}

export async function getExamQuestions(locale: Locale): Promise<ExamQuestion[]> {
  return mockExamQuestions(locale);
}

// Todo: Resume the student's open attempt, or create one, so the deadline survives a reload
export async function startExamAttempt(): Promise<ExamAttempt> {
  await connection();
  return mockExamAttempt();
}

export async function getLatestExamResult(locale: Locale): Promise<ExamResult | null> {
  return mockExamResult(locale);
}

export async function getStudentCertificate(): Promise<StudentCertificate | null> {
  return mockCertificate;
}
