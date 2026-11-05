"use client";

import Link from "next/link";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Globe, Menu, X } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { localizedHref } from "@/lib/helpers/routes";

interface HeaderNavProps {
  locale: Locale;
  otherLocale: Locale;
  links: { href: string; label: string }[];
  loginHref: string;
  brand: React.ReactNode;
  labels: {
    login: string;
    menu: string;
    close: string;
    primary: string;
    switchLanguage: string;
    switchLanguageLabel: string;
  };
}

export function HeaderNav({ locale, otherLocale, links, loginHref, brand, labels }: HeaderNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const switchHref = pathname.replace(new RegExp(`^/${locale}(?=/|$)`), `/${otherLocale}`);
  const isActive = (href: string) => (href === localizedHref(locale, "home") ? pathname === href : pathname.startsWith(href));

  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    }

  }, [open]);

  return (
    <>
      <nav aria-label={labels.primary} className="hidden items-center gap-1 lg:flex">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive(link.href) ? "page" : undefined}
            className="group relative rounded-md px-3.5 py-2 text-[0.9375rem] font-medium text-ink-muted transition-colors duration-200 hover:text-ink aria-[current=page]:text-ink"
          >
            {link.label}
            <span
              aria-hidden
              className="absolute inset-x-3.5 -bottom-[1.3rem] h-0.5 origin-left scale-x-0 rounded-full bg-brand transition-transform duration-300 ease-out-expo group-hover:scale-x-100 group-aria-[current=page]:scale-x-100"
            />
          </Link>
        ))}
      </nav>

      <div className="hidden items-center gap-2 lg:flex">
        <Link
          href={switchHref}
          hrefLang={otherLocale}
          lang={otherLocale}
          aria-label={labels.switchLanguageLabel}
          className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-[0.9375rem] font-medium text-ink-muted transition-colors hover:text-ink"
        >
          <Globe aria-hidden className="size-4" strokeWidth={1.75}/>
          {labels.switchLanguage}
        </Link>
        <Link
          href={loginHref}
          className="inline-flex h-10 items-center rounded-md border border-line-strong px-4 text-[0.9375rem] font-semibold text-ink transition-colors duration-200 hover:border-ink hover:bg-ink hover:text-canvas"
        >
          {labels.login}
        </Link>
      </div>

      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="-mr-2 inline-flex size-11 items-center justify-center rounded-md text-ink lg:hidden"
      >
        <Menu aria-hidden className="size-6" strokeWidth={1.75}/>
        <span className="sr-only">{labels.menu}</span>
      </button>

      <div
        id="mobile-menu"
        hidden={!open}
        className="fixed inset-0 z-50 bg-canvas lg:hidden"
      >
        <div className="container-site flex h-[4.5rem] items-center justify-between">
          {brand}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="-mr-2 inline-flex size-11 items-center justify-center rounded-md text-ink"
          >
            <X aria-hidden className="size-6" strokeWidth={1.75}/>
            <span className="sr-only">{labels.close}</span>
          </button>
        </div>
        <nav aria-label={labels.primary} className="container-site flex flex-col pt-2">
          {links.map((link, index) => (
            <Link
              key={link.href}
              onClick={close}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              style={{ animationDelay: `${index * 40}ms` }}
              className="flex items-center justify-between border-b border-line py-4 text-2xl font-semibold tracking-tight text-ink motion-safe:animate-[rise-in_500ms_var(--ease-out-expo)_both] aria-[current=page]:text-brand-ink"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-8 flex flex-col gap-3">
            <Link
              href={loginHref}
              onClick={close}
              className="inline-flex h-12 items-center justify-center rounded-md bg-ink text-base font-semibold text-canvas"
            >
              {labels.login}
            </Link>
            <Link
              href={switchHref}
              onClick={close}
              hrefLang={otherLocale}
              lang={otherLocale}
              aria-label={labels.switchLanguageLabel}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-line-strong text-base font-medium text-ink"
            >
              <Globe aria-hidden className="size-4" strokeWidth={1.75}/>
              {labels.switchLanguage}
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
}
