import type { Dictionary } from "@/i18n/dictionaries";
import type { CourseCode } from "./courses";

export type StudentCopy = Dictionary["student"];

export type AccountMenuLabels = StudentCopy["account"];

export type ExamLabels = StudentCopy["exam"];

export type StudentCertificateLabels = StudentCopy["certificate"];

export type ExamStatus = "notStarted" | "passed" | "failed";

export type MockStudentScenario = "notStarted" | "failed" | "noAttemptsLeft" | "passed";

export type CourseStepKey = "material" | "exam" | "certificate";

export type CourseStepState = "done" | "current" | "locked";

export interface StudentAccount {
  firstName: string;
  lastName: string;
  email: string;
}

export interface HeaderAccount {
  name: string;
  email: string;
  initials: string;
}

export interface HeaderAccountMenu {
  account: HeaderAccount;
  myCourseHref: string;
  labels: AccountMenuLabels;
}

export interface StudentEnrollment {
  courseCode: CourseCode;
  enrolledOn: string;
  examStatus: ExamStatus;
  attemptsUsed: number;
  maxAttempts: number;
  passedOn?: string;
  scorePct?: number;
}

export interface CourseStep {
  key: CourseStepKey;
  state: CourseStepState;
}

export interface CourseStepAction {
  label: string;
  href: string;
  variant: "primary" | "secondary";
  icon?: "download";
}

export interface CourseStepContent extends CourseStep {
  title: string;
  body: string;
  note?: string;
  actions: CourseStepAction[];
}

export interface CourseStepHrefs {
  material: string;
  materialDownload: string;
  exam: string;
  certificate: string;
  contact: string;
}

export interface CertificateDetail {
  label: string;
  value: string;
}

export interface CourseDetailRow {
  label: string;
  value: string;
}

export interface ExamOption {
  id: string;
  text: string;
}

export interface ExamQuestion {
  id: number;
  prompt: string;
  options: ExamOption[];
}

export interface ExamSettings {
  timeLimitMinutes: number;
  passMarkPct: number;
}

export interface ExamAttempt {
  startedAt: string;
}

export interface CountdownCallbacks {
  onWarning: (minutesLeft: number) => void;
  onExpire: () => void;
}

export type ExamAnswers = Record<number, string>;

export interface ExamAnswerReview {
  questionId: number;
  prompt: string;
  answer: string | null;
  correct: boolean;
}

export interface ExamResult {
  submittedAt: string;
  correctCount: number;
  questionCount: number;
  passMarkPct: number;
  passed: boolean;
  attemptsLeft: number;
  answers: ExamAnswerReview[];
}

export interface StudentCertificate {
  studentName: string;
  courseCode: CourseCode;
  certificateNumber: string;
  issuedOn: string;
  validUntil: string;
  credits: number;
}
