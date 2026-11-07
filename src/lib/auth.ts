import { createHash, timingSafeEqual } from "node:crypto";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { hashPassword, verifyPassword } from "better-auth/crypto";
import { nextCookies } from "better-auth/next-js";
import { passwordMinLength, passwordResetTokenSeconds } from "@/constants/auth";
import { sendPasswordResetEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

const LEGACY_MD5 = /^[a-f0-9]{32}$/i;

function verifyLegacyMd5(hash: string, password: string) {
  const candidate = createHash("md5").update(password).digest();
  return timingSafeEqual(candidate, Buffer.from(hash, "hex"));
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
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
        if (LEGACY_MD5.test(hash)) {
          return verifyLegacyMd5(hash, password);
        }
        return verifyPassword({ hash, password });
      }
    },
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail(user, url);
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
      if (account?.password && LEGACY_MD5.test(account.password)) {
        await prisma.account.update({
          where: { id: account.id },
          data: { password: await hashPassword(ctx.body.password) }
        });
      }
    })
  },
  plugins: [nextCookies()]
})
