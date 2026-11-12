import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { hashPassword, verifyPassword } from "better-auth/crypto";
import { nextCookies } from "better-auth/next-js";
import { disabledAuthPaths, passwordMinLength, passwordResetTokenSeconds, resetTokenPrefix, welcomeTokenSeconds } from "@/constants/auth";
import { hasPassword } from "@/lib/accounts";
import { sendPasswordResetEmail, sendWelcomeEmail } from "@/lib/email";
import { welcomeLinkUrl } from "@/lib/helpers/auth";
import { isLegacyMd5Hash, verifyLegacyMd5 } from "@/lib/helpers/legacy-password";
import { resetLinkLocale } from "@/lib/helpers/locale";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  disabledPaths: disabledAuthPaths,
  advanced: {
    database: {
      generateId: "serial"
    }
  },
  user: {
    additionalFields: {
      firstName: { type: "string", required: true },
      lastName: { type: "string", required: true },
      preferredLocale: { type: "string", required: false, defaultValue: "en" },
      role: { type: "string", required: false, defaultValue: "student", input: false },
      active: { type: "boolean", required: false, defaultValue: true, input: false }
    }
  },
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: passwordMinLength,
    resetPasswordTokenExpiresIn: passwordResetTokenSeconds,
    revokeSessionsOnPasswordReset: true,
    password: {
      hash: hashPassword,
      verify: async ({ hash, password }) => {
        if (isLegacyMd5Hash(hash)) {
          return verifyLegacyMd5(hash, password);
        }
        return verifyPassword({ hash, password });
      }
    },
    sendResetPassword: async ({ user, url, token }) => {
      const locale = resetLinkLocale(url, user);
      if (await hasPassword(Number(user.id))) {
        await sendPasswordResetEmail(user, url, locale);
        return;
      }
      await prisma.verification.updateMany({ where: { identifier: `${resetTokenPrefix}${token}` }, data: { expiresAt: new Date(Date.now() + welcomeTokenSeconds * 1000) } });
      await sendWelcomeEmail(user, welcomeLinkUrl(url, locale), locale);
    }
  },
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const user = await prisma.user.findUnique({
            where: { id: Number(session.userId) },
            select: { active: true }
          });
          if (!user?.active) {
            throw new APIError("FORBIDDEN", { message: "This account has been deactivated." });
          }
        }
      }
    }
  },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      const newSession = ctx.context.newSession;
      if (ctx.path !== "/sign-in/email" || !newSession) {
        return;
      }
      const account = await prisma.account.findFirst({
        where: { userId: Number(newSession.user.id), providerId: "credential" },
        select: { id: true, password: true }
      });
      if (account?.password && isLegacyMd5Hash(account.password)) {
        await prisma.account.update({
          where: { id: account.id },
          data: { password: await hashPassword(ctx.body.password) }
        });
      }
    })
  },
  plugins: [nextCookies()]
})
