import { createHash } from "node:crypto";

import { APIError } from "better-auth/api";
import { describe, expect, it } from "vitest";
import { loginFailureStatus, validateForgotPasswordEmail, validateLoginForm, validateResetPassword } from "@/lib/helpers/auth";
import { isLegacyMd5Hash, verifyLegacyMd5 } from "@/lib/helpers/legacy-password";
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
