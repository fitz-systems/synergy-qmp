import bannerImage from "@/assets/images/about-classroom.jpg";

import type { Metadata } from "next";
import { ServicesList } from "@/components/about/services-list";
import { SynergyDefinition } from "@/components/about/synergy-definition";
import { TdgCertification } from "@/components/about/tdg-certification";
import { TeamBand } from "@/components/about/team-band";
import { CtaBand } from "@/components/shared/cta-band";
import { PageBanner } from "@/components/shared/page-banner";
import { locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { localizedHref } from "@/lib/helpers/routes";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return {
    title: dict.aboutPage.metaTitle,
    description: dict.aboutPage.metaDescription,
    alternates: {
      languages: Object.fromEntries(locales.map((locale) => [locale, localizedHref(locale, "about")]))
    }
  }
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
