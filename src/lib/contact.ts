import type { Locale } from "@/i18n/config";
import type { ContactDeliveryResult, ContactFormValues } from "@/types/contact";

// Todo: Deliver to info@synergyqmp.com once the client picks an email provider (Resend via the Vercel Marketplace, or their Mailgun account)
export async function sendContactMessage(values: ContactFormValues, locale: Locale): Promise<ContactDeliveryResult> {
  void values;
  void locale;
  return { ok: false, reason: "not-configured" }
}
