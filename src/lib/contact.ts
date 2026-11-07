import { contact } from "@/constants/contact";
import type { Locale } from "@/i18n/config";
import { isEmailConfigured, sendEmail } from "@/lib/email";
import { contactEmail } from "@/lib/helpers/email";
import type { ContactDeliveryResult, ContactFormValues } from "@/types/contact";

export async function sendContactMessage(values: ContactFormValues, locale: Locale): Promise<ContactDeliveryResult> {
  if (!isEmailConfigured() && process.env.NODE_ENV === "production") return { ok: false, reason: "not-configured" }

  try {
    await sendEmail({ to: process.env.CONTACT_EMAIL_TO || contact.email, replyTo: values.email, ...contactEmail(values, locale) });
    return { ok: true }
  } catch (error) {
    console.error("Contact form delivery failed", error);
    return { ok: false, reason: "failed" }
  }
}
