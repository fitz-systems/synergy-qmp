import type { Metadata } from "next";
import { PasswordLinkPage } from "@/components/auth/password-link-page";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { setPasswordCopy } from "@/lib/helpers/auth";
import { localizedHref } from "@/lib/helpers/routes";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.setPasswordPage.metaTitle, robots: { index: false } }
}

export default async function SetPasswordPage({ searchParams }: PageProps<"/[lang]/set-password">) {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);

  return (
    <PasswordLinkPage
      searchParams={searchParams}
      copy={setPasswordCopy(dict.resetPasswordPage, dict.setPasswordPage)}
      bannerTitle={dict.nav.setPassword}
      loginLabel={dict.nav.login}
      loginHref={localizedHref(locale, "login")}
      forgotPasswordHref={localizedHref(locale, "forgotPassword")}
    />
  );
}
