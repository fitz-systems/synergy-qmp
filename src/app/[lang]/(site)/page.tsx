import type { Metadata } from "next";
import { AboutBand } from "@/components/home/about-band";
import { Hero } from "@/components/home/hero";
import { LearningObjectives } from "@/components/home/learning-objectives";
import { StatsBand } from "@/components/home/stats-band";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { CtaBand } from "@/components/shared/cta-band";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localizedHref } from "@/lib/helpers/routes";
import { localizedMetadata } from "@/lib/helpers/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  return localizedMetadata({
    locale,
    title: dict.meta.title,
    description: dict.meta.description,
    path: (language) => localizedHref(language, "home")
  });
}

export default function HomePage() {
  return (
    <>
      <Hero/>
      <AboutBand/>
      <StatsBand/>
      <LearningObjectives/>
      <TestimonialsSection/>
      <CtaBand/>
    </>
  );
}
