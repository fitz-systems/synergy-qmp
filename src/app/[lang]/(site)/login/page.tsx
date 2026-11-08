import Link from "next/link";
import bannerImage from "@/assets/images/about-classroom.jpg";

import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";
import { PageBanner } from "@/components/shared/page-banner";
import { contact } from "@/constants/contact";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localizedHref } from "@/lib/helpers/routes";
import { localizedMetadata } from "@/lib/helpers/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  return localizedMetadata({
    locale,
    title: dict.loginPage.metaTitle,
    description: dict.loginPage.metaDescription,
    path: (language) => localizedHref(language, "login")
  });
}

export default async function LoginPage() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const copy = dict.loginPage;

  return (
    <>
      <PageBanner title={dict.nav.login} image={bannerImage} imagePosition="object-[center_30%]"/>
      <section className="bg-canvas-alt">
        <div className="container-site grid items-start gap-12 py-16 md:py-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:gap-20">
          <div className="max-w-xl lg:pt-10">
            <h2 className="text-3xl font-bold text-ink sm:text-4xl">{copy.intro.title}</h2>
            <p className="mt-4 text-lg leading-relaxed text-ink-muted">{copy.intro.body}</p>
            <div className="mt-10 border-t border-line-strong pt-8">
              <h3 className="text-lg font-semibold text-ink">{copy.intro.enrollTitle}</h3>
              <p className="mt-1.5 leading-relaxed text-ink-muted">{copy.intro.enrollBody}</p>
              <Link
                href={localizedHref(locale, "contact")}
                className="group mt-4 inline-flex items-center gap-2 font-semibold text-ink underline decoration-brand decoration-2 underline-offset-[0.3em] transition-colors hover:decoration-ink"
              >
                {copy.intro.enrollLink}
                <ArrowRight aria-hidden className="size-4 transition-transform duration-300 ease-out-expo group-hover:translate-x-1" strokeWidth={2}/>
              </Link>
            </div>
          </div>

          <section aria-labelledby="login-title" className="-order-1 rounded-2xl lg:order-none border border-line bg-canvas p-6 shadow-raise sm:p-8 lg:p-10">
            <h2 id="login-title" className="text-2xl font-bold text-ink">{copy.form.title}</h2>
            <LoginForm
              locale={locale}
              labels={copy.form}
              forgotPasswordHref={localizedHref(locale, "forgotPassword")}
              contactEmail={contact.email}
            />
          </section>
        </div>
      </section>
    </>
  );
}
