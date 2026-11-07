import bannerImage from "@/assets/images/about-classroom.jpg";

import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { PageBanner } from "@/components/shared/page-banner";
import { contact } from "@/constants/contact";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localizedHref } from "@/lib/helpers/routes";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.forgotPasswordPage.metaTitle, robots: { index: false } }
}

export default async function ForgotPasswordPage() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const copy = dict.forgotPasswordPage;

  return (
    <>
      <PageBanner
        title={dict.nav.forgotPassword}
        trail={[{ label: dict.nav.login, href: localizedHref(locale, "login") }]}
        image={bannerImage}
        imagePosition="object-[center_30%]"
      />
      <AuthCard titleId="forgot-title" title={copy.title} body={copy.body}>
        <ForgotPasswordForm locale={locale} labels={copy} loginHref={localizedHref(locale, "login")} contactEmail={contact.email}/>
      </AuthCard>
    </>
  );
}
