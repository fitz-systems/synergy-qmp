import bannerImage from "@/assets/images/about-classroom.jpg";

import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { ResetLinkExpired } from "@/components/auth/reset-link-expired";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { PageBanner } from "@/components/shared/page-banner";
import { contact } from "@/constants/contact";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { resetTokenFromQuery } from "@/lib/helpers/auth";
import { localizedHref } from "@/lib/helpers/routes";
import type { ResetPasswordCopy } from "@/types/auth";

interface ResetPasswordContentProps {
  searchParams: PageProps<"/[lang]/reset-password">["searchParams"];
  labels: ResetPasswordCopy;
  loginHref: string;
  forgotPasswordHref: string;
}

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.resetPasswordPage.metaTitle, robots: { index: false } }
}

async function ResetPasswordContent({ searchParams, labels, loginHref, forgotPasswordHref }: ResetPasswordContentProps) {
  const token = resetTokenFromQuery(await searchParams);
  if (!token) return <ResetLinkExpired labels={labels.expired} forgotPasswordHref={forgotPasswordHref}/>;

  return <ResetPasswordForm token={token} labels={labels} loginHref={loginHref} forgotPasswordHref={forgotPasswordHref} contactEmail={contact.email}/>;
}

export default async function ResetPasswordPage({ searchParams }: PageProps<"/[lang]/reset-password">) {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const copy = dict.resetPasswordPage;
  const loginHref = localizedHref(locale, "login");

  return (
    <>
      <PageBanner
        title={dict.nav.resetPassword}
        trail={[{ label: dict.nav.login, href: loginHref }]}
        image={bannerImage}
        imagePosition="object-[center_30%]"
      />
      <AuthCard titleId="reset-title" title={copy.title} body={copy.body}>
        <Suspense fallback={<div className="mt-8 min-h-72"/>}>
          <ResetPasswordContent searchParams={searchParams} labels={copy} loginHref={loginHref} forgotPasswordHref={localizedHref(locale, "forgotPassword")}/>
        </Suspense>
      </AuthCard>
    </>
  );
}
