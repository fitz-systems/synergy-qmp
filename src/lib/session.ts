import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import type { LoginCredentials } from "@/types/auth";

export async function signInWithEmail({ email, password, rememberMe }: LoginCredentials) {
  await auth.api.signInEmail({ body: { email, password, rememberMe }, headers: await headers() });
}
