import { SectionHeading } from "@/components/ui/section-heading";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { getPublishedReviews } from "@/lib/courses";
import { Testimonials } from "./testimonials";

export async function TestimonialsSection() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const reviews = await getPublishedReviews(locale);
  if (reviews.length === 0) return null;

  return (
    <section aria-labelledby="testimonials-title" className="bg-canvas">
      <div className="container-site py-20 md:py-28">
        <SectionHeading id="testimonials-title" title={dict.testimonials.title} subtitle={dict.testimonials.subtitle}/>
        <div className="mt-12">
          <Testimonials
            items={reviews.map((review) => ({
              id: review.id,
              name: review.author,
              role: review.roleCompany,
              quote: review.body
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
