"use server";

import { readResetPasswordForm, validateResetPassword } from "@/lib/helpers/auth";
import type { ResetPasswordFormState } from "@/types/auth";

// Todo: Read the token from the reset link and call auth.api.resetPassword, returning "done" on success
export async function resetPassword(_previous: ResetPasswordFormState, formData: FormData): Promise<ResetPasswordFormState> {
  const errors = validateResetPassword(readResetPasswordForm(formData));
  if (Object.keys(errors).length > 0) return { status: "invalid", errors }
  return { status: "unavailable", errors: {} }
}
