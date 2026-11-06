import { contact, contactFieldLimits, contactFields, initialContactFormState } from "@/constants/contact";
import type { ContactDeliveryFailure, ContactErrorLabels, ContactField, ContactFieldError, ContactFormLabels, ContactFormState, ContactFormStatus, ContactFormValues, ContactInfoItem, ContactInfoLabels } from "@/types/contact";
import type { NoticeLabels } from "@/types/forms";
import { interpolate } from "./format";
import { isEmail, readFormString } from "./forms";

export function readContactForm(formData: FormData): ContactFormValues {
  return Object.fromEntries(contactFields.map((field) => [field, readFormString(formData, field)])) as ContactFormValues;
}

export function validateContactForm(values: ContactFormValues): ContactFormState["errors"] {
  const errors: ContactFormState["errors"] = {}
  for (const field of contactFields) {
    if (!values[field]) errors[field] = "required";
    else if (values[field].length > contactFieldLimits[field]) errors[field] = "tooLong";
  }
  if (!errors.email && !isEmail(values.email)) errors.email = "invalidEmail";
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

export function sentContactFormState(email: string): ContactFormState {
  return { ...initialContactFormState, status: "sent", values: { ...initialContactFormState.values, email } }
}

export function contactStatusForFailure(reason: ContactDeliveryFailure): ContactFormStatus {
  return reason === "not-configured" ? "unavailable" : "failed";
}

export function contactNotice(labels: ContactFormLabels, status: ContactFormStatus, values: Record<"email" | "phone", string>): NoticeLabels | null {
  const notice = status === "unavailable" ? labels.unavailable : status === "failed" ? labels.failed : null;
  return notice && { title: notice.title, body: interpolate(notice.body, values) }
}

export function contactInfoItems(labels: ContactInfoLabels): ContactInfoItem[] {
  return [
    { key: "phone", label: labels.phone, value: contact.phoneDisplay, href: contact.phoneHref },
    { key: "email", label: labels.email, value: contact.email, href: `mailto:${contact.email}` },
    { key: "address", label: labels.address, value: contact.address }
  ];
}
