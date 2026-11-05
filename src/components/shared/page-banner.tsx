import Link from "next/link";

import Image, { type StaticImageData } from "next/image";

import { ChevronRight } from "lucide-react";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localizedHref } from "@/lib/helpers/routes";

interface PageBannerProps {
  title: string;
  image: StaticImageData;
  imagePosition?: string;
}

export async function PageBanner({ title, image, imagePosition = "object-center" }: PageBannerProps) {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);

  return (
    <section className="relative isolate overflow-hidden bg-night">
      <Image
        src={image}
        alt=""
        fill
        priority
        placeholder="blur"
        sizes="100vw"
        className={`-z-20 object-cover ${imagePosition}`}
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgb(16_20_26/0.9)_0%,rgb(16_20_26/0.74)_45%,rgb(16_20_26/0.5)_100%)]"/>

      <div className="container-site py-16 text-canvas md:py-24">
        <nav aria-label={dict.nav.breadcrumb} className="motion-safe:animate-[rise-in_800ms_var(--ease-out-expo)_both]">
          <ol className="flex flex-wrap items-center gap-1.5 text-[0.9375rem] font-medium">
            <li className="flex items-center gap-1.5">
              <Link
                href={localizedHref(locale, "home")}
                className="text-canvas/75 underline decoration-canvas/0 underline-offset-[0.3em] transition-colors hover:text-canvas hover:decoration-canvas/60"
              >
                {dict.nav.home}
              </Link>
              <ChevronRight aria-hidden className="size-4 text-canvas/50" strokeWidth={2}/>
            </li>
            <li aria-current="page" className="text-brand">{title}</li>
          </ol>
        </nav>
        <h1 className="mt-4 text-[clamp(2.5rem,6vw,4rem)] font-bold leading-[1.05] tracking-[-0.03em] motion-safe:animate-[rise-in_900ms_var(--ease-out-expo)_80ms_both]">
          {title}
        </h1>
      </div>
    </section>
  );
}
