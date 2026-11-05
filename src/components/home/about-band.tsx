import Image from "next/image";
import Link from "next/link";
import bookImage from "@/assets/images/course-book.png";

import { ArrowRight } from "lucide-react";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localizedHref } from "@/lib/helpers/routes";

export async function AboutBand() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);

  return (
    <section aria-labelledby="about-title" className="bg-brand">
      <div className="container-site grid items-center gap-12 py-20 md:grid-cols-[0.9fr_1.1fr] md:gap-16 md:py-20 lg:py-24">
        <div className="flex justify-center">
          <Image
            src={bookImage}
            alt={dict.about.imageAlt}
            sizes="(min-width: 1024px) 352px, (min-width: 768px) 320px, 240px"
            className="w-60 drop-shadow-[0_28px_30px_rgb(61_38_0/0.3)] md:w-80 lg:w-[22rem]"
          />
        </div>
        <div className="max-w-xl">
          <h2 id="about-title" className="text-3xl font-bold text-ink sm:text-4xl">{dict.about.title}</h2>
          <p className="mt-2 text-lg font-medium text-on-brand">{dict.about.subtitle}</p>
          <p className="mt-6 leading-relaxed text-ink">{dict.about.body}</p>
          <Link
            href={localizedHref(locale, "about")}
            className="group mt-8 inline-flex items-center gap-2 font-semibold text-ink underline decoration-ink/30 decoration-2 underline-offset-[0.3em] transition-colors hover:decoration-ink"
          >
            {dict.about.link}
            <ArrowRight aria-hidden className="size-4 transition-transform duration-300 ease-out-expo group-hover:translate-x-1" strokeWidth={2}/>
          </Link>
        </div>
      </div>
    </section>
  );
}
