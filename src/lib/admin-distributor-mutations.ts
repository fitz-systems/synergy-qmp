import { companyActionMessages, distributorActionMessages } from "@/constants/admin";
import type { Prisma } from "@/generated/prisma/client";
import { recordAudit } from "@/lib/audit";
import { distributorChanges, nameKey, seatAdjustmentDetails, seatCountLabel, seatsLeftLabel } from "@/lib/helpers/admin-distributors";
import { prisma } from "@/lib/prisma";
import type { AdminActionResult, CompanyCreateResult, CompanyFormState, DistributorFormState, DistributorFormValues, SeatAdjustment } from "@/types/admin";

type SaveResult<Field extends string> = { id: number } | { errors: Partial<Record<Field, string>> } | null;

interface SeatMove {
  charge: number | null;
  refund: number | null;
}

export async function applySeatMove(tx: Prisma.TransactionClient, move: SeatMove) {
  const details: string[] = [];
  if (move.refund !== null) {
    const refunded = await tx.distributor.update({ where: { id: move.refund }, data: { seatBalance: { increment: 1 } }, select: { name: true } });
    details.push(`returned a seat to ${refunded.name}`);
  }
  if (move.charge !== null) {
    const charged = await tx.distributor.update({ where: { id: move.charge }, data: { seatBalance: { decrement: 1 } }, select: { name: true, seatBalance: true } });
    details.push(`used a seat from ${charged.name} (${seatsLeftLabel(charged.seatBalance)})`);
  }
  return details;
}

export async function chargeSeats(tx: Prisma.TransactionClient, counts: Map<number, number>) {
  const details: string[] = [];
  for (const [id, count] of counts) {
    const charged = await tx.distributor.update({ where: { id }, data: { seatBalance: { decrement: count } }, select: { name: true, seatBalance: true } });
    details.push(`${charged.name} used ${seatCountLabel(count)} (${seatsLeftLabel(charged.seatBalance)})`);
  }
  return details;
}

async function isDistributorNameTaken(tx: Prisma.TransactionClient, name: string, exceptId?: number) {
  const match = await tx.distributor.findFirst({ where: { name: { equals: name, mode: "insensitive" }, ...(exceptId ? { NOT: { id: exceptId } } : {}) }, select: { id: true } });
  return match !== null;
}

async function isCompanyNameTaken(tx: Prisma.TransactionClient, name: string, exceptId?: number) {
  const match = await tx.organization.findFirst({ where: { name: { equals: name, mode: "insensitive" }, ...(exceptId ? { NOT: { id: exceptId } } : {}) }, select: { id: true } });
  return match !== null;
}

export async function saveDistributor(adminId: number, distributorId: number | null, values: DistributorFormValues): Promise<SaveResult<keyof DistributorFormState["errors"]>> {
  return prisma.$transaction(async (tx) => {
    if (await isDistributorNameTaken(tx, values.name, distributorId ?? undefined)) return { errors: { name: "Another distributor already has this name." } }
    const notes = values.notes || null;

    if (distributorId === null) {
      const seatBalance = Number(values.seats);
      const created = await tx.distributor.create({ data: { name: values.name, notes, seatBalance }, select: { id: true } });
      await recordAudit(tx, { adminId, action: "distributorCreated", entity: "distributor", entityId: created.id, entityLabel: values.name, details: `Started with ${seatCountLabel(seatBalance)}` });
      return created;
    }

    const record = await tx.distributor.findUnique({ where: { id: distributorId }, select: { name: true, notes: true } });
    if (!record) return null;
    await tx.distributor.update({ where: { id: distributorId }, data: { name: values.name, notes } });
    const details = distributorChanges(record, values);
    if (details) await recordAudit(tx, { adminId, action: "distributorUpdated", entity: "distributor", entityId: distributorId, entityLabel: values.name, details });
    return { id: distributorId }
  });
}

export async function deleteDistributor(adminId: number, distributorId: number): Promise<AdminActionResult> {
  return prisma.$transaction(async (tx) => {
    const record = await tx.distributor.findUnique({ where: { id: distributorId }, select: { name: true, seatBalance: true, _count: { select: { companies: true } } } });
    if (!record) return { ok: false, error: distributorActionMessages.notFound }
    await tx.distributor.delete({ where: { id: distributorId } });
    await recordAudit(tx, { adminId, action: "distributorDeleted", entity: "distributor", entityLabel: record.name, details: `Had ${seatCountLabel(record.seatBalance)}; ${record._count.companies} ${record._count.companies === 1 ? "company" : "companies"} left without a distributor` });
    return { ok: true }
  });
}

export async function adjustSeats(adminId: number, distributorId: number, adjustment: SeatAdjustment, amount: number, note: string): Promise<AdminActionResult> {
  return prisma.$transaction(async (tx) => {
    const record = await tx.distributor.findUnique({ where: { id: distributorId }, select: { name: true, seatBalance: true } });
    if (!record) return { ok: false, error: distributorActionMessages.notFound }
    const updated = await tx.distributor.update({
      where: { id: distributorId },
      data: { seatBalance: adjustment === "add" ? { increment: amount } : amount },
      select: { seatBalance: true }
    });
    const before = adjustment === "add" ? updated.seatBalance - amount : record.seatBalance;
    await recordAudit(tx, {
      adminId,
      action: adjustment === "add" ? "seatsAdded" : "seatBalanceSet",
      entity: "distributor",
      entityId: distributorId,
      entityLabel: record.name,
      details: seatAdjustmentDetails(adjustment, amount, before, updated.seatBalance, note)
    });
    return { ok: true, message: `${record.name} now has ${seatsLeftLabel(updated.seatBalance)}.` }
  });
}

