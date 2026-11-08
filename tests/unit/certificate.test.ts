import { describe, expect, it } from "vitest";
import { addMonths, certificateNumber, pdfSafeText } from "@/lib/helpers/certificate";

describe("certificateNumber", () => {
  it("uses the pass year and a zero-padded enrollment id", () => {
    expect(certificateNumber(42, new Date("2026-03-15T00:00:00Z"))).toBe("SQMP-C2026-000042");
    expect(certificateNumber(1234567, new Date("2019-12-31T00:00:00Z"))).toBe("SQMP-C2019-1234567");
  });
});

describe("addMonths", () => {
  it("adds the validity period for ground (36 months) and air (24 months)", () => {
    const passed = new Date("2026-03-15T00:00:00Z");
    expect(addMonths(passed, 36).toISOString()).toBe("2029-03-15T00:00:00.000Z");
    expect(addMonths(passed, 24).toISOString()).toBe("2028-03-15T00:00:00.000Z");
  });

  it("does not change the date it was given", () => {
    const passed = new Date("2026-03-15T00:00:00Z");
    addMonths(passed, 12);
    expect(passed.toISOString()).toBe("2026-03-15T00:00:00.000Z");
  });
});

describe("pdfSafeText", () => {
  it("keeps French accents the PDF font can draw", () => {
    expect(pdfSafeText("Hélène Côté-Lefèbvre")).toBe("Hélène Côté-Lefèbvre");
  });

  it("replaces letters outside the PDF font with close equivalents", () => {
    expect(pdfSafeText("Łukasz")).toBe("Lukasz");
    expect(pdfSafeText("Đorđe")).toBe("Dorde");
  });

  it("falls back to a question mark instead of crashing the PDF", () => {
    expect(pdfSafeText("李")).toBe("?");
  });
});
