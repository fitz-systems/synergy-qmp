import bannerImage from "@/assets/images/about-classroom.jpg";

import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { PageBanner } from "@/components/shared/page-banner";
import { contact } from "@/constants/contact";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localizedHref } from "@/lib/helpers/routes";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.resetPasswordPage.metaTitle, robots: { index: false } }
}

export default async function ResetPasswordPage() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const copy = dict.resetPasswordPage;

  return (
    <>
      <PageBanner
        title={dict.nav.resetPassword}
        trail={[{ label: dict.nav.login, href: localizedHref(locale, "login") }]}
        image={bannerImage}
        imagePosition="object-[center_30%]"
      />
      <AuthCard titleId="reset-title" title={copy.title} body={copy.body}>
        <ResetPasswordForm labels={copy} loginHref={localizedHref(locale, "login")} contactEmail={contact.email}/>
      </AuthCard>
    </>
  );
}
