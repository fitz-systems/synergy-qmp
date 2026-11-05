import { ButtonLink } from "@/components/ui/button-link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localizedHref } from "@/lib/helpers/routes";

export async function CtaBand() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);

  return (
    <section aria-labelledby="cta-title" className="bg-brand">
      <div className="container-site py-20 text-center md:py-24">
        <h2 id="cta-title" className="mx-auto max-w-2xl text-3xl font-bold text-ink sm:text-4xl">{dict.cta.title}</h2>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-on-brand">{dict.cta.body}</p>
        <ButtonLink href={localizedHref(locale, "contact")} variant="dark" arrow className="mt-8">
          {dict.cta.action}
        </ButtonLink>
      </div>
    </section>
  );
}
