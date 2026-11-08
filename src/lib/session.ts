import { cacheLife } from "next/cache";
import { headers } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { cache } from "react";
import { adminRoutes } from "@/constants/admin";
import { adminRole, sessionShellStaleSeconds } from "@/constants/auth";
import type { Locale } from "@/i18n/config";
import { getLocale } from "@/i18n/dictionaries";
import { auth } from "@/lib/auth";
import { sessionUser } from "@/lib/helpers/auth";
import { localizedHref } from "@/lib/helpers/routes";
import { prisma } from "@/lib/prisma";
import type { LoginCredentials, SessionUser } from "@/types/auth";

export async function signInWithEmail({ email, password, rememberMe }: LoginCredentials) {
  await auth.api.signInEmail({ body: { email, password, rememberMe }, headers: await headers() });
}

export async function signOut() {
  await auth.api.signOut({ headers: await headers() });
}

export async function requestPasswordResetLink(email: string, locale: Locale) {
  await auth.api.requestPasswordReset({ body: { email, redirectTo: localizedHref(locale, "resetPassword") }, headers: await headers() });
}

export async function resetPasswordWithToken(token: string, newPassword: string) {
  await auth.api.resetPassword({ body: { token, newPassword }, headers: await headers() });
}

async function readSessionUser(): Promise<SessionUser | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user.active ? sessionUser(session.user) : null;
}

export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  await connection();
  return readSessionUser();
});

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect(localizedHref(await getLocale(), "login"));
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (user?.role !== adminRole) redirect(adminRoutes.login);
  return user;
}

export async function requireAdminShell(): Promise<SessionUser> {
  "use cache: private";
  cacheLife({ stale: sessionShellStaleSeconds });
  const user = await readSessionUser();
  if (user?.role !== adminRole) redirect(adminRoutes.login);
  return user;
}

export async function isAdminEmail(email: string) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() }, select: { role: true } });
  return user?.role === adminRole;
}
