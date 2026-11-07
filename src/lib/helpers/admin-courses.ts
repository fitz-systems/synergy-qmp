import { adminFilterAll, adminSearchParam, courseLocaleFieldLabels, courseLocaleFields, courseOptions, courseSettingLabels, courseSettings, courseSettingRanges, courseSettingUnits, importColumns, maxQuestionOptions, minQuestionOptions, questionCsvBom, questionStatusLabels, questionTypeLabels, trueFalseOptions } from "@/constants/admin";
import { locales, type Locale } from "@/i18n/config";
import type { AdminCourse, AdminCourseRecord, AdminQuestion, AdminQuestionListQuery, AdminQuestionOption, AdminQuestionRecord, AdminSearchParams, CourseFormState, CourseFormValues, CourseLocaleField, CourseSetting, CourseSettings, QuestionFormState, QuestionFormValues, QuestionStatus, QuestionType } from "@/types/admin";
import type { CourseCode } from "@/types/courses";
import { courseCodeOf, languageLabel, localeOf, optionLetter, questionBankLabel, searchParamValue } from "./admin";
import { readFormString } from "./forms";

function perLocale<T>(make: (locale: Locale) => T) {
  return Object.fromEntries(locales.map((locale) => [locale, make(locale)])) as Record<Locale, T>;
}

function courseOrder(code: string) {
  return courseOptions.findIndex((option) => option.value === code);
}

export function sortCourses<T extends { code: string }>(courses: T[]) {
  return courses.toSorted((a, b) => courseOrder(a.code) - courseOrder(b.code));
}

export function adminCourse(record: AdminCourseRecord): AdminCourse {
  const row = (locale: Locale) => record.locales.find((entry) => entry.locale === locale);
  return {
    code: courseCodeOf(record.code),
    names: perLocale((locale) => row(locale)?.name ?? ""),
    descriptions: perLocale((locale) => row(locale)?.description ?? ""),
    materialUploaded: perLocale((locale) => Boolean(row(locale)?.materialFileKey)),
    certificateCodes: perLocale((locale) => row(locale)?.certificateCode ?? ""),
    questionCounts: perLocale((locale) => row(locale)?.questions.length ?? 0),
    activeQuestionCounts: perLocale((locale) => row(locale)?.questions.filter((question) => question.active).length ?? 0),
    questionsPerAttempt: record.questionsPerAttempt,
    passMarkPct: record.passMarkPct,
    timeLimitMinutes: record.timeLimitMinutes,
    maxAttempts: record.maxAttempts,
    certificateValidMonths: record.certificateValidMonths,
    shuffleQuestions: record.shuffleQuestions,
    shuffleAnswers: record.shuffleAnswers,
    active: record.active
  }
}

function courseLocaleValue(course: AdminCourse, field: CourseLocaleField, locale: Locale) {
  if (field === "name") return course.names[locale];
  if (field === "description") return course.descriptions[locale];
  return course.certificateCodes[locale];
}

function courseLocaleEntries(make: (field: CourseLocaleField, locale: Locale) => string) {
  return Object.fromEntries(locales.flatMap((locale) => courseLocaleFields.map((field) => [`${field}.${locale}`, make(field, locale)])));
}

export function courseFormValues(course: AdminCourse): CourseFormValues {
  return {
    ...courseLocaleEntries((field, locale) => courseLocaleValue(course, field, locale)),
    passMarkPct: String(course.passMarkPct),
    questionsPerAttempt: String(course.questionsPerAttempt),
    timeLimitMinutes: String(course.timeLimitMinutes),
    maxAttempts: course.maxAttempts === null ? "" : String(course.maxAttempts),
    certificateValidMonths: String(course.certificateValidMonths),
    shuffleQuestions: course.shuffleQuestions,
    shuffleAnswers: course.shuffleAnswers,
    active: course.active
  } as CourseFormValues;
}

export function initialCourseFormState(course: AdminCourse): CourseFormState {
  return { status: "idle", values: courseFormValues(course), errors: {} }
}

export function readCourseForm(formData: FormData): CourseFormValues {
  return {
    ...courseLocaleEntries((field, locale) => readFormString(formData, `${field}.${locale}`)),
    ...Object.fromEntries(courseSettings.map((setting) => [setting, readFormString(formData, setting)])),
    shuffleQuestions: formData.get("shuffleQuestions") === "on",
    shuffleAnswers: formData.get("shuffleAnswers") === "on",
    active: formData.get("active") === "on"
  } as CourseFormValues;
}

function wholeNumber(value: string) {
  return /^\d{1,6}$/.test(value) ? Number(value) : null;
}

