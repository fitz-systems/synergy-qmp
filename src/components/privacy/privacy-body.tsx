import type { PrivacySection } from "@/types/privacy";

interface PrivacyBodyProps {
  sections: PrivacySection[];
}

export function PrivacyBody({ sections }: PrivacyBodyProps) {
  return (
    <div className="max-w-[68ch] space-y-12">
      {sections.map((section) => (
        <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`} className="scroll-mt-28">
          <h2 id={`${section.id}-title`} className="text-2xl font-bold text-ink">{section.title}</h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph} className="mt-3 leading-relaxed text-ink-muted">{paragraph}</p>
          ))}
          {section.items && (
            <ul className="mt-4 space-y-3">
              {section.items.map((item) => (
                <li key={item} className="flex gap-3 leading-relaxed text-ink-muted">
                  <span aria-hidden className="mt-[0.7em] size-1.5 shrink-0 rounded-full bg-brand-ink"/>
                  {item}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}
