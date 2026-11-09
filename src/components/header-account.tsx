"use client";

import Link from "next/link";

import { use } from "react";
import { SignOutForm } from "@/components/sign-out-form";
import { accountMenuLinkIcons } from "@/constants/student";
import type { Locale } from "@/i18n/config";
import type { HeaderAccountMenu } from "@/types/student";
import { AccountAvatar, AccountMenu } from "./account-menu";

interface DesktopAccountProps {
  accountMenu: Promise<HeaderAccountMenu | null>;
  loginHref: string;
  loginLabel: string;
}

interface MobileAccountProps extends DesktopAccountProps {
  locale: Locale;
  onNavigate: () => void;
}

export function DesktopAccount({ accountMenu, loginHref, loginLabel }: DesktopAccountProps) {
  const menu = use(accountMenu);

  if (menu) return <AccountMenu {...menu}/>;

  return (
    <Link
      href={loginHref}
      className="inline-flex h-10 items-center rounded-md border border-line-strong px-4 text-[0.9375rem] font-semibold text-ink transition-colors duration-200 hover:border-ink hover:bg-ink hover:text-canvas"
    >
      {loginLabel}
    </Link>
  );
}

export function MobileAccount({ accountMenu, locale, loginHref, loginLabel, onNavigate }: MobileAccountProps) {
  const menu = use(accountMenu);

  if (!menu) {
    return (
      <Link
        href={loginHref}
        onClick={onNavigate}
        className="inline-flex h-12 items-center justify-center rounded-md bg-ink text-base font-semibold text-canvas"
      >
        {loginLabel}
      </Link>
    );
  }

  const PrimaryIcon = accountMenuLinkIcons[menu.primaryLink.kind];

  return (
    <div className="rounded-xl border border-line p-4">
      <div className="flex items-center gap-3">
        <AccountAvatar initials={menu.account.initials} className="size-11 text-base"/>
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink">{menu.account.name}</p>
          <p className="truncate text-sm text-ink-muted">{menu.account.email}</p>
        </div>
      </div>
      <div className="mt-4 grid gap-2">
        <Link
          href={menu.primaryLink.href}
          onClick={onNavigate}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-ink text-base font-semibold text-canvas"
        >
          <PrimaryIcon aria-hidden className="size-4" strokeWidth={1.75}/>
          {menu.labels[menu.primaryLink.kind]}
        </Link>
        <SignOutForm
          locale={locale}
          label={menu.labels.logout}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md border border-line-strong text-base font-medium text-ink"
        />
      </div>
    </div>
  );
}
