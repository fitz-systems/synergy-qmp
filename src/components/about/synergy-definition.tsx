import { getDictionary } from "@/i18n/dictionaries";

export async function SynergyDefinition() {
  const dict = await getDictionary();
  const { term, body } = dict.aboutPage.definition;

  return (
    <section aria-labelledby="definition-title" className="bg-canvas">
      <div className="container-site py-20 text-center md:py-28">
        <h2 id="definition-title" className="text-4xl font-bold tracking-[-0.03em] text-ink sm:text-5xl">
          <dfn className="not-italic">{term}</dfn><span aria-hidden className="text-brand-ink">;</span>
        </h2>
        <p className="mx-auto mt-5 max-w-3xl text-xl leading-relaxed text-ink-muted sm:text-2xl sm:leading-relaxed">
          {body}
        </p>
      </div>
    </section>
  );
}
