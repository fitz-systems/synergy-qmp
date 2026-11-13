import { describe, expect, it } from "vitest";
import { companyMatchesDistributor, dashboardEnrollmentWhere, dashboardUsersHref, parseDashboardQuery } from "@/lib/helpers/admin";

describe("dashboard filters", () => {
  it("reads a distributor and company from the URL", () => {
    expect(parseDashboardQuery({ distributor: "3", company: "12" })).toEqual({ distributor: 3, company: 12 });
  });

  it("accepts the no distributor option and ignores bad ids", () => {
    expect(parseDashboardQuery({ distributor: "none", company: "abc" })).toEqual({ distributor: "none", company: undefined });
  });

  it("matches companies to the chosen distributor", () => {
    const company = { id: 1, name: "Acme", distributorId: 3 }
    const direct = { id: 2, name: "Bolt", distributorId: null }
    expect(companyMatchesDistributor(company, "all")).toBe(true);
    expect(companyMatchesDistributor(company, "3")).toBe(true);
    expect(companyMatchesDistributor(company, "4")).toBe(false);
    expect(companyMatchesDistributor(direct, "none")).toBe(true);
    expect(companyMatchesDistributor(company, "none")).toBe(false);
  });

  it("scopes enrollments by company and distributor", () => {
    expect(dashboardEnrollmentWhere({})).toEqual({ AND: [] });
    expect(dashboardEnrollmentWhere({ distributor: 3, company: 12 })).toEqual({ AND: [{ organizationId: 12 }, { organization: { distributorId: 3 } }] });
    expect(dashboardEnrollmentWhere({ distributor: "none" })).toEqual({ AND: [{ OR: [{ organizationId: null }, { organization: { distributorId: null } }] }] });
  });

  it("links to the users list with the same filters", () => {
    expect(dashboardUsersHref({ distributor: 3, company: 12 })).toBe("/admin/users?distributor=3&company=12");
    expect(dashboardUsersHref({ distributor: "none" })).toBe("/admin/users");
  });
});
