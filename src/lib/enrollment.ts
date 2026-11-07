import { cache } from "react";
import { studentEnrollmentSelect } from "@/constants/student";
import { finishAbandonedAttempts } from "@/lib/attempts";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

function findLatestEnrollment(userId: number) {
  return prisma.enrollment.findFirst({
    where: { userId },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: studentEnrollmentSelect
  });
}

export async function loadCurrentEnrollment(userId: number) {
  const record = await findLatestEnrollment(userId);
  if (record && await finishAbandonedAttempts(record, new Date())) return findLatestEnrollment(userId);
  return record;
}

export const getCurrentEnrollment = cache(async () => {
  const user = await requireUser();
  return loadCurrentEnrollment(user.id);
});
