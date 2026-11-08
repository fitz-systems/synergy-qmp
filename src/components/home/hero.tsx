import Image from "next/image";
import heroImage from "@/assets/images/hero-hot-cell.jpg";

import { ButtonLink } from "@/components/ui/button-link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localizedHref } from "@/lib/helpers/routes";

export async function Hero() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);

  return (
    <section className="relative isolate flex min-h-[clamp(32rem,80svh,46rem)] items-center overflow-hidden bg-night [--focus-ring:var(--color-canvas)]">
      <Image
        src={heroImage}
        alt=""
        fill
        priority
        placeholder="blur"
        sizes="100vw"
        className="-z-20 object-cover object-center"
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(16_20_26/0.62)_0%,rgb(16_20_26/0.72)_55%,rgb(16_20_26/0.88)_100%)]"/>

      <div className="container-site py-20 text-center text-canvas">
        <h1 className="mx-auto max-w-4xl motion-safe:animate-[rise-in_900ms_var(--ease-out-expo)_both]">
          <span className="block text-xl font-semibold tracking-tight text-brand sm:text-2xl md:text-[1.75rem]">
            {dict.hero.titleTop}
          </span>
          <span className="mt-3 block text-[clamp(2.75rem,9vw,5.75rem)] font-bold leading-[0.98] tracking-[-0.035em]">
            {dict.hero.titleBottom}
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-canvas/85 motion-safe:animate-[rise-in_900ms_var(--ease-out-expo)_120ms_both] sm:text-xl sm:leading-relaxed">
          {dict.hero.lead}
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 motion-safe:animate-[rise-in_900ms_var(--ease-out-expo)_240ms_both] sm:flex-row">
          <ButtonLink href={localizedHref(locale, "contact")} arrow className="w-full sm:w-auto">
            {dict.hero.primary}
          </ButtonLink>
          <ButtonLink href={localizedHref(locale, "login")} variant="outlineLight" className="w-full sm:w-auto">
            {dict.hero.secondary}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
