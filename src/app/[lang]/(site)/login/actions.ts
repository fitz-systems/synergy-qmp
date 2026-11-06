"use server";

import { redirect } from "next/navigation";
import { postLoginRoute } from "@/constants/auth";
import { formLocaleField } from "@/constants/forms";
import { loginFailureState, loginFailureStatus, readLoginForm, validateLoginForm } from "@/lib/helpers/auth";
import { resolveLocale } from "@/lib/helpers/locale";
import { localizedHref } from "@/lib/helpers/routes";
import { signInWithEmail } from "@/lib/session";
import type { LoginFormState } from "@/types/auth";

export async function submitLogin(_previous: LoginFormState, formData: FormData): Promise<LoginFormState> {
  const credentials = readLoginForm(formData);
  const errors = validateLoginForm(credentials);
  if (Object.keys(errors).length > 0) return loginFailureState(credentials, "invalid", errors);

  try {
    await signInWithEmail(credentials);
  } catch (error) {
    return loginFailureState(credentials, loginFailureStatus(error));
  }

  redirect(localizedHref(resolveLocale(formData.get(formLocaleField)), postLoginRoute));
}
