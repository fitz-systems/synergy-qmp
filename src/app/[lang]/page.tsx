import { AboutBand } from "@/components/home/about-band";
import { Hero } from "@/components/home/hero";
import { LearningObjectives } from "@/components/home/learning-objectives";
import { StatsBand } from "@/components/home/stats-band";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { CtaBand } from "@/components/shared/cta-band";

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
