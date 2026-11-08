import type { Locale } from "@/i18n/config";

export interface LocalizedMetadataInput {
  locale: Locale;
  title: string;
  description: string;
  path: (locale: Locale) => string;
}
