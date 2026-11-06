import type { Dictionary } from "@/i18n/dictionaries";

export type PrivacyPageCopy = Dictionary["privacyPage"];

export interface PrivacySection {
  id: string;
  title: string;
  paragraphs: string[];
  items?: string[];
}
