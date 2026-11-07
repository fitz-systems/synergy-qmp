import { Resend } from "resend";
import { getDictionaryFor } from "@/i18n/dictionaries";
import { linkEmail } from "@/lib/helpers/email";
import { resolveLocale } from "@/lib/helpers/locale";
import type { AuthUserProfile } from "@/types/auth";
import type { OutgoingEmail } from "@/types/email";

export async function sendEmail({ to, subject, html, text }: OutgoingEmail) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    if (process.env.NODE_ENV === "production") throw new Error("Email isn't configured: set RESEND_API_KEY and EMAIL_FROM.");
    console.info(`[dev] Email to ${to}: ${subject}\n${text}`);
    return;
  }

  const { error } = await new Resend(apiKey).emails.send({ from, to, subject, html, text });
  if (error) throw new Error(`Resend couldn't send "${subject}" to ${to}: ${error.message}`);
}

export async function sendPasswordResetEmail(user: AuthUserProfile, url: string) {
  const dict = await getDictionaryFor(resolveLocale(user.preferredLocale));
  await sendEmail({ to: user.email, ...linkEmail(dict.emails.passwordReset, { name: user.firstName ?? "", url }) });
}

export async function sendWelcomeEmail(user: AuthUserProfile, url: string) {
  const dict = await getDictionaryFor(resolveLocale(user.preferredLocale));
  await sendEmail({ to: user.email, ...linkEmail(dict.emails.welcome, { name: user.firstName ?? "", url }) });
}
