import { describe, expect, it } from "vitest";
import { csvLine, parseCsv } from "@/lib/helpers/csv";

describe("parseCsv", () => {
  it("reads quoted fields with commas, quotes and line breaks", () => {
    const text = 'prompt,option_a\r\n"Which class, if any?","He said ""yes""\nthen left"\r\n';
    expect(parseCsv(text)).toEqual([
      ["prompt", "option_a"],
      ["Which class, if any?", 'He said "yes"\nthen left']
    ]);
  });

  it("detects semicolon files exported by French Excel", () => {
    expect(parseCsv("prénom;nom\nHélène;Côté")).toEqual([["prénom", "nom"], ["Hélène", "Côté"]]);
  });

  it("ignores a byte order mark", () => {
    expect(parseCsv("﻿email\njane@example.com")).toEqual([["email"], ["jane@example.com"]]);
  });

  it("keeps empty trailing fields", () => {
    expect(parseCsv("a,b,c\n1,,\n")).toEqual([["a", "b", "c"], ["1", "", ""]]);
  });
});

describe("csvLine", () => {
  it("round-trips through parseCsv", () => {
    const values = ["plain", "with, comma", 'with "quotes"', "line\nbreak"];
    expect(parseCsv(csvLine(values))).toEqual([values]);
  });
});