function settingValue(values: CourseFormValues, setting: CourseSetting) {
  const value = wholeNumber(values[setting]);
  const { min, max } = courseSettingRanges[setting];
  return value !== null && value >= min && value <= max ? value : null;
}

export function validateCourseForm(values: CourseFormValues): CourseFormState["errors"] {
  const errors: CourseFormState["errors"] = {}
  for (const locale of locales) {
    const language = languageLabel(locale);
    if (!values[`name.${locale}`]) errors[`name.${locale}`] = `Enter the ${language} name.`;
    if (!values[`certificateCode.${locale}`]) errors[`certificateCode.${locale}`] = `Enter the ${language} certificate code.`;
  }
  for (const setting of courseSettings) {
    if (setting === "maxAttempts" && values.maxAttempts === "") continue;
    if (settingValue(values, setting) === null) {
      const { min, max } = courseSettingRanges[setting];
      errors[setting] = `Enter a whole number from ${min} to ${max}.`;
    }
  }
  return errors;
}

export function parseCourseSettings(values: CourseFormValues): CourseSettings {
  return {
    passMarkPct: settingValue(values, "passMarkPct") ?? 0,
    questionsPerAttempt: settingValue(values, "questionsPerAttempt") ?? 0,
    timeLimitMinutes: settingValue(values, "timeLimitMinutes") ?? 0,
    maxAttempts: values.maxAttempts === "" ? null : settingValue(values, "maxAttempts"),
    certificateValidMonths: settingValue(values, "certificateValidMonths") ?? 0
  }
}

export function notEnoughQuestionsError(course: AdminCourse, questionsPerAttempt: number) {
  const short = locales.filter((locale) => course.activeQuestionCounts[locale] < questionsPerAttempt);
  if (short.length === 0) return undefined;
  const counts = short.map((locale) => `${course.activeQuestionCounts[locale]} ${languageLabel(locale)}`).join(" and ");
  return `Only ${counts} questions are active. Add or reactivate questions first.`;
}

function settingLabel(setting: CourseSetting, value: number | null) {
  return value === null ? "unlimited" : `${value}${courseSettingUnits[setting]}`;
}

export function courseChanges(before: AdminCourse, values: CourseFormValues, settings: CourseSettings) {
  const changes = courseSettings
    .filter((setting) => before[setting] !== settings[setting])
    .map((setting) => `${courseSettingLabels[setting].toLowerCase()} ${settingLabel(setting, before[setting])} → ${settingLabel(setting, settings[setting])}`);
  if (before.shuffleQuestions !== values.shuffleQuestions) changes.push(`question shuffling ${values.shuffleQuestions ? "on" : "off"}`);
  if (before.shuffleAnswers !== values.shuffleAnswers) changes.push(`answer shuffling ${values.shuffleAnswers ? "on" : "off"}`);
  if (before.active !== values.active) changes.push(values.active ? "activated" : "deactivated");
  for (const locale of locales) {
    for (const field of courseLocaleFields) {
      const previous = courseLocaleValue(before, field, locale);
      const next = values[`${field}.${locale}`];
      if (previous === next) continue;
      const label = `${languageLabel(locale)} ${courseLocaleFieldLabels[field]}`;
      changes.push(field === "certificateCode" ? `${label} ${previous} → ${next}` : label);
    }
  }
  return changes;
}

export function isQuestionType(value: string): value is QuestionType {
  return value in questionTypeLabels;
}

export function adminQuestion(record: AdminQuestionRecord): AdminQuestion {
  return {
    id: record.id,
    courseCode: courseCodeOf(record.courseLocale.course.code),
    locale: localeOf(record.locale),
    sortOrder: record.sortOrder,
    type: isQuestionType(record.type) ? record.type : "multipleChoice",
    prompt: record.prompt,
    options: record.options.map((text, index) => ({ text, correct: index === record.correctIndex })),
    explanation: record.explanation ?? "",
    active: record.active
  }
}

export function questionLabel(code: CourseCode, locale: Locale, sortOrder: number) {
  return `${questionBankLabel(code, locale)} #${sortOrder}`;
}

export function questionSnippet(prompt: string) {
  return prompt.length > 80 ? `${prompt.slice(0, 79)}…` : prompt;
}

export function defaultQuestionOptions(type: QuestionType, locale: Locale): AdminQuestionOption[] {
  return type === "trueFalse"
    ? trueFalseOptions[locale].map((text, index) => ({ text, correct: index === 0 }))
    : Array.from({ length: maxQuestionOptions }, (_, index) => ({ text: "", correct: index === 0 }));
}

export function questionOptionsOf(values: QuestionFormValues): AdminQuestionOption[] {
  return values.options.map((text, index) => ({ text, correct: index === values.correctIndex }));
}

