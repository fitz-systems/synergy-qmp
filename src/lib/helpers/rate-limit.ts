import { createHash } from "node:crypto";
import { clientIpHeaders, unknownClientIp } from "@/constants/auth";
import type { RateLimitAction, RateLimitScope } from "@/types/auth";

export function clientIp(requestHeaders: Headers) {
  for (const name of clientIpHeaders) {
    const value = requestHeaders.get(name)?.split(",")[0]?.trim();
    if (value) return value;
  }
  return unknownClientIp;
}

export function rateLimitKey(action: RateLimitAction, scope: RateLimitScope, value: string) {
  const digest = createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
  return `${action}:${scope}:${digest}`;
}
