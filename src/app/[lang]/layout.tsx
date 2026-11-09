import { Inter } from "next/font/google";
import type { Metadata } from "next";
import { locales } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { sharingMetadata, siteMetadataBase } from "@/lib/helpers/seo";

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
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  return {
    metadataBase: siteMetadataBase(),
    title: dict.meta.title,
    description: dict.meta.description,
    ...sharingMetadata(locale, dict.meta.title, dict.meta.description)
  }
}

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const locale = await getLocale();

  return (
    <html lang={locale} className={inter.variable} data-scroll-behavior="smooth">
      <body className="flex min-h-dvh flex-col font-sans">{children}</body>
    </html>
  );
}
