import { describe, expect, it } from "vitest";
import { businessDate, drawQuestions, isAnswerCorrect, isAttemptAbandoned, isAttemptInProgress, optionIndex, scoreAttempt, shuffled } from "@/lib/helpers/exam";
import type { BankQuestion } from "@/types/student";

const bank: BankQuestion[] = [
  { id: 1, type: "multipleChoice", prompt: "Q1", options: ["A", "B", "C", "D"], correctIndex: 2 },
  { id: 2, type: "trueFalse", prompt: "Q2", options: ["True", "False"], correctIndex: 0 },
  { id: 3, type: "multipleChoice", prompt: "Q3", options: ["W", "X", "Y", "Z"], correctIndex: 3 },
  { id: 4, type: "multipleChoice", prompt: "Q4", options: ["1", "2", "3", "4"], correctIndex: 0 }
];

describe("scoreAttempt", () => {
  it("passes a ground exam at exactly 75%", () => {
    expect(scoreAttempt(15, 20, 75)).toEqual({ correctCount: 15, passed: true });
    expect(scoreAttempt(14, 20, 75).passed).toBe(false);
  });

  it("rounds the percentage before comparing, like the old exam.php", () => {
    expect(scoreAttempt(21, 28, 75).passed).toBe(true);
    expect(scoreAttempt(20, 28, 75).passed).toBe(false);
    expect(scoreAttempt(149, 200, 75).passed).toBe(true);
  });

  it("fails an attempt with no questions instead of dividing by zero", () => {
    expect(scoreAttempt(0, 0, 75).passed).toBe(false);
  });
});

describe("isAnswerCorrect", () => {
  it("matches on the answer text", () => {
    expect(isAnswerCorrect({ answerText: "B", correctAnswerText: "B" })).toBe(true);
    expect(isAnswerCorrect({ answerText: "A", correctAnswerText: "B" })).toBe(false);
  });

  it("never counts an unanswered question as correct", () => {
    expect(isAnswerCorrect({ answerText: null, correctAnswerText: null })).toBe(false);
  });
});

describe("optionIndex", () => {
  it("accepts in-range option ids as strings or numbers", () => {
    expect(optionIndex("0", 4)).toBe(0);
    expect(optionIndex(3, 4)).toBe(3);
  });

  it("rejects tampered or missing option ids instead of treating them as option A", () => {
    for (const value of ["4", "-1", "1.5", "abc", "", " ", null, undefined, false, [], {}]) {
      expect(optionIndex(value, 4)).toBeNull();
    }
  });
});

describe("attempt deadlines", () => {
  const expiresAt = new Date("2026-11-08T12:00:00Z");
  const at = (time: string) => new Date(`2026-11-08T${time}Z`);

  it("is in progress until the deadline", () => {
    expect(isAttemptInProgress({ submittedAt: null, expiresAt }, at("11:59:59"))).toBe(true);
    expect(isAttemptInProgress({ submittedAt: null, expiresAt }, at("12:00:00"))).toBe(false);
  });

  it("is only abandoned once the 60 second grace period has passed", () => {
    expect(isAttemptAbandoned({ submittedAt: null, expiresAt }, at("12:00:59"))).toBe(false);
    expect(isAttemptAbandoned({ submittedAt: null, expiresAt }, at("12:01:01"))).toBe(true);
  });

  it("never treats a submitted attempt as open or abandoned", () => {
    const submittedAt = at("11:30:00");
    expect(isAttemptInProgress({ submittedAt, expiresAt }, at("11:45:00"))).toBe(false);
    expect(isAttemptAbandoned({ submittedAt, expiresAt }, at("13:00:00"))).toBe(false);
  });
});

describe("drawQuestions", () => {
  it("draws the requested number of questions", () => {
    expect(drawQuestions(bank, 3, { shuffleQuestions: true, shuffleAnswers: true })).toHaveLength(3);
  });

  it("keeps the bank order and option order when shuffling is off", () => {
    const draw = drawQuestions(bank, 4, { shuffleQuestions: false, shuffleAnswers: false });
    expect(draw.map((question) => question.questionId)).toEqual([1, 2, 3, 4]);
    expect(draw[0].options).toEqual(["A", "B", "C", "D"]);
  });

  it("records the correct answer by text, so shuffled options keep the right answer", () => {
    for (let run = 0; run < 20; run++) {
      for (const question of drawQuestions(bank, 4, { shuffleQuestions: true, shuffleAnswers: true })) {
        const source = bank.find((item) => item.id === question.questionId)!;
        expect(question.correctAnswerText).toBe(source.options[source.correctIndex]);
        expect([...question.options].sort()).toEqual([...source.options].sort());
      }
    }
  });

  it("never shuffles true/false options", () => {
    for (let run = 0; run < 20; run++) {
      const trueFalse = drawQuestions(bank, 4, { shuffleQuestions: true, shuffleAnswers: true }).find((question) => question.questionId === 2)!;
      expect(trueFalse.options).toEqual(["True", "False"]);
    }
  });
});

describe("shuffled", () => {
  it("returns a new array with the same items and leaves the input alone", () => {
    const items = [1, 2, 3, 4, 5];
    const result = shuffled(items);
    expect(result).not.toBe(items);
    expect([...result].sort()).toEqual(items);
    expect(items).toEqual([1, 2, 3, 4, 5]);
  });
});

describe("businessDate", () => {
  it("uses the Toronto calendar day for pass dates", () => {
    expect(businessDate(new Date("2026-11-09T03:30:00Z")).toISOString()).toBe("2026-11-08T00:00:00.000Z");
    expect(businessDate(new Date("2026-07-01T03:00:00Z")).toISOString()).toBe("2026-06-30T00:00:00.000Z");
    expect(businessDate(new Date("2026-11-09T05:30:00Z")).toISOString()).toBe("2026-11-09T00:00:00.000Z");
  });
});
