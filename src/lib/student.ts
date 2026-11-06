import { mockCertificate, mockEnrollment, mockExamQuestions, mockExamResult, mockExamSettings, mockStudentAccount } from "@/content/mock-student";
import type { Locale } from "@/i18n/config";
import type { ExamQuestion, ExamResult, ExamSettings, StudentAccount, StudentCertificate, StudentEnrollment } from "@/types/student";

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

export async function getLatestExamResult(locale: Locale): Promise<ExamResult> {
  return mockExamResult(locale);
}

export async function getStudentCertificate(): Promise<StudentCertificate> {
  return mockCertificate;
}
