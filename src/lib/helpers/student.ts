import { certificateCredits, certificateValidYears, examTimeWarningMinutes } from "@/constants/student";
import type { Locale } from "@/i18n/config";
import type { CertificateDetail, CourseDetailRow, CourseStep, CourseStepContent, CourseStepHrefs, ExamAnswers, ExamAttempt, ExamResult, ExamSettings, HeaderAccount, StudentAccount, StudentCertificate, StudentCertificateLabels, StudentCopy, StudentEnrollment } from "@/types/student";
import { formatDate, formatPercent, interpolate, plural } from "./format";

export function headerAccount(account: StudentAccount): HeaderAccount {
  return {
    name: `${account.firstName} ${account.lastName}`,
    email: account.email,
    initials: `${account.firstName[0] ?? ""}${account.lastName[0] ?? ""}`.toUpperCase()
  }
}

export function attemptsLeft(enrollment: StudentEnrollment) {
  return enrollment.maxAttempts === null ? null : Math.max(0, enrollment.maxAttempts - enrollment.attemptsUsed);
}

export function canTakeExam(enrollment: StudentEnrollment) {
  const left = attemptsLeft(enrollment);
  return enrollment.examStatus !== "passed" && (left === null || left > 0);
}

export function isOutOfAttempts(result: ExamResult) {
  return !result.passed && result.attemptsLeft === 0;
}

export function courseSteps(enrollment: StudentEnrollment): CourseStep[] {
  const passed = enrollment.examStatus === "passed";
  return [
    { key: "material", state: enrollment.examStatus === "notStarted" ? "current" : "done" },
    { key: "exam", state: passed ? "done" : canTakeExam(enrollment) ? "current" : "locked" },
    { key: "certificate", state: passed ? "current" : "locked" }
  ];
}

export function examDeadline(attempt: ExamAttempt, settings: ExamSettings) {
  return new Date(attempt.startedAt).getTime() + settings.timeLimitMinutes * 60_000;
}

export function remainingMs(deadline: number, now: number) {
  return Math.max(0, deadline - now);
}

export function newTimeWarnings(remaining: number, announced: number[]) {
  return examTimeWarningMinutes.filter((minutes) => remaining <= minutes * 60_000 && !announced.includes(minutes));
}

export function isTimeLow(remaining: number) {
  return remaining <= Math.max(...examTimeWarningMinutes) * 60_000;
}

export function examAnswerField(questionId: number) {
  return `answer-${questionId}`;
}

export function answeredCount(answers: ExamAnswers) {
  return Object.keys(answers).length;
}

export function unansweredIds(questionIds: number[], answers: ExamAnswers) {
  return questionIds.filter((id) => !(id in answers));
}

export function resultScorePct(result: ExamResult) {
  return Math.round((result.correctCount / result.questionCount) * 100);
}

export function courseDetailRows(courseTitle: string, enrollment: StudentEnrollment, settings: ExamSettings, questionCount: number, labels: StudentCopy["myCourse"]["details"], locale: Locale): CourseDetailRow[] {
  return [
    { label: labels.course, value: courseTitle },
    { label: labels.language, value: labels.languageValue },
    { label: labels.enrolled, value: formatDate(locale, enrollment.enrolledOn) },
    { label: labels.exam, value: interpolate(labels.examValue, { questions: questionCount, minutes: settings.timeLimitMinutes }) },
    { label: labels.passMark, value: formatPercent(locale, settings.passMarkPct) },
    {
      label: labels.attempts,
      value: enrollment.maxAttempts === null
        ? interpolate(labels.attemptsUnlimitedValue, { used: enrollment.attemptsUsed })
        : interpolate(labels.attemptsValue, { used: enrollment.attemptsUsed, max: enrollment.maxAttempts })
    }
  ];
}

export function courseStepContent(steps: CourseStep[], enrollment: StudentEnrollment, settings: ExamSettings, questionCount: number, hrefs: CourseStepHrefs, labels: StudentCopy["myCourse"]["steps"], locale: Locale): CourseStepContent[] {
  const passed = enrollment.examStatus === "passed";
  return steps.map((step) => {
    if (step.key === "material") {
      return {
        ...step,
        title: labels.material.title,
        body: labels.material.body,
        actions: [
          { label: labels.material.open, href: hrefs.material, variant: "primary" },
          { label: labels.material.download, href: hrefs.materialDownload, variant: "secondary", icon: "download" }
        ]
      }
    }
    if (step.key === "exam") {
      return {
        ...step,
        title: labels.exam.title,
        body: interpolate(labels.exam.body, { questions: questionCount, minutes: settings.timeLimitMinutes, passMark: formatPercent(locale, settings.passMarkPct) }),
        note: examStepNote(enrollment, labels.exam, locale),
        actions: examStepActions(enrollment, hrefs, labels.exam)
      }
    }
    return {
      ...step,
      title: labels.certificate.title,
      body: interpolate(labels.certificate.body, { years: certificateValidYears, credits: certificateCredits.toLocaleString(locale) }),
      note: passed ? undefined : labels.certificate.locked,
      actions: passed ? [{ label: labels.certificate.view, href: hrefs.certificate, variant: "primary" }] : []
    }
  });
}

function examStepNote(enrollment: StudentEnrollment, labels: StudentCopy["myCourse"]["steps"]["exam"], locale: Locale) {
  if (enrollment.examStatus === "passed" && enrollment.passedOn) {
    return interpolate(labels.passed, { date: formatDate(locale, enrollment.passedOn), score: formatPercent(locale, enrollment.scorePct ?? 0) });
  }
  if (enrollment.maxAttempts === null) return plural(locale, labels.attemptsUnlimited, enrollment.attemptsUsed);
  if (enrollment.examStatus !== "passed" && !canTakeExam(enrollment)) return interpolate(labels.noAttempts, { max: enrollment.maxAttempts });
  return interpolate(labels.attempts, { used: enrollment.attemptsUsed, max: enrollment.maxAttempts });
}

function examStepActions(enrollment: StudentEnrollment, hrefs: CourseStepHrefs, labels: StudentCopy["myCourse"]["steps"]["exam"]): CourseStepContent["actions"] {
  if (enrollment.examStatus === "passed") return [];
  if (!canTakeExam(enrollment)) return [{ label: labels.contact, href: hrefs.contact, variant: "secondary" }];
  return [{ label: enrollment.attemptsUsed > 0 ? labels.retake : labels.start, href: hrefs.exam, variant: "primary" }];
}

export function progressPct(done: number, total: number) {
  return total === 0 ? 0 : Math.round((done / total) * 100);
}

export function questionAnchor(questionId: number) {
  return `question-${questionId}`;
}

export function certificateDetails(certificate: StudentCertificate, labels: StudentCertificateLabels, locale: Locale): CertificateDetail[] {
  return [
    { label: labels.issued, value: formatDate(locale, certificate.issuedOn) },
    { label: labels.validUntil, value: formatDate(locale, certificate.validUntil) },
    { label: labels.number, value: certificate.certificateNumber }
  ];
}
