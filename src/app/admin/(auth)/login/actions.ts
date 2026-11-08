"use server";

import { redirect } from "next/navigation";
import { adminRoutes } from "@/constants/admin";
import { loginFailureState, loginFailureStatus, readLoginForm, validateLoginForm } from "@/lib/helpers/auth";
import { consumeRateLimit } from "@/lib/rate-limit";
import { isAdminEmail, signInWithEmail } from "@/lib/session";
import type { LoginFormState } from "@/types/auth";

export async function submitAdminLogin(_previous: LoginFormState, formData: FormData): Promise<LoginFormState> {
  const credentials = readLoginForm(formData);
  const errors = validateLoginForm(credentials);
  if (Object.keys(errors).length > 0) return loginFailureState(credentials, "invalid", errors);
  if (!(await consumeRateLimit("signIn", credentials.email))) return loginFailureState(credentials, "rateLimited");

  if (!(await isAdminEmail(credentials.email))) return loginFailureState(credentials, "invalidCredentials");

  try {
    await signInWithEmail(credentials);
  } catch (error) {
    return loginFailureState(credentials, loginFailureStatus(error));
  }

  redirect(adminRoutes.dashboard);
}
