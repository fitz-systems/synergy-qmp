import type { Dictionary } from "@/i18n/dictionaries";

export type ContactField = "name" | "email" | "subject" | "message";

export type ContactFieldError = "required" | "invalidEmail" | "tooLong";

export type ContactFormValues = Record<ContactField, string>;

export type ContactFormStatus = "idle" | "invalid" | "sent" | "unavailable" | "failed";

export type ContactDeliveryFailure = "not-configured" | "failed";

export type ContactDeliveryResult = { ok: true } | { ok: false; reason: ContactDeliveryFailure };

export interface ContactFormState {
  status: ContactFormStatus;
  values: ContactFormValues;
  errors: Partial<Record<ContactField, ContactFieldError>>;
}

export type ContactFormLabels = Dictionary["contactPage"]["form"];

export type ContactErrorLabels = ContactFormLabels["errors"];

export type ContactInfoLabels = Dictionary["contactPage"]["info"];

export type ContactInfoKey = "phone" | "email" | "address";

export interface ContactInfoItem {
  key: ContactInfoKey;
  label: string;
  value: string;
  href?: string;
}
