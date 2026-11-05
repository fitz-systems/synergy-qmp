import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/images/logo.png";

import { headerLinks } from "@/constants/routes";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localizedHref } from "@/lib/helpers/routes";
import { HeaderNav } from "./header-nav";

export async function SiteHeader() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  
  const otherLocale = locale === "en" ? "fr" : "en";

  const links = headerLinks.map((route) => ({ href: localizedHref(locale, route), label: dict.nav[route] }));

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:rounded-md focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-canvas"
      >
        {locale === "fr" ? "Aller au contenu" : "Skip to content"}
      </a>
      <div className="container-site flex h-[4.5rem] items-center justify-between gap-6 lg:h-20">
        <Link href={localizedHref(locale, "home")} className="shrink-0 rounded-sm" aria-label="Synergy QMP">
          <Image src={logo} alt="" priority className="h-7 w-auto lg:h-8" />
        </Link>
        <HeaderNav
          locale={locale}
          otherLocale={otherLocale}
          links={links}
          loginHref={localizedHref(locale, "login")}
          brand={<Image src={logo} alt="Synergy QMP" className="h-7 w-auto" />}
          labels={{
            login: dict.nav.login,
            menu: dict.nav.menu,
            close: dict.nav.close,
            primary: dict.nav.primary,
            switchLanguage: dict.nav.switchLanguage,
            switchLanguageLabel: dict.nav.switchLanguageLabel
          }}
        />
      </div>
    </header>
  );
}
