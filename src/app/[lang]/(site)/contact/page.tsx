import bannerImage from "@/assets/images/about-classroom.jpg";

import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/contact-form";
import { ContactInfo } from "@/components/contact/contact-info";
import { PageBanner } from "@/components/shared/page-banner";
import { contact } from "@/constants/contact";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localizedHref } from "@/lib/helpers/routes";
import { localizedMetadata } from "@/lib/helpers/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  return localizedMetadata({
    locale,
    title: dict.contactPage.metaTitle,
    description: dict.contactPage.metaDescription,
    path: (language) => localizedHref(language, "contact")
  });
}

export default async function ContactPage() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const copy = dict.contactPage;

  return (
    <>
      <PageBanner title={dict.nav.contact} image={bannerImage} imagePosition="object-[center_30%]"/>
      <section className="bg-canvas">
        <div className="container-site grid gap-14 py-16 md:py-24 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20">
          <ContactInfo labels={copy.info}/>
          <section aria-labelledby="message-title" className="self-start rounded-2xl border border-line bg-canvas p-6 shadow-raise sm:p-8 lg:p-10">
            <h2 id="message-title" className="text-3xl font-bold text-ink sm:text-4xl">{copy.form.title}</h2>
            <p className="mt-3 text-lg leading-relaxed text-ink-muted">{copy.form.body}</p>
            <ContactForm locale={locale} labels={copy.form} email={contact.email} phone={contact.phoneDisplay}/>
          </section>
        </div>
      </section>
    </>
  );
}
