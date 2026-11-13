import { adminCompanySelect, adminDistributorSelect, adminPageSize, auditLogSelect, distributorHistoryLimit, distributorRecentSeatsLimit, distributorSelect, noDistributorValue } from "@/constants/admin";
import type { Prisma } from "@/generated/prisma/client";
import { auditEntry, fullName, pageCount } from "@/lib/helpers/admin";
import { adminCompanyRow, adminDistributorRow } from "@/lib/helpers/admin-distributors";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import type { AdminCompanyListQuery, AdminCompanyPage, AdminCompanyRow, AdminDistributor, AdminDistributorRow, CompanyPickerData, DistributorOption } from "@/types/admin";

export async function getDistributorOptions(): Promise<DistributorOption[]> {
  await requireAdmin();
  return prisma.distributor.findMany({ orderBy: { name: "asc" }, select: distributorSelect });
}

export async function getCompanyPickerData(): Promise<CompanyPickerData> {
  await requireAdmin();
  const [companies, distributors] = await Promise.all([
    prisma.organization.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, distributorId: true } }),
    prisma.distributor.findMany({ orderBy: { name: "asc" }, select: distributorSelect })
  ]);
  return { companies, distributors }
}

export async function getAdminDistributors(): Promise<AdminDistributorRow[]> {
  await requireAdmin();
  const records = await prisma.distributor.findMany({ orderBy: { name: "asc" }, select: adminDistributorSelect });
  return records.map(adminDistributorRow);
}

export async function getAdminDistributor(id: number): Promise<AdminDistributor | null> {
  await requireAdmin();
  if (!Number.isInteger(id) || id <= 0) return null;
  const record = await prisma.distributor.findUnique({ where: { id }, select: adminDistributorSelect });
  if (!record) return null;

  const [companies, seats, history] = await Promise.all([
    prisma.organization.findMany({ where: { distributorId: id }, orderBy: { name: "asc" }, select: adminCompanySelect }),
    prisma.enrollment.findMany({
      where: { seatDistributorId: id },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: distributorRecentSeatsLimit,
      select: { id: true, createdAt: true, user: { select: { id: true, firstName: true, lastName: true } }, organization: { select: { name: true } } }
    }),
    prisma.auditLog.findMany({ where: { entity: "distributor", entityId: String(id) }, orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: distributorHistoryLimit, select: auditLogSelect })
  ]);

  return {
    ...adminDistributorRow(record),
    notes: record.notes ?? "",
    companies: companies.map(adminCompanyRow),
    recentSeats: seats.map((seat) => ({ enrollmentId: seat.id, userId: seat.user.id, userName: fullName(seat.user), company: seat.organization?.name ?? null, enrolledOn: seat.createdAt.toISOString() })),
    history: history.map(auditEntry)
  }
}

function companyWhere(query: AdminCompanyListQuery): Prisma.OrganizationWhereInput {
  return {
    ...(query.search ? { name: { contains: query.search, mode: "insensitive" } } : {}),
    ...(query.distributor === noDistributorValue ? { distributorId: null } : query.distributor ? { distributorId: query.distributor } : {})
  }
}

export async function getAdminCompanyPage(query: AdminCompanyListQuery): Promise<AdminCompanyPage> {
  await requireAdmin();
  const where = companyWhere(query);
  const total = await prisma.organization.count({ where });
  const pages = pageCount(total, adminPageSize);
  const page = Math.min(query.page, pages);
  const offset = (page - 1) * adminPageSize;
  const records = await prisma.organization.findMany({ where, orderBy: [{ name: "asc" }, { id: "asc" }], skip: offset, take: adminPageSize, select: adminCompanySelect });

  return {
    rows: records.map(adminCompanyRow),
    total,
    page,
    pageCount: pages,
    from: total === 0 ? 0 : offset + 1,
    to: offset + records.length
  }
}

export async function getAdminCompany(id: number): Promise<AdminCompanyRow | null> {
  await requireAdmin();
  if (!Number.isInteger(id) || id <= 0) return null;
  const record = await prisma.organization.findUnique({ where: { id }, select: adminCompanySelect });
  return record ? adminCompanyRow(record) : null;
}
