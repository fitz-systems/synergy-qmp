"use server";

import { contactHoneypotField } from "@/constants/contact";
import { formLocaleField } from "@/constants/forms";
import { sendContactMessage } from "@/lib/contact";
import { contactStatusForFailure, readContactForm, sentContactFormState, validateContactForm } from "@/lib/helpers/contact";
import { resolveLocale } from "@/lib/helpers/locale";
import type { ContactFormState } from "@/types/contact";

export async function submitContactForm(_previous: ContactFormState, formData: FormData): Promise<ContactFormState> {
  const values = readContactForm(formData);
  if (formData.get(contactHoneypotField)) return sentContactFormState(values.email);

  const errors = validateContactForm(values);
  if (Object.keys(errors).length > 0) return { status: "invalid", values, errors }

  const result = await sendContactMessage(values, resolveLocale(formData.get(formLocaleField)));
  if (result.ok) return sentContactFormState(values.email);

  return { status: contactStatusForFailure(result.reason), values, errors: {} }
}
