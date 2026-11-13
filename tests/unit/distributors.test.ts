import { describe, expect, it } from "vitest";
import { distributorDeleteDescription, seatAmountOf, seatMove, seatsLeftLabel } from "@/lib/helpers/admin-distributors";
import { readImportTable, validateUserRecords } from "@/lib/helpers/admin-import";

const acme = 1;
const bolt = 2;

describe("seat moves", () => {
  it("charges the company's distributor for a new enrollment", () => {
    expect(seatMove(null, { companyId: 10, distributorId: acme })).toEqual({ charge: acme, refund: null, moved: true });
  });

  it("charges nothing for a new enrollment without a distributor", () => {
    expect(seatMove(null, { companyId: 10, distributorId: null })).toEqual({ charge: null, refund: null, moved: true });
  });

  it("leaves the seat alone when the company doesn't change", () => {
    expect(seatMove({ companyId: 10, seatDistributorId: null, companyDistributorId: acme }, { companyId: 10, distributorId: acme })).toEqual({ charge: null, refund: null, moved: false });
  });

  it("moves the seat when the student changes to another distributor's company", () => {
    expect(seatMove({ companyId: 10, seatDistributorId: acme, companyDistributorId: acme }, { companyId: 20, distributorId: bolt })).toEqual({ charge: bolt, refund: acme, moved: true });
  });

  it("gives the seat back when the student moves to a company without a distributor", () => {
    expect(seatMove({ companyId: 10, seatDistributorId: acme, companyDistributorId: acme }, { companyId: 20, distributorId: null })).toEqual({ charge: null, refund: acme, moved: true });
  });

  it("keeps the seat when the new company has the same distributor", () => {
    expect(seatMove({ companyId: 10, seatDistributorId: acme, companyDistributorId: acme }, { companyId: 20, distributorId: acme })).toEqual({ charge: null, refund: null, moved: false });
  });

  it("doesn't charge older students moving between companies of the same distributor", () => {
    expect(seatMove({ companyId: 10, seatDistributorId: null, companyDistributorId: acme }, { companyId: 20, distributorId: acme })).toEqual({ charge: null, refund: null, moved: false });
  });

  it("charges older students who move to a different distributor, with nothing to give back", () => {
    expect(seatMove({ companyId: 10, seatDistributorId: null, companyDistributorId: null }, { companyId: 20, distributorId: bolt })).toEqual({ charge: bolt, refund: null, moved: true });
  });
});

describe("seat amounts", () => {
  it("accepts only positive whole numbers when adding", () => {
    expect(seatAmountOf("10", "add")).toBe(10);
    expect(seatAmountOf("0", "add")).toBeNull();
    expect(seatAmountOf("-3", "add")).toBeNull();
    expect(seatAmountOf("2.5", "add")).toBeNull();
  });

  it("accepts negative balances when setting", () => {
    expect(seatAmountOf("-4", "set")).toBe(-4);
    expect(seatAmountOf("0", "set")).toBe(0);
    expect(seatAmountOf("1000000", "set")).toBeNull();
  });

  it("describes balances below zero as over", () => {
    expect(seatsLeftLabel(1)).toBe("1 seat left");
    expect(seatsLeftLabel(0)).toBe("0 seats left");
    expect(seatsLeftLabel(-3)).toBe("3 seats over");
  });
});

describe("user import companies", () => {
  const header = "first_name,last_name,email,company,course,language";
  const context = {
    existing: new Map<string, string>(),
    inactiveCourses: new Set<string>(),
    companies: new Map([["acme freight", { id: 7, distributorId: acme }]])
  }

  function importUsers(lines: string[]) {
    const { records } = readImportTable("users", [header, ...lines].join("\n"));
    return validateUserRecords(records, context);
  }

  it("matches listed companies regardless of capitals and spacing", () => {
    const result = importUsers(["Ana,Lee,ana@example.com,  ACME   Freight ,ground,en"]);
    expect(result.rows[0].company).toEqual({ id: 7, distributorId: acme });
  });

  it("skips rows with companies that aren't listed and names them once", () => {
    const result = importUsers(["Ana,Lee,ana@example.com,New Co,ground,en", "Ben,Ray,ben@example.com,new  co,air,fr"]);
    expect(result.rows).toHaveLength(0);
    expect(result.preview.every((row) => row.problem === "Company isn't in the company list")).toBe(true);
    expect(result.missingCompanies).toEqual(["New Co"]);
  });

  it("allows a blank company", () => {
    const result = importUsers(["Ana,Lee,ana@example.com,,ground,en"]);
    expect(result.rows[0].company).toBeNull();
  });
});

describe("distributor delete wording", () => {
  it("skips the company sentence when there are none", () => {
    expect(distributorDeleteDescription(0).startsWith("Its seat balance is lost")).toBe(true);
  });

  it("uses singular and plural company wording", () => {
    expect(distributorDeleteDescription(1)).toContain("Its company is kept");
    expect(distributorDeleteDescription(3)).toContain("Its 3 companies are kept");
  });
});
