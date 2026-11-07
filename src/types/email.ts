import type { Dictionary } from "@/i18n/dictionaries";

export type PasswordResetEmailCopy = Dictionary["emails"]["passwordReset"];

export interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

export interface OutgoingEmail extends EmailContent {
  to: string;
}
