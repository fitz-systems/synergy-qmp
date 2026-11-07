"use server";

import { formLocaleField } from "@/constants/forms";
import { validateForgotPasswordEmail } from "@/lib/helpers/auth";
import { readFormString } from "@/lib/helpers/forms";
import { resolveLocale } from "@/lib/helpers/locale";
import { requestPasswordResetLink } from "@/lib/session";
import type { ForgotPasswordFormState } from "@/types/auth";

export async function requestPasswordReset(_previous: ForgotPasswordFormState, formData: FormData): Promise<ForgotPasswordFormState> {
  const email = readFormString(formData, "email");
  const error = validateForgotPasswordEmail(email);
  if (error) return { status: "invalid", email, error }

  try {
    await requestPasswordResetLink(email, resolveLocale(formData.get(formLocaleField)));
  } catch (failure) {
    console.error("Password reset email failed", failure);
    return { status: "failed", email }
  }

  return { status: "sent", email }
}
