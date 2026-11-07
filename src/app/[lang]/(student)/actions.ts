"use server";

import { redirect } from "next/navigation";
import { postSignOutRoute } from "@/constants/auth";
import { formLocaleField } from "@/constants/forms";
import { resolveLocale } from "@/lib/helpers/locale";
import { localizedHref } from "@/lib/helpers/routes";
import { signOut } from "@/lib/session";

export async function signOutStudent(formData: FormData) {
  await signOut();
  redirect(localizedHref(resolveLocale(formData.get(formLocaleField)), postSignOutRoute));
}
