import { Mail, MapPin, Phone, type LucideIcon } from "lucide-react";
import type { ContactField, ContactFormState, ContactInfoKey } from "@/types/contact";

export const contact = {
  email: "info@synergyqmp.com",
  phoneDisplay: "416-930-0607",
  phoneHref: "tel:+14169300607",
  address: "PO Box 97845 Yonge St. 567, Toronto, Ontario, Canada"
}

export const contactInfoIcons: Record<ContactInfoKey, LucideIcon> = {
  phone: Phone,
  email: Mail,
  address: MapPin
}

export const contactFields: ContactField[] = ["name", "email", "subject", "message"];

export const contactFieldLimits: Record<ContactField, number> = {
  name: 100,
  email: 254,
  subject: 150,
  message: 5000
}

export const contactEmailCopy = {
  subject: "Website message: {subject}",
  heading: "New message from the synergyqmp.com contact form",
  labels: { name: "Name", email: "Email", locale: "Site language", subject: "Subject", message: "Message" },
  replyHint: "Reply to this email to answer {name} directly."
}

export const contactHoneypotField = "website";

export const contactHoneypotLabel = "Website";

export const initialContactFormState: ContactFormState = {
  status: "idle",
  values: { name: "", email: "", subject: "", message: "" },
  errors: {}
}
