import type { PrivacySection } from "@/types/privacy";

interface PrivacyContentsProps {
  title: string;
  sections: PrivacySection[];
}

export function PrivacyContents({ title, sections }: PrivacyContentsProps) {
  return (
    <nav aria-labelledby="privacy-contents-title" className="lg:sticky lg:top-28">
      <h2 id="privacy-contents-title" className="text-sm font-semibold text-ink-muted">{title}</h2>
      <ol className="mt-3 space-y-1 border-l border-line">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className="-ml-px block border-l-2 border-transparent py-1.5 pl-4 text-[0.9375rem] text-ink-muted transition-colors hover:border-brand hover:text-ink"
            >
              {section.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
