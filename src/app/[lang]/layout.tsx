import { Inter } from "next/font/google";
import type { Metadata } from "next";
import { locales } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localizedHref } from "@/lib/helpers/routes";

import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return {
    title: dict.meta.title,
    description: dict.meta.description,
    alternates: {
      languages: Object.fromEntries(locales.map((locale) => [locale, localizedHref(locale, "home")]))
    }
  }
}

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const locale = await getLocale();

  return (
    <html lang={locale} className={inter.variable}>
      <body className="flex min-h-dvh flex-col font-sans">{children}</body>
    </html>
  );
}
