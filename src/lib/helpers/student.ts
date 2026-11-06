import { certificateCredits, certificateValidYears } from "@/constants/student";
import type { Locale } from "@/i18n/config";
import type { CertificateDetail, CourseDetailRow, CourseStep, CourseStepContent, CourseStepHrefs, ExamAnswers, ExamResult, ExamSettings, HeaderAccount, StudentAccount, StudentCertificate, StudentCertificateLabels, StudentCopy, StudentEnrollment } from "@/types/student";
import { formatDate, formatPercent, interpolate } from "./format";

export function headerAccount(account: StudentAccount): HeaderAccount {
  return {
    name: `${account.firstName} ${account.lastName}`,
    email: account.email,
    initials: `${account.firstName[0] ?? ""}${account.lastName[0] ?? ""}`.toUpperCase()
  }
}

export function courseSteps(enrollment: StudentEnrollment): CourseStep[] {
  const passed = enrollment.examStatus === "passed";
  return [
    { key: "material", state: enrollment.examStatus === "notStarted" ? "current" : "done" },
    { key: "exam", state: passed ? "done" : "current" },
    { key: "certificate", state: passed ? "current" : "locked" }
  ];
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
    { label: labels.attempts, value: interpolate(labels.attemptsValue, { used: enrollment.attemptsUsed, max: enrollment.maxAttempts }) }
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
        note: passed && enrollment.passedOn
          ? interpolate(labels.exam.passed, { date: formatDate(locale, enrollment.passedOn), score: formatPercent(locale, enrollment.scorePct ?? 0) })
          : interpolate(labels.exam.attempts, { used: enrollment.attemptsUsed, max: enrollment.maxAttempts }),
        actions: passed ? [] : [{ label: enrollment.attemptsUsed > 0 ? labels.exam.retake : labels.exam.start, href: hrefs.exam, variant: "primary" }]
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
