import { adminPageSize, auditLogSelect } from "@/constants/admin";
import type { Prisma } from "@/generated/prisma/client";
import { auditActionsMatching, auditEntry, pageCount } from "@/lib/helpers/admin";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import type { AuditLogPage, AuditLogQuery } from "@/types/admin";

function auditLogWhere(query: AuditLogQuery): Prisma.AuditLogWhereInput {
  const where: Prisma.AuditLogWhereInput = {}
  if (query.entity) where.entity = query.entity;
  if (query.search) {
    const contains = { contains: query.search, mode: "insensitive" } as const;
    where.OR = [
      { entityLabel: contains },
      { details: contains },
      { action: { in: auditActionsMatching(query.search) } },
      { admin: { OR: [{ firstName: contains }, { lastName: contains }, { email: contains }] } }
    ];
  }
  return where;
}

export async function getAuditLogPage(query: AuditLogQuery): Promise<AuditLogPage> {
  await requireAdmin();
  const where = auditLogWhere(query);
  const total = await prisma.auditLog.count({ where });
  const pages = pageCount(total, adminPageSize);
  const page = Math.min(query.page, pages);
  const offset = (page - 1) * adminPageSize;
  const records = await prisma.auditLog.findMany({ where, orderBy: [{ createdAt: "desc" }, { id: "desc" }], skip: offset, take: adminPageSize, select: auditLogSelect });

  return {
    rows: records.map(auditEntry),
    total,
    page,
    pageCount: pages,
    from: total === 0 ? 0 : offset + 1,
    to: offset + records.length
  }
}