async function distributorName(tx: Prisma.TransactionClient, distributorId: number | null) {
  if (distributorId === null) return null;
  const record = await tx.distributor.findUnique({ where: { id: distributorId }, select: { name: true } });
  return record?.name;
}

export async function saveCompany(adminId: number, companyId: number | null, name: string, distributorId: number | null): Promise<SaveResult<keyof CompanyFormState["errors"]>> {
  return prisma.$transaction(async (tx) => {
    if (await isCompanyNameTaken(tx, name, companyId ?? undefined)) return { errors: { name: companyActionMessages.nameTaken } }
    const distributor = await distributorName(tx, distributorId);
    if (distributor === undefined) return { errors: { distributor: companyActionMessages.distributorMissing } }

    if (companyId === null) {
      const created = await tx.organization.create({ data: { name, distributorId }, select: { id: true } });
      await recordAudit(tx, { adminId, action: "companyCreated", entity: "company", entityId: created.id, entityLabel: name, details: distributor ? `Under ${distributor}` : "No distributor" });
      return created;
    }

    const record = await tx.organization.findUnique({ where: { id: companyId }, select: { name: true, distributorId: true } });
    if (!record) return null;
    await tx.organization.update({ where: { id: companyId }, data: { name, distributorId } });
    const changes = [
      record.name !== name ? `renamed from ${record.name}` : "",
      record.distributorId !== distributorId ? (distributor ? `moved to ${distributor}` : "removed from its distributor") : ""
    ].filter(Boolean);
    if (changes.length > 0) await recordAudit(tx, { adminId, action: "companyUpdated", entity: "company", entityId: companyId, entityLabel: name, details: changes.join("; ").replace(/^./, (char) => char.toUpperCase()) });
    return { id: companyId }
  });
}

export async function createCompanyQuick(adminId: number, name: string, distributorId: number | null): Promise<CompanyCreateResult> {
  const result = await saveCompany(adminId, null, name, distributorId);
  if (!result) return { ok: false, error: companyActionMessages.failed }
  if ("errors" in result) return { ok: false, error: result.errors.name ?? result.errors.distributor ?? companyActionMessages.failed }
  return { ok: true, company: { id: result.id, name, distributorId } }
}

export async function deleteCompany(adminId: number, companyId: number): Promise<AdminActionResult> {
  return prisma.$transaction(async (tx) => {
    const record = await tx.organization.findUnique({ where: { id: companyId }, select: { name: true, _count: { select: { enrollments: true } } } });
    if (!record) return { ok: false, error: companyActionMessages.notFound }
    if (record._count.enrollments > 0) return { ok: false, error: companyActionMessages.hasStudents }
    await tx.organization.delete({ where: { id: companyId } });
    await recordAudit(tx, { adminId, action: "companyDeleted", entity: "company", entityLabel: record.name });
    return { ok: true }
  });
}

export async function mergeCompany(adminId: number, sourceId: number, targetId: number): Promise<AdminActionResult & { targetId?: number }> {
  if (sourceId === targetId) return { ok: false, error: companyActionMessages.mergeTarget }
  return prisma.$transaction(async (tx) => {
    const source = await tx.organization.findUnique({ where: { id: sourceId }, select: { name: true } });
    const target = await tx.organization.findUnique({ where: { id: targetId }, select: { name: true } });
    if (!source) return { ok: false, error: companyActionMessages.notFound }
    if (!target) return { ok: false, error: companyActionMessages.mergeTarget }
    const { count } = await tx.enrollment.updateMany({ where: { organizationId: sourceId }, data: { organizationId: targetId } });
    await tx.organization.delete({ where: { id: sourceId } });
    await recordAudit(tx, { adminId, action: "companiesMerged", entity: "company", entityId: targetId, entityLabel: target.name, details: `Merged ${source.name} into this company; moved ${count} ${count === 1 ? "enrollment" : "enrollments"}. Seats already used weren't changed.` });
    return { ok: true, targetId }
  });
}

export async function createCompanies(adminId: number, names: string[]): Promise<AdminActionResult> {
  return prisma.$transaction(async (tx) => {
    const unique = [...new Map(names.map((name) => [nameKey(name), name])).values()];
    const existing = await tx.organization.findMany({ where: { OR: unique.map((name) => ({ name: { equals: name, mode: "insensitive" as const } })) }, select: { name: true } });
    const known = new Set(existing.map((company) => nameKey(company.name)));
    const missing = unique.filter((name) => !known.has(nameKey(name)));
    if (missing.length === 0) return { ok: true }
    await tx.organization.createMany({ data: missing.map((name) => ({ name })), skipDuplicates: true });
    const label = `${missing.length} ${missing.length === 1 ? "company" : "companies"}`;
    await recordAudit(tx, { adminId, action: "companiesImported", entity: "company", entityLabel: label, details: missing.join(", ").slice(0, 1000) });
    return { ok: true, message: `Added ${label}. They have no distributor yet.` }
  });
}
