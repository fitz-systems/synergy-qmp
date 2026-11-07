import type { Dictionary } from "@/i18n/dictionaries";

export type LinkEmailCopy = Dictionary["emails"]["passwordReset"];

export interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

export interface OutgoingEmail extends EmailContent {
  to: string;
}
