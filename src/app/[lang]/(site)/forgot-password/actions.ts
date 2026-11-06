"use server";

import { validateForgotPasswordEmail } from "@/lib/helpers/auth";
import { readFormString } from "@/lib/helpers/forms";
import type { ForgotPasswordFormState } from "@/types/auth";

// Todo: Call auth.api.requestPasswordReset and return "sent" once an email provider is connected
export async function requestPasswordReset(_previous: ForgotPasswordFormState, formData: FormData): Promise<ForgotPasswordFormState> {
  const email = readFormString(formData, "email");
  const error = validateForgotPasswordEmail(email);
  if (error) return { status: "invalid", email, error }
  return { status: "unavailable", email }
}
