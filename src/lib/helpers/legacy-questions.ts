import type { CourseCode } from "@/types/courses";
import type { AttemptAnswerSeed, LegacyAnswer, LegacyQuestion, QuestionReport, QuestionSeed } from "@/types/legacy-migration";
import type { Locale } from "@/i18n/config";
import { legacyQuestionCategories, legacyQuestionOptionCount, trueFalseOptions } from "../../constants/legacy-migration.ts";
import { decodeLegacyBytes } from "./legacy-text.ts";

export function readQuestionCsv(bytes: Uint8Array): LegacyQuestion[] {
  const lines = decodeLegacyBytes(bytes).split("\n");
  return lines.slice(1).flatMap((line, index) => {
    const fields = parseCsvLine(line.replace(/\r$/, ""));
    if (fields.every((field) => !field.trim())) return [];
    const [category = "", prompt = "", correct = "", ...options] = fields;
    return [{ line: index + 2, category, prompt, correct: Number(correct), options: options.slice(0, legacyQuestionOptionCount) }];
  });
}

function parseCsvLine(line: string) {
  const fields: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (quoted) {
      if (char === "\"" && line[i + 1] === "\"") {
        field += "\"";
        i++;
      } else if (char === "\"") {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === "\"") {
      quoted = true;
    } else if (char === ",") {
      fields.push(field);
      field = "";
    } else {
      field += char;
    }
  }
  fields.push(field);
  return fields;
}

function bankKey(code: CourseCode, locale: Locale) {
  return `${code}-${locale}`;
}

export function buildQuestionBanks(rows: LegacyQuestion[], clean: (value: string) => string) {
  const skippedRows: QuestionReport["skippedRows"] = [];
  const general = new Map<Locale, Omit<QuestionSeed, "code" | "sortOrder">[]>();
  const airOnly = new Map<Locale, Omit<QuestionSeed, "code" | "sortOrder">[]>();

  for (const row of rows) {
    const source = legacyQuestionCategories[row.category.replace(/\s+/g, "").toLowerCase()];
    if (!source) {
      skippedRows.push({ line: row.line, reason: `unknown category "${row.category}"` });
      continue;
    }
    const options = row.options.map(clean);
    while (options.length && !options[options.length - 1]) options.pop();
    const prompt = clean(row.prompt);
    const correctIndex = row.correct - 1;
    if (!prompt) {
      skippedRows.push({ line: row.line, reason: "empty question" });
      continue;
    }
    if (options.length < 2 || options.some((option) => !option)) {
      skippedRows.push({ line: row.line, reason: "needs at least two options with no gaps" });
      continue;
    }
    if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex >= options.length) {
      skippedRows.push({ line: row.line, reason: `correct answer "${row.correct}" doesn't match an option` });
      continue;
    }
    const type = options.length === 2 && options.every((option) => trueFalseOptions.has(option.toLowerCase())) ? "trueFalse" : "multipleChoice";
    const target = source.airOnly ? airOnly : general;
    target.set(source.locale, [...(target.get(source.locale) ?? []), { locale: source.locale, type, prompt, options, correctIndex }]);
  }

  const locales = [...new Set([...general.keys(), ...airOnly.keys()])];
  const questions: QuestionSeed[] = locales.flatMap((locale) => {
    const ground = general.get(locale) ?? [];
    const air = [...ground, ...(airOnly.get(locale) ?? [])];
    return [
      ...ground.map((question, index) => ({ ...question, code: "ground" as const, sortOrder: index + 1 })),
      ...air.map((question, index) => ({ ...question, code: "air" as const, sortOrder: index + 1 }))
    ]
  });

  const banks = [...new Set(questions.map((question) => bankKey(question.code, question.locale)))].map((key) => {
    const bank = questions.filter((question) => bankKey(question.code, question.locale) === key);
    return { code: bank[0].code, locale: bank[0].locale, questions: bank.length, trueFalse: bank.filter((question) => question.type === "trueFalse").length }
  });

  return { questions, banks, skippedRows }
}

export function createAnswerLinker(questions: QuestionSeed[] | null) {
  const byPrompt = new Map<string, number[]>();
  questions?.forEach((question, index) => {
    const key = `${bankKey(question.code, question.locale)}|${question.prompt}`;
    byPrompt.set(key, [...(byPrompt.get(key) ?? []), index]);
  });
  const unlinkedPrompts = new Set<string>();
  let linkedAnswers = 0;

  function link(answer: LegacyAnswer, code: CourseCode, locale: Locale): AttemptAnswerSeed {
    const base = { question: answer.question, answer: answer.answer, isCorrect: answer.isCorrect }
    const candidates = questions ? byPrompt.get(`${bankKey(code, locale)}|${answer.question}`) ?? [] : [];
    const questionIndex = candidates.find((index) => questions![index].options.includes(answer.answer)) ?? candidates[0];
    if (questionIndex === undefined) {
      if (questions) unlinkedPrompts.add(answer.question);
      return { ...base, questionIndex: null, options: [], selectedIndex: null, correctAnswerText: null }
    }
    linkedAnswers++;
    const question = questions![questionIndex];
    const selected = question.options.indexOf(answer.answer);
    return {
      ...base,
      questionIndex,
      options: question.options,
      selectedIndex: selected === -1 ? null : selected,
      correctAnswerText: question.options[question.correctIndex]
    }
  }

  return { link, stats: () => ({ linkedAnswers, unlinkedPrompts: [...unlinkedPrompts] }) }
}
