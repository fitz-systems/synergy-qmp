import { describe, expect, it } from "vitest";
import { isUnknownCoursePath } from "@/lib/helpers/routes";

describe("unknown course paths", () => {
  it("flags course pages whose code isn't a real course", () => {
    expect(isUnknownCoursePath("/en/courses/bogus")).toBe(true);
    expect(isUnknownCoursePath("/fr/courses/Ground")).toBe(true);
  });

  it("leaves real courses, the course list and other pages alone", () => {
    expect(isUnknownCoursePath("/en/courses/ground")).toBe(false);
    expect(isUnknownCoursePath("/fr/courses/air")).toBe(false);
    expect(isUnknownCoursePath("/en/courses")).toBe(false);
    expect(isUnknownCoursePath("/en/about")).toBe(false);
    expect(isUnknownCoursePath("/admin/courses/bogus")).toBe(false);
  });
});
