import { notFound } from "next/navigation";
import { lang } from "next/root-params";
import { hasLocale, type Locale } from "./config";

const dictionaries = {
  en: () => import("./dictionaries/en.json").then((module) => module.default),
  fr: () => import("./dictionaries/fr.json").then((module) => module.default)
}

export type Dictionary = Awaited<ReturnType<(typeof dictionaries)["en"]>>;

export async function getLocale(): Promise<Locale> {
  const locale = await lang();
  if (!locale || !hasLocale(locale)) notFound();
  return locale;
}

export async function getDictionary(): Promise<Dictionary> {
  return dictionaries[await getLocale()]();
}
