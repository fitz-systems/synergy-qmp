import { describe, expect, it } from "vitest";
import { importCountLabel, readImportTable, trueFalseOptionText, validateQuestionRecords } from "@/lib/helpers/admin-import";
import type { Locale } from "@/i18n/config";

function importQuestions(csv: string, locale: Locale) {
  const { records } = readImportTable("questions", csv);
  return validateQuestionRecords(records, { locale, existingPrompts: new Set(), nextSortOrder: 1 });
}

const header = "prompt,option_a,option_b,option_c,option_d,correct,explanation";

describe("true / false import", () => {
  it("expands any spelling to the bank language's full words", () => {
    expect(trueFalseOptionText("T", "en")).toBe("True");
    expect(trueFalseOptionText("f", "en")).toBe("False");
    expect(trueFalseOptionText("V", "fr")).toBe("Vrai");
    expect(trueFalseOptionText("F", "fr")).toBe("Faux");
    expect(trueFalseOptionText("true", "fr")).toBe("Vrai");
  });

  it("stores abbreviated true / false questions as full words", () => {
    const en = importQuestions(`${header}\nIs it safe?,T,F,,,B,\n`, "en");
    expect(en.rows[0].values).toMatchObject({ type: "trueFalse", options: ["True", "False"], correctIndex: 1 });
    const fr = importQuestions(`${header}\nEst-ce sûr?,V,F,,,A,\n`, "fr");
    expect(fr.rows[0].values).toMatchObject({ type: "trueFalse", options: ["Vrai", "Faux"], correctIndex: 0 });
  });

  it("leaves multiple choice options as written", () => {
    const result = importQuestions(`${header}\nWhich class?,Class 7,Class 3,,,A,\n`, "en");
    expect(result.rows[0].values).toMatchObject({ type: "multipleChoice", options: ["Class 7", "Class 3"] });
  });
});

describe("import count labels", () => {
  it("use the singular for one row and the plural otherwise", () => {
    expect(importCountLabel("users", 1)).toBe("1 user");
    expect(importCountLabel("users", 0)).toBe("0 users");
    expect(importCountLabel("questions", 1)).toBe("1 question");
    expect(importCountLabel("questions", 1200)).toBe("1,200 questions");
  });
});
