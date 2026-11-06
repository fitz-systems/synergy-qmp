import { contact, contactEmailPattern, contactFieldLimits, contactFields, initialContactFormState } from "@/constants/contact";
import type { ContactDeliveryFailure, ContactErrorLabels, ContactField, ContactFieldError, ContactFieldIds, ContactFormLabels, ContactFormState, ContactFormStatus, ContactFormValues, ContactInfoItem, ContactInfoLabels, ContactNoticeLabels } from "@/types/contact";
import { interpolate } from "./format";

export function readContactForm(formData: FormData): ContactFormValues {
  return Object.fromEntries(contactFields.map((field) => [field, String(formData.get(field) ?? "").trim()])) as ContactFormValues;
}

export function validateContactForm(values: ContactFormValues): ContactFormState["errors"] {
  const errors: ContactFormState["errors"] = {}
  for (const field of contactFields) {
    if (!values[field]) errors[field] = "required";
    else if (values[field].length > contactFieldLimits[field]) errors[field] = "tooLong";
  }
  if (!errors.email && !contactEmailPattern.test(values.email)) errors.email = "invalidEmail";
  return errors;
}

export function contactErrorMessage(labels: ContactErrorLabels, field: ContactField, error: ContactFieldError) {
  if (error === "required") return labels.required[field];
  if (error === "invalidEmail") return labels.invalidEmail;
  return interpolate(labels.tooLong, { max: contactFieldLimits[field].toLocaleString() });
}

export function contactFieldErrorMessage(labels: ContactErrorLabels, errors: ContactFormState["errors"], field: ContactField) {
  const error = errors[field];
  return error ? contactErrorMessage(labels, field, error) : undefined;
}

export function contactFieldIds(field: ContactField): ContactFieldIds {
  const input = `contact-${field}`;
  return { input, error: `${input}-error` }
}

export function sentContactFormState(email: string): ContactFormState {
  return { ...initialContactFormState, status: "sent", values: { ...initialContactFormState.values, email } }
}

export function contactStatusForFailure(reason: ContactDeliveryFailure): ContactFormStatus {
  return reason === "not-configured" ? "unavailable" : "failed";
}

export function contactNoticeLabels(labels: ContactFormLabels, status: ContactFormStatus): ContactNoticeLabels | null {
  if (status === "unavailable") return labels.unavailable;
  if (status === "failed") return labels.failed;
  return null;
}

export function contactInfoItems(labels: ContactInfoLabels): ContactInfoItem[] {
  return [
    { key: "phone", label: labels.phone, value: contact.phoneDisplay, href: contact.phoneHref },
    { key: "email", label: labels.email, value: contact.email, href: `mailto:${contact.email}` },
    { key: "address", label: labels.address, value: contact.address }
  ];
}
