import { adminFilterAll, adminSearchParam, companyListFilterParam, noDistributorValue, seatAdjustmentLimit } from "@/constants/admin";
import type { AdminCompanyListQuery, AdminCompanyRecord, AdminCompanyRow, AdminDistributorRecord, AdminDistributorRow, AdminSearchParams, CompanyFormState, CompanyFormValues, DistributorFormState, DistributorFormValues, SeatAdjustment, StatusTone } from "@/types/admin";
import { changeDetails, pageParam, positiveIdOf, searchParamValue } from "./admin";
import { readFormString } from "./forms";

interface SeatHolder {
  companyId: number | null;
  seatDistributorId: number | null;
  companyDistributorId: number | null;
}

interface SeatTarget {
  companyId: number | null;
  distributorId: number | null;
}

export function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function nameKey(value: string) {
  return normalizeName(value).toLowerCase();
}

export function seatCountLabel(count: number) {
  const value = count.toLocaleString("en-CA");
  return `${value} ${Math.abs(count) === 1 ? "seat" : "seats"}`;
}

export function seatsLeftLabel(balance: number) {
  return balance < 0 ? `${seatCountLabel(-balance)} over` : `${seatCountLabel(balance)} left`;
}

export function seatBalanceTone(balance: number): StatusTone {
  if (balance < 0) return "danger";
  return balance === 0 ? "warning" : "success";
}

export function seatMove(current: SeatHolder | null, next: SeatTarget) {
  if (!current) return { charge: next.distributorId, refund: null, moved: true }
  if (current.companyId === next.companyId) return { charge: null, refund: null, moved: false }
  const previous = current.seatDistributorId ?? current.companyDistributorId;
  if (previous === next.distributorId) return { charge: null, refund: null, moved: false }
  return { charge: next.distributorId, refund: current.seatDistributorId, moved: true }
}

export function distributorDeleteDescription(companyCount: number) {
  const companies = companyCount === 0 ? "" : `${companyCount === 1 ? "Its company is" : `Its ${companyCount.toLocaleString("en-CA")} companies are`} kept but left without a distributor. `;
  return `${companies}Its seat balance is lost, and students who used its seats no longer show a seat. Students and their companies aren't otherwise changed.`;
}

export function adminDistributorRow(record: AdminDistributorRecord): AdminDistributorRow {
  return {
    id: record.id,
    name: record.name,
    seatBalance: record.seatBalance,
    companyCount: record._count.companies,
    seatsUsed: record._count.enrollments
  }
}

export function adminCompanyRow(record: AdminCompanyRecord): AdminCompanyRow {
  return {
    id: record.id,
    name: record.name,
    distributorId: record.distributorId,
    distributor: record.distributor?.name ?? null,
    studentCount: record._count.enrollments
  }
}

export function initialDistributorFormState(distributor?: { name: string; notes: string }): DistributorFormState {
  return { status: "idle", values: { name: distributor?.name ?? "", seats: "0", notes: distributor?.notes ?? "" }, errors: {} }
}

export function readDistributorForm(formData: FormData): DistributorFormValues {
  return {
    name: normalizeName(readFormString(formData, "name")),
    seats: readFormString(formData, "seats") || "0",
    notes: readFormString(formData, "notes")
  }
}

export function seatAmountOf(value: string, adjustment: SeatAdjustment) {
  if (!/^-?\d{1,6}$/.test(value.trim())) return null;
  const amount = Number(value);
  if (Math.abs(amount) > seatAdjustmentLimit) return null;
  if (adjustment === "add" && amount < 1) return null;
  return amount;
}

export function validateDistributorForm(values: DistributorFormValues, creating: boolean): DistributorFormState["errors"] {
  const errors: DistributorFormState["errors"] = {}
  if (!values.name) errors.name = "Enter the distributor's name.";
  if (creating && seatAmountOf(values.seats, "set") === null) errors.seats = `Enter a whole number from -${seatAdjustmentLimit.toLocaleString("en-CA")} to ${seatAdjustmentLimit.toLocaleString("en-CA")}.`;
  return errors;
}

export function distributorChanges(before: { name: string; notes: string | null }, values: DistributorFormValues) {
  const changes: [boolean, string][] = [
    [before.name !== values.name, `name to ${values.name}`],
    [(before.notes ?? "") !== values.notes, "notes"]
  ];
  return changeDetails(changes.filter(([changed]) => changed).map(([, label]) => label));
}

export function seatAdjustmentDetails(adjustment: SeatAdjustment, amount: number, before: number, after: number, note: string) {
  const change = adjustment === "add" ? `Added ${seatCountLabel(amount)}` : `Set balance to ${seatCountLabel(amount)}`;
  return [`${change} (was ${before.toLocaleString("en-CA")}, now ${after.toLocaleString("en-CA")})`, note].filter(Boolean).join(" · ");
}

export function initialCompanyFormState(company?: { name: string; distributorId: number | null }, distributorId?: number): CompanyFormState {
  const selected = company ? company.distributorId : distributorId;
  return { status: "idle", values: { name: company?.name ?? "", distributor: selected ? String(selected) : noDistributorValue }, errors: {} }
}

export function readCompanyForm(formData: FormData): CompanyFormValues {
  return {
    name: normalizeName(readFormString(formData, "name")),
    distributor: readFormString(formData, "distributor") || noDistributorValue
  }
}

export function companyDistributorId(values: CompanyFormValues) {
  return values.distributor === noDistributorValue ? null : positiveIdOf(values.distributor) ?? null;
}

export function validateCompanyForm(values: CompanyFormValues): CompanyFormState["errors"] {
  const errors: CompanyFormState["errors"] = {}
  if (!values.name) errors.name = "Enter the company name.";
  if (values.distributor !== noDistributorValue && positiveIdOf(values.distributor) === undefined) errors.distributor = "Choose a distributor.";
  return errors;
}

export function parseCompanyListQuery(params: AdminSearchParams): AdminCompanyListQuery {
  const distributor = searchParamValue(params, companyListFilterParam);
  return {
    search: searchParamValue(params, adminSearchParam),
    distributor: distributor === noDistributorValue ? noDistributorValue : positiveIdOf(distributor),
    page: pageParam(params)
  }
}

export function companyListFilterValues(query: AdminCompanyListQuery): Record<string, string> {
  return { [adminSearchParam]: query.search, [companyListFilterParam]: query.distributor ? String(query.distributor) : adminFilterAll }
}
