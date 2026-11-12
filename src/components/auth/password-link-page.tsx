import bannerImage from "@/assets/images/about-classroom.jpg";

import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { ResetLinkExpired } from "@/components/auth/reset-link-expired";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { PageBanner } from "@/components/shared/page-banner";
import { contact } from "@/constants/contact";
import { resetTokenFromQuery } from "@/lib/helpers/auth";
import type { ResetPasswordCopy } from "@/types/auth";
import type { PageSearchParams } from "@/types/navigation";

interface PasswordLinkPageProps {
  searchParams: Promise<PageSearchParams>;
  copy: ResetPasswordCopy;
  bannerTitle: string;
  loginLabel: string;
  loginHref: string;
  forgotPasswordHref: string;
}

interface PasswordLinkContentProps {
  searchParams: Promise<PageSearchParams>;
  copy: ResetPasswordCopy;
  loginHref: string;
  forgotPasswordHref: string;
}

async function PasswordLinkContent({ searchParams, copy, loginHref, forgotPasswordHref }: PasswordLinkContentProps) {
  const token = resetTokenFromQuery(await searchParams);
  if (!token) return <ResetLinkExpired labels={copy.expired} forgotPasswordHref={forgotPasswordHref}/>;

  return <ResetPasswordForm token={token} labels={copy} loginHref={loginHref} forgotPasswordHref={forgotPasswordHref} contactEmail={contact.email}/>;
}

export function PasswordLinkPage({ searchParams, copy, bannerTitle, loginLabel, loginHref, forgotPasswordHref }: PasswordLinkPageProps) {
  return (
    <>
      <PageBanner
        title={bannerTitle}
        trail={[{ label: loginLabel, href: loginHref }]}
        image={bannerImage}
        imagePosition="object-[center_30%]"
      />
      <AuthCard titleId="reset-title" title={copy.title} body={copy.body}>
        <Suspense fallback={<div className="mt-8 min-h-72"/>}>
          <PasswordLinkContent searchParams={searchParams} copy={copy} loginHref={loginHref} forgotPasswordHref={forgotPasswordHref}/>
        </Suspense>
      </AuthCard>
    </>
  );
}