export function questionFormValues(question: AdminQuestion | undefined, locale: Locale, nextSortOrder: number): QuestionFormValues {
  const options = question?.options ?? defaultQuestionOptions("multipleChoice", locale);
  return {
    type: question?.type ?? "multipleChoice",
    prompt: question?.prompt ?? "",
    options: options.map((option) => option.text),
    correctIndex: options.findIndex((option) => option.correct),
    explanation: question?.explanation ?? "",
    sortOrder: String(question?.sortOrder ?? nextSortOrder),
    active: question?.active ?? true
  }
}

export function initialQuestionFormState(question: AdminQuestion | undefined, locale: Locale, nextSortOrder: number): QuestionFormState {
  return { status: "idle", values: questionFormValues(question, locale, nextSortOrder), errors: {} }
}

function cleanText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function readQuestionForm(formData: FormData): QuestionFormValues {
  const type = readFormString(formData, "type");
  const correct = readFormString(formData, "correct");
  return {
    type: isQuestionType(type) ? type : "multipleChoice",
    prompt: readFormString(formData, "prompt"),
    options: formData.getAll("option").map((value) => (typeof value === "string" ? cleanText(value) : "")),
    correctIndex: /^\d+$/.test(correct) ? Number(correct) : -1,
    explanation: readFormString(formData, "explanation"),
    sortOrder: readFormString(formData, "sortOrder"),
    active: formData.get("active") === "on"
  }
}

export function validateQuestionForm(values: QuestionFormValues): QuestionFormState["errors"] {
  const errors: QuestionFormState["errors"] = {}
  if (!values.prompt) errors.prompt = "Enter the question.";

  const { options } = values;
  const lowered = options.map((option) => option.toLowerCase());
  if (values.type === "trueFalse" && options.length !== 2) errors.options = "True / false questions have exactly two answers.";
  else if (options.length < minQuestionOptions || options.length > maxQuestionOptions) errors.options = `Give between ${minQuestionOptions} and ${maxQuestionOptions} answers.`;
  else if (options.some((option) => option === "")) errors.options = "Fill in every answer, or remove the empty ones.";
  else if (new Set(lowered).size !== lowered.length) errors.options = "Each answer must be different.";
  else if (values.correctIndex < 0 || values.correctIndex >= options.length) errors.options = "Select the correct answer.";

  const sortOrder = wholeNumber(values.sortOrder);
  if (sortOrder === null || sortOrder > 9999) errors.sortOrder = "Enter a whole number from 0 to 9999.";
  return errors;
}

export function questionChanges(before: AdminQuestion, values: QuestionFormValues) {
  const beforeOptions = before.options.map((option) => option.text);
  const beforeCorrect = before.options.findIndex((option) => option.correct);
  const answersChanged = beforeOptions.length !== values.options.length || beforeOptions.some((text, index) => text !== values.options[index]);
  const changes: [boolean, string][] = [
    [before.type !== values.type, "type"],
    [before.prompt !== values.prompt, "question text"],
    [answersChanged, "answers"],
    [beforeOptions[beforeCorrect] !== values.options[values.correctIndex], "correct answer"],
    [before.explanation !== values.explanation, "explanation"],
    [String(before.sortOrder) !== values.sortOrder, "order"],
    [before.active !== values.active, values.active ? "made active" : "hidden"]
  ];
  return changes.filter(([changed]) => changed).map(([, label]) => label);
}

export function hiddenQuestionError(activeCount: number, questionsPerAttempt: number) {
  return `This would leave ${activeCount - 1} active questions, fewer than the ${questionsPerAttempt} drawn for each attempt.`;
}

function isQuestionStatus(value: string): value is QuestionStatus {
  return value in questionStatusLabels;
}

export function parseQuestionListQuery(params: AdminSearchParams): AdminQuestionListQuery {
  const status = searchParamValue(params, "status");
  return { search: searchParamValue(params, adminSearchParam), status: isQuestionStatus(status) ? status : undefined }
}

export function questionListFilterValues(query: AdminQuestionListQuery): Record<string, string> {
  return { [adminSearchParam]: query.search, status: query.status ?? adminFilterAll }
}

function csvCell(value: string) {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, "\"\"")}"` : value;
}

export function questionsCsv(questions: AdminQuestion[]) {
  const rows = questions.map((question) => {
    const texts = Array.from({ length: maxQuestionOptions }, (_, index) => question.options[index]?.text ?? "");
    const correct = question.options.findIndex((option) => option.correct);
    return [question.prompt, ...texts, correct === -1 ? "" : optionLetter(correct), question.explanation];
  });
  return questionCsvBom + [importColumns.questions, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n") + "\r\n";
}

export function questionsCsvFileName(code: CourseCode, locale: Locale) {
  return `questions-${code}-${locale}.csv`;
}
