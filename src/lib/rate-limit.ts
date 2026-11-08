import { headers } from "next/headers";
import { after } from "next/server";
import { rateLimitRetentionSeconds, rateLimitRules } from "@/constants/auth";
import { clientIp, rateLimitKey } from "@/lib/helpers/rate-limit";
import { prisma } from "@/lib/prisma";
import type { RateLimitAction, RateLimitRule } from "@/types/auth";

async function consumeBucket(key: string, { max, windowSeconds }: RateLimitRule) {
  const [bucket] = await prisma.$queryRaw<{ count: number }[]>`
    INSERT INTO "synergy"."rate_limit_buckets" AS bucket ("key", "count", "window_start")
    VALUES (${key}, 1, now())
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN bucket."window_start" <= now() - make_interval(secs => ${windowSeconds}) THEN 1 ELSE bucket."count" + 1 END,
      "window_start" = CASE WHEN bucket."window_start" <= now() - make_interval(secs => ${windowSeconds}) THEN now() ELSE bucket."window_start" END
    RETURNING "count"
  `;
  return bucket.count <= max;
}

async function pruneBuckets() {
  await prisma.rateLimitBucket.deleteMany({ where: { windowStart: { lt: new Date(Date.now() - rateLimitRetentionSeconds * 1000) } } });
}

export async function consumeRateLimit(action: RateLimitAction, email: string) {
  const ip = clientIp(await headers());
  const results = await Promise.all(rateLimitRules[action].map((rule) => consumeBucket(rateLimitKey(action, rule.scope, rule.scope === "ip" ? ip : email), rule)));
  after(pruneBuckets);
  return results.every(Boolean);
}
