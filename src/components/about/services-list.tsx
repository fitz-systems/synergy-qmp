import { SectionHeading } from "@/components/ui/section-heading";
import { getDictionary } from "@/i18n/dictionaries";

export async function ServicesList() {
  const dict = await getDictionary();

  return (
    <section aria-labelledby="services-title" className="bg-canvas-alt">
      <div className="container-site py-20 md:py-28">
        <SectionHeading id="services-title" title={dict.aboutPage.services.title}/>
        <ul className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-x-14">
          {dict.aboutPage.services.items.map((item) => (
            <li
              key={item.title}
              className="relative border-t border-line-strong pt-6 before:absolute before:-top-px before:left-0 before:h-0.5 before:w-10 before:bg-brand"
            >
              <h3 className="text-xl font-semibold text-ink">{item.title}</h3>
              <p className="mt-2 text-base leading-relaxed text-ink-muted">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
