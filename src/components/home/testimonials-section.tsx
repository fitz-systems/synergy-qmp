import { SectionHeading } from "@/components/ui/section-heading";
import { testimonials } from "@/content/testimonials";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { Testimonials } from "./testimonials";

export async function TestimonialsSection() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);

  return (
    <section aria-labelledby="testimonials-title" className="bg-canvas">
      <div className="container-site py-20 md:py-28">
        <SectionHeading id="testimonials-title" title={dict.testimonials.title} subtitle={dict.testimonials.subtitle}/>
        <div className="mt-12">
          <Testimonials
            items={testimonials.map((item) => ({
              id: item.id,
              name: item.name,
              role: item.role[locale],
              quote: item.quote[locale]
            }))}
            labels={{
              previous: dict.testimonials.previous,
              next: dict.testimonials.next,
              list: dict.testimonials.listLabel
            }}
          />
        </div>
      </div>
    </section>
  );
}
