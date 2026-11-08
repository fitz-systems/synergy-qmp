import bannerImage from "@/assets/images/about-classroom.jpg";

import type { Metadata } from "next";
import { ServicesList } from "@/components/about/services-list";
import { SynergyDefinition } from "@/components/about/synergy-definition";
import { TdgCertification } from "@/components/about/tdg-certification";
import { TeamBand } from "@/components/about/team-band";
import { CtaBand } from "@/components/shared/cta-band";
import { PageBanner } from "@/components/shared/page-banner";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localizedHref } from "@/lib/helpers/routes";
import { localizedMetadata } from "@/lib/helpers/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  return localizedMetadata({
    locale,
    title: dict.aboutPage.metaTitle,
    description: dict.aboutPage.metaDescription,
    path: (language) => localizedHref(language, "about")
  });
}

export default async function AboutPage() {
  const dict = await getDictionary();

  return (
    <>
      <PageBanner title={dict.nav.about} image={bannerImage} imagePosition="object-[center_30%]"/>
      <SynergyDefinition/>
      <TeamBand/>
      <ServicesList/>
      <TdgCertification/>
      <CtaBand/>
    </>
  );
}
