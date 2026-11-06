import { connection } from "next/server";
import { mockCertificate, mockEnrollment, mockExamAttempt, mockExamQuestions, mockExamResult, mockExamSettings, mockStudentAccount } from "@/content/mock-student";
import type { Locale } from "@/i18n/config";
import type { ExamAttempt, ExamQuestion, ExamResult, ExamSettings, StudentAccount, StudentCertificate, StudentEnrollment } from "@/types/student";

// Todo: Read these from the signed-in session and the database; they return placeholder data while the UI is designed

export async function getStudentAccount(): Promise<StudentAccount> {
  return mockStudentAccount;
}

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
