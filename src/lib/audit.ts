import type { Prisma } from "@/generated/prisma/client";
import type { AuditInput } from "@/types/admin";

export async function recordAudit(tx: Prisma.TransactionClient, { adminId, action, entity, entityId, entityLabel, details }: AuditInput) {
  await tx.auditLog.create({ data: { adminId, action, entity, entityId: entityId === undefined ? null : String(entityId), entityLabel, details } });
}
