import { describe, expect, it } from "vitest";
import { formatAdminDate, formatAdminTimestampDate } from "@/lib/helpers/admin";
import { formatDate, formatTimestampDate } from "@/lib/helpers/format";

const eveningInToronto = "2026-11-12T02:05:00.000Z";

describe("timestamp dates", () => {
  it("show the Toronto calendar day for an evening timestamp", () => {
    expect(formatTimestampDate("en", eveningInToronto)).toBe("November 11, 2026");
    expect(formatTimestampDate("fr", eveningInToronto)).toBe("11 novembre 2026");
    expect(formatAdminTimestampDate(eveningInToronto)).toBe("Nov 11, 2026");
  });

  it("leave date-only values on the day they were stored", () => {
    expect(formatDate("en", "2026-11-11T00:00:00.000Z")).toBe("November 11, 2026");
    expect(formatAdminDate("2026-11-11T00:00:00.000Z")).toBe("Nov 11, 2026");
  });
});
