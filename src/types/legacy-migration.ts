import type { Locale } from "@/i18n/config";
import type { QuestionType } from "./admin";
import type { CourseCode } from "./courses";

export type DumpRow = Record<string, string | null>;

export interface LegacyUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  company: string | null;
  course: string;
  paid: boolean;
  passedOn: string | null;
  created: string;
  notes: string | null;
}

export interface LegacyAnswer {
  id: number;
  userId: number;
  question: string;
  answer: string;
  isCorrect: boolean;
  createdAt: string;
}

export interface LegacyDump {
  users: LegacyUser[];
  answers: LegacyAnswer[];
  certificateCodes: Record<string, string>;
}

export interface LegacyCourseRef {
  code: CourseCode;
  locale: Locale;
}

export interface CourseLocaleCopy {
  name: string;
  description: string;
  lectureTitle: string;
  outcomes: string[];
}

export interface CourseCopy {
  priceCents: number;
  durationHours: number;
  lectureMinutes: number;
  locales: Record<Locale, CourseLocaleCopy>;
}

export interface CourseSeed extends Omit<CourseCopy, "locales"> {
  code: CourseCode;
  questionsPerAttempt: number;
  certificateValidMonths: number;
  locales: CourseLocaleSeed[];
}

export interface CourseLocaleSeed extends CourseLocaleCopy {
  locale: Locale;
  certificateCode: string;
}

export interface PersonSeed {
  email: string;
  firstName: string;
  lastName: string;
  passwordHash: string;
  preferredLocale: Locale;
  createdAt: string;
  rows: LegacyUser[];
}

export interface LegacyQuestion {
  line: number;
  category: string;
  prompt: string;
  correct: number;
  options: string[];
}

export type LegacyQuestionSource = LegacyCourseRef & { airOnly: boolean }

export interface QuestionSeed {
  code: CourseCode;
  locale: Locale;
  type: QuestionType;
  prompt: string;
  options: string[];
  correctIndex: number;
  sortOrder: number;
}

export interface AttemptAnswerSeed {
  question: string;
  answer: string;
  isCorrect: boolean;
  questionIndex: number | null;
  options: string[];
  selectedIndex: number | null;
  correctAnswerText: string | null;
}

export interface AttemptSeed {
  legacyUserId: number;
  submittedAt: string;
  answers: AttemptAnswerSeed[];
  questionCount: number;
  correctCount: number;
  passed: boolean;
}

export interface QuestionReport {
  banks: { code: CourseCode; locale: Locale; questions: number; trueFalse: number }[];
  skippedRows: { line: number; reason: string }[];
  linkedAnswers: number;
  unlinkedPrompts: string[];
}

export interface PersonSplit {
  key: string;
  people: { email: string; name: string; legacyIds: number[] }[];
}

export interface MigrationReport {
  legacyUsers: number;
  legacyAnswers: number;
  people: number;
  mergedRows: number;
  splits: PersonSplit[];
  organizations: number;
  organizationSpellingsMerged: number;
  textRepairs: { mojibake: number; entities: number; unknownEntities: string[] };
  attempts: number;
  attemptsPassed: number;
  unusualAttemptSizes: { legacyUserId: number; submittedAt: string; size: number; expected: number }[];
  orphanAnswers: { legacyUserId: number; count: number }[];
  questions: QuestionReport | null;
}

export interface MigrationPlan {
  courses: CourseSeed[];
  organizations: string[];
  people: PersonSeed[];
  attempts: AttemptSeed[];
  questions: QuestionSeed[] | null;
  report: MigrationReport;
}
