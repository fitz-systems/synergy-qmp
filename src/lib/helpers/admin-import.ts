import { courseOptions, importColumns, importKindNouns, importMaxRows, importMessages, languageAliases, maxQuestionOptions, questionImportLetters, trueFalseImportWords, trueFalseOptions, trueImportWords } from "@/constants/admin";
import { hasLocale, type Locale } from "@/i18n/config";
import type { ImportKind, ImportPreviewRow, ImportQuestionContext, ImportQuestionRow, ImportRecord, ImportTable, ImportUserContext, ImportUserRow, ParsedImport, QuestionBankKey, QuestionFormValues } from "@/types/admin";
import type { CourseCode } from "@/types/courses";
import { courseLabel, isCourseOption } from "./admin";
import { validateQuestionForm } from "./admin-courses";
import { nameKey, normalizeName } from "./admin-distributors";
import { csvLine, parseCsv } from "./csv";
import { isEmail } from "./forms";

function headerName(value: string) {
  return value.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

export function readImportTable(kind: ImportKind, text: string): ImportTable {
  const rows = parseCsv(text).filter((row) => row.some((cell) => cell.trim() !== ""));
  if (rows.length === 0) return { fileError: importMessages.empty, records: [] }

  const columns = importColumns[kind];
  const header = rows[0].map(headerName);
  const missing = columns.filter((column) => !header.includes(column));
  if (missing.length > 0) return { fileError: `The first row must name the columns ${columns.join(", ")}. Missing: ${missing.join(", ")}.`, records: [] }
  if (rows.length === 1) return { fileError: importMessages.noRows, records: [] }
  if (rows.length - 1 > importMaxRows) return { fileError: importMessages.tooManyRows, records: [] }

  const records = rows.slice(1).map((row, index) => {
    const cells = Object.fromEntries(columns.map((column) => [column, (row[header.indexOf(column)] ?? "").trim()]));
    return { line: index + 2, cells, values: columns.map((column) => cells[column]) }
  });
  return { records }
}

export function courseFromCell(value: string): CourseCode | undefined {
  const needle = value.toLowerCase();
  const match = courseOptions.find((option) => option.value === needle || option.label.toLowerCase() === needle)?.value;
  return match && isCourseOption(match) ? match : undefined;
}

export function localeFromCell(value: string): Locale | undefined {
  return languageAliases[value.toLowerCase()];
}

function previewRow(record: ImportRecord, problem?: string): ImportPreviewRow {
  return problem ? { line: record.line, values: record.values, problem } : { line: record.line, values: record.values }
}

function userProblem(record: ImportRecord, context: ImportUserContext, seen: Map<string, number>) {
  const { cells } = record;
  const email = cells.email.toLowerCase();
  const course = courseFromCell(cells.course);
  if (!cells.first_name) return "First name is missing";
  if (!cells.last_name) return "Last name is missing";
  if (!email) return "Email is missing";
  if (!isEmail(email)) return "Email isn't valid";
  if (!course) return `Course must be ${courseOptions.map((option) => option.value).join(" or ")}`;
  if (!localeFromCell(cells.language)) return "Language must be en or fr";
  if (context.inactiveCourses.has(course)) return `The ${courseLabel(course)} course is inactive`;
  const owner = context.existing.get(email);
  if (owner !== undefined) return `Email already belongs to ${owner}`;
  const earlier = seen.get(email);
  if (earlier !== undefined) return `Same email as line ${earlier}`;
  if (cells.company && !context.companies.has(nameKey(cells.company))) return "Company isn't in the company list";
  return undefined;
}

export function validateUserRecords(records: ImportRecord[], context: ImportUserContext): ParsedImport<ImportUserRow> {
  const seen = new Map<string, number>();
  const preview: ImportPreviewRow[] = [];
  const rows: ImportUserRow[] = [];
  const missingCompanies = new Map<string, string>();

  for (const record of records) {
    const problem = userProblem(record, context, seen);
    preview.push(previewRow(record, problem));
    const companyKey = nameKey(record.cells.company);
    if (companyKey && !context.companies.has(companyKey) && !missingCompanies.has(companyKey)) missingCompanies.set(companyKey, normalizeName(record.cells.company));
    const email = record.cells.email.toLowerCase();
    if (email && !seen.has(email)) seen.set(email, record.line);
    if (problem) continue;
    rows.push({
      line: record.line,
      firstName: record.cells.first_name.replace(/\s+/g, " "),
      lastName: record.cells.last_name.replace(/\s+/g, " "),
      email,
      company: context.companies.get(companyKey) ?? null,
      course: courseFromCell(record.cells.course)!,
      locale: localeFromCell(record.cells.language)!
    });
  }
  return { preview, rows, missingCompanies: [...missingCompanies.values()].sort((a, b) => a.localeCompare(b)) }
}

function correctIndexOf(value: string) {
  const letter = value.toUpperCase();
  const index = questionImportLetters.indexOf(letter);
  if (index !== -1) return index;
  return /^[1-4]$/.test(value) ? Number(value) - 1 : -1;
}

export function promptKey(prompt: string) {
  return prompt.toLowerCase().replace(/\s+/g, " ").trim();
}

export function trueFalseOptionText(option: string, locale: Locale) {
  return trueFalseOptions[locale][trueImportWords.has(option.toLowerCase()) ? 0 : 1];
}

function questionValues(record: ImportRecord, sortOrder: number, locale: Locale): QuestionFormValues {
  const options = questionImportLetters.slice(0, maxQuestionOptions).map((letter) => record.cells[`option_${letter.toLowerCase()}`].replace(/\s+/g, " "));
  while (options.length > 0 && options[options.length - 1] === "") options.pop();
  const trueFalse = options.length === 2 && options.every((option) => trueFalseImportWords.has(option.toLowerCase()));
  return {
    type: trueFalse ? "trueFalse" : "multipleChoice",
    prompt: record.cells.prompt,
    options: trueFalse ? options.map((option) => trueFalseOptionText(option, locale)) : options,
    correctIndex: correctIndexOf(record.cells.correct),
    explanation: record.cells.explanation,
    sortOrder: String(sortOrder),
    active: true
  }
}

function questionProblem(values: QuestionFormValues, record: ImportRecord, context: ImportQuestionContext, seen: Map<string, number>) {
  if (!values.prompt) return "Question is missing";
  if (values.options.length < 2) return "Needs at least two answers";
  if (values.options.some((option) => option === "")) return "Fill in the answers from option_a with no gaps";
  if (values.correctIndex < 0 || values.correctIndex >= values.options.length) return record.cells.correct ? `Correct answer ${record.cells.correct} has no option` : "Correct answer is missing";
  const formErrors = validateQuestionForm(values);
  if (formErrors.options) return formErrors.options.replace(/\.$/, "");
  const key = promptKey(values.prompt);
  if (context.existingPrompts.has(key)) return "Already in this question bank";
  const earlier = seen.get(key);
  if (earlier !== undefined) return `Same question as line ${earlier}`;
  return undefined;
}

export function validateQuestionRecords(records: ImportRecord[], context: ImportQuestionContext): ParsedImport<ImportQuestionRow> {
  const seen = new Map<string, number>();
  const preview: ImportPreviewRow[] = [];
  const rows: ImportQuestionRow[] = [];
  let sortOrder = context.nextSortOrder;

  for (const record of records) {
    const values = questionValues(record, sortOrder, context.locale);
    const problem = questionProblem(values, record, context, seen);
    preview.push(previewRow(record, problem));
    const key = promptKey(values.prompt);
    if (key && !seen.has(key)) seen.set(key, record.line);
    if (problem) continue;
    rows.push({ line: record.line, values });
    sortOrder++;
  }
  return { preview, rows }
}

export function importTemplate(kind: ImportKind) {
  return `${csvLine(importColumns[kind])}\r\n`;
}

export function importTemplateFileName(kind: ImportKind) {
  return `${kind}-template.csv`;
}

export function importCountLabel(kind: ImportKind, count: number) {
  const noun = importKindNouns[kind];
  return `${count.toLocaleString("en-CA")} ${count === 1 ? noun.one : noun.other}`;
}

export function importSummary(created: number, skipped: number) {
  return skipped > 0 ? `${created} created, ${skipped} skipped` : `${created} created`;
}

export function parseBank(value: string): QuestionBankKey | null {
  const index = value.lastIndexOf("-");
  const code = value.slice(0, index);
  const locale = value.slice(index + 1);
  return index > 0 && isCourseOption(code) && hasLocale(locale) ? { code, locale } : null;
}
