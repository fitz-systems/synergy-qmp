import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/images/logo.png";

import { Mail, Phone } from "lucide-react";
import { contact } from "@/constants/contact";
import { footerLinks } from "@/constants/routes";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { copyrightYear } from "@/lib/helpers/date";
import { localizedHref } from "@/lib/helpers/routes";

export async function SiteFooter() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);

  const links = footerLinks.map((route) => ({ href: localizedHref(locale, route), label: dict.nav[route] }));

  return (
    <footer className="border-t border-line bg-canvas print:hidden">
      <div className="container-site grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr] md:gap-12">
        <div className="max-w-xs">
          <Image src={logo} alt="Synergy QMP" className="h-7 w-auto"/>
          <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink-muted">{dict.footer.tagline}</p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-ink">{dict.footer.contactHeading}</h2>
          <ul className="mt-4 space-y-3 text-[0.9375rem]">
            <li>
              <a href={`mailto:${contact.email}`} className="inline-flex items-center gap-2.5 text-ink-muted transition-colors hover:text-ink">
                <Mail aria-hidden className="size-4 text-brand-ink" strokeWidth={1.75}/>
                {contact.email}
              </a>
            </li>
            <li>
              <a href={contact.phoneHref} className="inline-flex items-center gap-2.5 text-ink-muted tabular-nums transition-colors hover:text-ink">
                <Phone aria-hidden className="size-4 text-brand-ink" strokeWidth={1.75}/>
                {contact.phoneDisplay}
              </a>
            </li>
          </ul>
        </div>

        <nav aria-labelledby="footer-links">
          <h2 id="footer-links" className="text-sm font-semibold text-ink">{dict.footer.linksHeading}</h2>
          <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-[0.9375rem] md:grid-cols-1">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-ink-muted transition-colors hover:text-ink">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-line">
        <p className="container-site py-6 text-sm text-ink-subtle">
          © {await copyrightYear()} Synergy QMP. {dict.footer.rights}
        </p>
      </div>
    </footer>
  );
}
