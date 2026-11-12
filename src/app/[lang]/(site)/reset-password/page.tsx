import type { Metadata } from "next";
import { PasswordLinkPage } from "@/components/auth/password-link-page";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localizedHref } from "@/lib/helpers/routes";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.resetPasswordPage.metaTitle, robots: { index: false } }
}

export default async function ResetPasswordPage({ searchParams }: PageProps<"/[lang]/reset-password">) {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);

  return (
    <PasswordLinkPage
      searchParams={searchParams}
      copy={dict.resetPasswordPage}
      bannerTitle={dict.nav.resetPassword}
      loginLabel={dict.nav.login}
      loginHref={localizedHref(locale, "login")}
      forgotPasswordHref={localizedHref(locale, "forgotPassword")}
    />
  );
}
