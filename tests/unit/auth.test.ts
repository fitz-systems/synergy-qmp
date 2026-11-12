import { createHash } from "node:crypto";

import { APIError } from "better-auth/api";
import { describe, expect, it } from "vitest";
import { loginFailureStatus, setPasswordCopy, validateForgotPasswordEmail, validateLoginForm, validateResetPassword, welcomeLinkUrl } from "@/lib/helpers/auth";
import { isLegacyMd5Hash, verifyLegacyMd5 } from "@/lib/helpers/legacy-password";
import { resetLinkLocale } from "@/lib/helpers/locale";
import { clientIp, rateLimitKey } from "@/lib/helpers/rate-limit";

const md5 = (value: string) => createHash("md5").update(value).digest("hex");

describe("legacy MD5 passwords", () => {
  it("recognises the old 32 character hashes, in either case", () => {
    expect(isLegacyMd5Hash(md5("secret"))).toBe(true);
    expect(isLegacyMd5Hash(md5("secret").toUpperCase())).toBe(true);
  });

  it("does not mistake a modern scrypt hash for MD5", () => {
    expect(isLegacyMd5Hash("a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6:0123456789abcdef")).toBe(false);
  });

  it("accepts only the matching password", () => {
    const hash = md5("Tr@nsport7");
    expect(verifyLegacyMd5(hash, "Tr@nsport7")).toBe(true);
    expect(verifyLegacyMd5(hash, "tr@nsport7")).toBe(false);
    expect(verifyLegacyMd5(hash, "")).toBe(false);
  });
});

describe("validateLoginForm", () => {
  it("requires both fields", () => {
    expect(validateLoginForm({ email: "", password: "", rememberMe: true })).toEqual({ email: "required", password: "required" });
  });

  it("rejects a malformed email", () => {
    expect(validateLoginForm({ email: "not-an-email", password: "x", rememberMe: false })).toEqual({ email: "invalidEmail" });
  });

  it("accepts a complete form", () => {
    expect(validateLoginForm({ email: "jane@example.com", password: "x", rememberMe: false })).toEqual({});
  });
});

describe("loginFailureStatus", () => {
  it("maps Better Auth errors to the messages students see", () => {
    expect(loginFailureStatus(new APIError("UNAUTHORIZED"))).toBe("invalidCredentials");
    expect(loginFailureStatus(new APIError("FORBIDDEN"))).toBe("deactivated");
    expect(loginFailureStatus(new APIError("TOO_MANY_REQUESTS"))).toBe("rateLimited");
  });

  it("falls back to a generic failure for anything else", () => {
    expect(loginFailureStatus(new APIError("INTERNAL_SERVER_ERROR"))).toBe("failed");
    expect(loginFailureStatus(new Error("database down"))).toBe("failed");
  });
});

describe("password reset validation", () => {
  it("requires an email address that looks valid", () => {
    expect(validateForgotPasswordEmail("")).toBe("required");
    expect(validateForgotPasswordEmail("jane@")).toBe("invalidEmail");
    expect(validateForgotPasswordEmail("jane@example.com")).toBeUndefined();
  });

  it("enforces the minimum length and a matching confirmation", () => {
    expect(validateResetPassword({ password: "short", confirm: "short" })).toEqual({ password: "tooShort" });
    expect(validateResetPassword({ password: "long-enough", confirm: "different" })).toEqual({ confirm: "mismatch" });
    expect(validateResetPassword({ password: "long-enough", confirm: "long-enough" })).toEqual({});
  });
});

describe("rate limit keys", () => {
  it("reads the client IP from the platform headers", () => {
    expect(clientIp(new Headers({ "x-real-ip": "203.0.113.5", "x-forwarded-for": "198.51.100.1" }))).toBe("203.0.113.5");
    expect(clientIp(new Headers({ "x-forwarded-for": "198.51.100.1, 10.0.0.1" }))).toBe("198.51.100.1");
    expect(clientIp(new Headers())).toBe("unknown");
  });

  it("treats differently typed versions of the same email as one bucket", () => {
    expect(rateLimitKey("signIn", "email", " Jane@Example.com ")).toBe(rateLimitKey("signIn", "email", "jane@example.com"));
  });

  it("keeps actions and scopes in separate buckets", () => {
    const keys = new Set([
      rateLimitKey("signIn", "email", "jane@example.com"),
      rateLimitKey("signIn", "ip", "jane@example.com"),
      rateLimitKey("passwordReset", "email", "jane@example.com")
    ]);
    expect(keys.size).toBe(3);
  });

  it("never stores the raw email address", () => {
    expect(rateLimitKey("signIn", "email", "jane@example.com")).not.toContain("jane");
  });
});

describe("reset link language", () => {
  const link = (callback: string) => `http://localhost:3000/api/auth/reset-password/abc123?callbackURL=${encodeURIComponent(callback)}`;

  it("uses the language of the page the link opens", () => {
    expect(resetLinkLocale(link("/fr/reset-password"), { email: "a@b.c", preferredLocale: "en" })).toBe("fr");
    expect(resetLinkLocale(link("/en/reset-password"), { email: "a@b.c", preferredLocale: "fr" })).toBe("en");
  });

  it("falls back to the account's language when the link has none", () => {
    expect(resetLinkLocale("http://localhost:3000/api/auth/reset-password/abc123", { email: "a@b.c", preferredLocale: "fr" })).toBe("fr");
    expect(resetLinkLocale(link("/reset-password"), { email: "a@b.c", preferredLocale: "fr" })).toBe("fr");
  });

  it("falls back to the default language when neither is usable", () => {
    expect(resetLinkLocale(link("/de/reset-password"), { email: "a@b.c" })).toBe("en");
  });
});

describe("welcome links", () => {
  const resetLink = "http://localhost:3000/api/auth/reset-password/abc123?callbackURL=%2Ffr%2Freset-password";

  it("sends new accounts to the set-password page in their language, keeping the token", () => {
    const link = new URL(welcomeLinkUrl(resetLink, "fr"));
    expect(link.pathname).toBe("/api/auth/reset-password/abc123");
    expect(link.searchParams.get("callbackURL")).toBe("/fr/set-password");
  });

  it("swaps in the set-password wording and keeps everything else from the reset page", async () => {
    const en = (await import("@/i18n/dictionaries/en.json")).default;
    const copy = setPasswordCopy(en.resetPasswordPage, en.setPasswordPage);
    expect(copy.title).toBe(en.setPasswordPage.title);
    expect(copy.expired.body).toContain("7 days");
    expect(copy.expired.action).toBe(en.resetPasswordPage.expired.action);
    expect(copy.fields).toEqual(en.resetPasswordPage.fields);
  });
});
