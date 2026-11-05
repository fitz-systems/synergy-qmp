import Image from "next/image";
import statsImage from "@/assets/images/stats-glovebox.jpg";

import { getDictionary } from "@/i18n/dictionaries";

export async function StatsBand() {
  const dict = await getDictionary();

  return (
    <section aria-labelledby="stats-title" className="relative isolate overflow-hidden bg-night">
      <Image src={statsImage} alt="" fill placeholder="blur" sizes="100vw" className="-z-20 object-cover"/>
      <div aria-hidden className="absolute inset-0 -z-10 bg-night/[0.84]"/>
      <h2 id="stats-title" className="sr-only">{dict.stats.label}</h2>
      <dl className="container-site grid grid-cols-2 gap-y-12 py-20 md:grid-cols-4 md:py-24">
        {dict.stats.items.map((item, index) => (
          <div
            key={item.label}
            className={`flex flex-col-reverse items-center gap-2 text-center ${index > 0 ? "md:border-l md:border-canvas/15" : ""} ${index % 2 === 1 ? "border-l border-canvas/15" : ""}`}
          >
            <dt className="text-[0.9375rem] font-medium text-canvas/75">{item.label}</dt>
            <dd className="text-5xl font-semibold tabular-nums tracking-tight text-canvas lg:text-6xl">{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
