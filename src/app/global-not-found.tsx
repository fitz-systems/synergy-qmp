import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/images/logo.png";
import en from "@/i18n/dictionaries/en.json";
import fr from "@/i18n/dictionaries/fr.json";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NotFoundView } from "@/components/shared/not-found-view";
import { notFoundLinks } from "@/lib/helpers/not-found";
import { localizedHref } from "@/lib/helpers/routes";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

export const metadata: Metadata = {
  title: en.notFound.metaTitle
}

export default function GlobalNotFound() {
  return (
    <html lang="en" className={inter.variable}>
      <body className="flex min-h-dvh flex-col bg-canvas-alt font-sans">
        <header className="border-b border-line bg-canvas">
          <div className="container-site flex h-[4.5rem] items-center lg:h-20">
            <Link href={localizedHref("en", "home")} className="rounded-sm" aria-label="Synergy QMP">
              <Image src={logo} alt="" priority className="h-7 w-auto lg:h-8"/>
            </Link>
          </div>
        </header>
        <main className="container-site flex-1 content-center py-20">
          <p aria-hidden className="text-[clamp(4.5rem,14vw,8rem)] font-bold leading-none tracking-[-0.04em] text-brand">{en.notFound.code}</p>
          <div className="mt-8 grid gap-14 md:grid-cols-2 md:gap-12">
            <NotFoundView copy={en.notFound} links={notFoundLinks("en")} lang="en" showCode={false}/>
            <NotFoundView copy={fr.notFound} links={notFoundLinks("fr")} lang="fr" headingLevel="h2" showCode={false}/>
          </div>
        </main>
      </body>
    </html>
  );
}
