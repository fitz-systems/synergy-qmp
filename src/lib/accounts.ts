import { prisma } from "@/lib/prisma";

export async function hasPassword(userId: number) {
  const account = await prisma.account.findFirst({ where: { userId, providerId: "credential", password: { not: null } }, select: { id: true } });
  return account !== null;
}
