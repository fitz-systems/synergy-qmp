import { createHash, timingSafeEqual } from "node:crypto";
import { legacyMd5Pattern } from "@/constants/legacy-migration";

export function isLegacyMd5Hash(hash: string) {
  return legacyMd5Pattern.test(hash);
}

export function verifyLegacyMd5(hash: string, password: string) {
  const candidate = createHash("md5").update(password).digest();
  return timingSafeEqual(candidate, Buffer.from(hash, "hex"));
}
