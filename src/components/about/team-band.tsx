import Image from "next/image";
import teamImage from "@/assets/images/hero-hot-cell.jpg";

import { getDictionary } from "@/i18n/dictionaries";

export async function TeamBand() {
  const dict = await getDictionary();

  return (
    <section aria-labelledby="team-title" className="relative isolate overflow-hidden bg-night">
      <Image src={teamImage} alt="" fill placeholder="blur" sizes="100vw" className="-z-20 object-cover"/>
      <div aria-hidden className="absolute inset-0 -z-10 bg-night/[0.84]"/>
      <div className="container-site py-20 text-center md:py-28">
        <h2 id="team-title" className="text-3xl font-bold text-brand sm:text-4xl">{dict.aboutPage.team.title}</h2>
        <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-canvas/85 sm:text-xl sm:leading-relaxed">
          {dict.about.body}
        </p>
      </div>
    </section>
  );
}
