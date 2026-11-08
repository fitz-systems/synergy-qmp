import bannerImage from "@/assets/images/about-classroom.jpg";

import type { Metadata } from "next";
import { PrivacyBody } from "@/components/privacy/privacy-body";
import { PrivacyContents } from "@/components/privacy/privacy-contents";
import { PageBanner } from "@/components/shared/page-banner";
import { privacyLastUpdated } from "@/constants/privacy";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { formatDate, interpolate } from "@/lib/helpers/format";
import { privacySectionsFor } from "@/lib/helpers/privacy";
import { localizedHref } from "@/lib/helpers/routes";
import { localizedMetadata } from "@/lib/helpers/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  return localizedMetadata({
    locale,
    title: dict.privacyPage.metaTitle,
    description: dict.privacyPage.metaDescription,
    path: (language) => localizedHref(language, "privacy")
  });
}

export default async function PrivacyPage() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const copy = dict.privacyPage;
  const sections = privacySectionsFor(locale);

  return (
    <>
      <PageBanner
        title={copy.title}
        subtitle={interpolate(copy.lastUpdated, { date: formatDate(locale, privacyLastUpdated) })}
        image={bannerImage}
        imagePosition="object-[center_30%]"
      />
      <div className="container-site grid gap-12 py-16 md:py-20 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-20">
        <aside className="hidden lg:block">
          <PrivacyContents title={copy.contents} sections={sections}/>
        </aside>
        <PrivacyBody sections={sections}/>
      </div>
    </>
  );
}
