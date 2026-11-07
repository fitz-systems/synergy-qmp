"use server";

import { resetTokenField } from "@/constants/auth";
import { readResetPasswordForm, resetFailureStatus, validateResetPassword } from "@/lib/helpers/auth";
import { readFormString } from "@/lib/helpers/forms";
import { resetPasswordWithToken } from "@/lib/session";
import type { ResetPasswordFormState } from "@/types/auth";

export async function resetPassword(_previous: ResetPasswordFormState, formData: FormData): Promise<ResetPasswordFormState> {
  const values = readResetPasswordForm(formData);
  const errors = validateResetPassword(values);
  if (Object.keys(errors).length > 0) return { status: "invalid", errors }

  const token = readFormString(formData, resetTokenField);
  if (!token) return { status: "expired", errors: {} }

  try {
    await resetPasswordWithToken(token, values.password);
  } catch (error) {
    return { status: resetFailureStatus(error), errors: {} }
  }

  return { status: "done", errors: {} }
}
