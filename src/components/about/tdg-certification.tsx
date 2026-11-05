import Image from "next/image";
import camrtLogo from "@/assets/images/camrt-logo.jpg";
import truckImage from "@/assets/images/tdg-truck.jpg";

import { getDictionary } from "@/i18n/dictionaries";

export async function TdgCertification() {
  const dict = await getDictionary();
  const { tdg } = dict.aboutPage;

  return (
    <section aria-labelledby="tdg-title" className="bg-canvas">
      <div className="container-site grid items-center gap-12 py-20 md:grid-cols-[0.8fr_1.2fr] md:gap-16 md:py-28 lg:gap-20">
        <figure className="mx-auto flex w-full max-w-sm flex-col items-center rounded-xl border border-line bg-canvas px-8 pt-10 pb-8 shadow-raise">
          <Image src={truckImage} alt={tdg.imageAlt} className="h-auto w-full max-w-[250px]"/>
          <figcaption className="mt-8 flex w-full flex-col items-center gap-3 border-t border-line pt-6">
            <span className="text-sm font-medium text-ink-subtle">{tdg.accreditedBy}</span>
            <Image src={camrtLogo} alt={tdg.camrtAlt} className="h-auto w-48"/>
          </figcaption>
        </figure>
        <div className="max-w-2xl">
          <h2 id="tdg-title" className="text-3xl font-bold text-ink sm:text-4xl">{tdg.title}</h2>
          <div className="mt-6 space-y-4">
            {tdg.paragraphs.map((paragraph) => (
              <p key={paragraph} className="leading-relaxed text-ink-muted">{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
