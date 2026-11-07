import type { MigrationReport } from "@/types/legacy-migration";

export function formatMigrationReport(report: MigrationReport, verbose: boolean) {
  const lines = [
    "Legacy data",
    `  users rows        ${report.legacyUsers}`,
    `  exam answers      ${report.legacyAnswers}`,
    "",
    "Planned",
    `  people            ${report.people} (${report.mergedRows} renewal rows folded into an existing person)`,
    `  enrollments       ${report.legacyUsers} (one per legacy row)`,
    `  organizations     ${report.organizations} (${report.organizationSpellingsMerged} case/spacing variants merged)`,
    `  attempts          ${report.attempts} (${report.attemptsPassed} passed)`,
    `  attempt answers   ${report.legacyAnswers - report.orphanAnswers.reduce((total, orphan) => total + orphan.count, 0)}`,
    "",
    "Clean-up",
    `  text fixed        ${report.textRepairs.mojibake} mis-encoded accents, ${report.textRepairs.entities} values with HTML entities`,
    `  unknown entities  ${report.textRepairs.unknownEntities.join(" ") || "none"}`,
    `  skipped answers   ${report.orphanAnswers.map((orphan) => `${orphan.count} from deleted user ${orphan.legacyUserId}`).join(", ") || "none"}`,
    `  shared addresses  ${report.splits.length} addresses used by different people (kept as separate users)`,
    `  odd attempt sizes ${report.unusualAttemptSizes.length} attempts don't have the usual question count`
  ];

  const questions = report.questions;
  lines.push("", "Questions");
  if (!questions) {
    lines.push("  no question CSV given: existing question banks are left alone, old answers keep text only");
  } else {
    for (const bank of questions.banks) lines.push(`  ${`${bank.code}-${bank.locale}`.padEnd(18)}${bank.questions} questions (${bank.trueFalse} true/false)`);
    lines.push(
      `  skipped rows      ${questions.skippedRows.map((row) => `line ${row.line}: ${row.reason}`).join("; ") || "none"}`,
      `  old answers       ${questions.linkedAnswers} matched to a question, ${questions.unlinkedPrompts.length} prompts not found in the bank`
    );
  }

  if (verbose && questions?.unlinkedPrompts.length) {
    lines.push("", "Prompts in old answers with no matching question");
    for (const prompt of questions.unlinkedPrompts) lines.push(`  ${prompt}`);
  }

  if (verbose) {
    lines.push("", "Shared addresses");
    for (const split of report.splits) {
      lines.push(`  ${split.key}`);
      for (const person of split.people) lines.push(`    ${person.name} → ${person.email} (legacy ${person.legacyIds.join(", ")})`);
    }
    lines.push("", "Odd attempt sizes");
    for (const attempt of report.unusualAttemptSizes) lines.push(`  legacy ${attempt.legacyUserId} at ${attempt.submittedAt}: ${attempt.size} of ${attempt.expected}`);
  }

  return lines.join("\n");
}
