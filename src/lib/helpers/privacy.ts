import { contact } from "@/constants/contact";
import { privacySections } from "@/content/privacy";
import type { Locale } from "@/i18n/config";
import type { PrivacySection } from "@/types/privacy";
import { interpolate } from "./format";

export function privacySectionsFor(locale: Locale): PrivacySection[] {
  const values = { email: contact.email, phone: contact.phoneDisplay }
  return privacySections[locale].map((section) => ({
    ...section,
    paragraphs: section.paragraphs.map((paragraph) => interpolate(paragraph, values)),
    items: section.items?.map((item) => interpolate(item, values))
  }));
}
