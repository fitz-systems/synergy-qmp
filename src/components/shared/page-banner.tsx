import Link from "next/link";

import Image, { type StaticImageData } from "next/image";

import { ChevronRight } from "lucide-react";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localizedHref } from "@/lib/helpers/routes";
import type { Crumb } from "@/types/navigation";

interface PageBannerProps {
  title: string;
  image: StaticImageData;
  subtitle?: string;
  current?: string | null;
  trail?: Crumb[];
  titleAsHeading?: boolean;
  imagePosition?: string;
}

export async function PageBanner({ title, image, subtitle, current = title, trail = [], titleAsHeading = true, imagePosition = "object-center" }: PageBannerProps) {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const crumbs = [{ label: dict.nav.home, href: localizedHref(locale, "home") }, ...trail];
  const Title = titleAsHeading ? "h1" : "p";

  return (
    <section className="relative isolate overflow-hidden bg-night [--focus-ring:var(--color-canvas)]">
      <Image
        src={image}
        alt=""
        fill
        priority
        placeholder="blur"
        sizes="100vw"
        className={`-z-20 object-cover ${imagePosition}`}
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-night/85 md:bg-transparent md:bg-[linear-gradient(90deg,rgb(16_20_26/0.9)_0%,rgb(16_20_26/0.74)_45%,rgb(16_20_26/0.5)_100%)]"/>

      <div className="container-site py-16 text-canvas md:py-24">
        <nav aria-label={dict.nav.breadcrumb} className="motion-safe:animate-[rise-in_800ms_var(--ease-out-expo)_both]">
          <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[0.9375rem] font-medium">
            {crumbs.map((crumb) => (
              <li key={crumb.href} className="flex items-center gap-1.5">
                <Link
                  href={crumb.href}
                  className="text-canvas/75 underline decoration-canvas/0 underline-offset-[0.3em] transition-colors hover:text-canvas hover:decoration-canvas/60"
                >
                  {crumb.label}
                </Link>
                <ChevronRight aria-hidden className="size-4 text-canvas/50" strokeWidth={2}/>
              </li>
            ))}
            {current && <li aria-current="page" className="text-brand">{current}</li>}
          </ol>
        </nav>
        <Title className="mt-4 text-[clamp(2.5rem,6vw,4rem)] font-bold leading-[1.05] tracking-[-0.03em] motion-safe:animate-[rise-in_900ms_var(--ease-out-expo)_80ms_both]">
          {title}
        </Title>
        {subtitle && (
          <p className="mt-3 text-lg font-medium text-canvas/80 motion-safe:animate-[rise-in_900ms_var(--ease-out-expo)_160ms_both] sm:text-xl">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
