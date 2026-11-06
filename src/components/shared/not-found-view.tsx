import Link from "next/link";

import { ButtonLink } from "@/components/ui/button-link";
import type { NotFoundCopy, NotFoundLinks } from "@/types/not-found";

interface NotFoundViewProps {
  copy: NotFoundCopy;
  links: NotFoundLinks;
  lang?: string;
  headingLevel?: "h1" | "h2";
  showCode?: boolean;
}

export function NotFoundView({ copy, links, lang, headingLevel = "h1", showCode = true }: NotFoundViewProps) {
  const Heading = headingLevel;

  return (
    <div lang={lang} className="max-w-xl">
      {showCode && <p aria-hidden className="mb-4 text-[clamp(4.5rem,14vw,8rem)] font-bold leading-none tracking-[-0.04em] text-brand">{copy.code}</p>}
      <Heading className="text-3xl font-bold text-ink sm:text-4xl">{copy.title}</Heading>
      <p className="mt-3 text-lg leading-relaxed text-ink-muted">{copy.body}</p>
      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
        <ButtonLink href={links.home} arrow>{copy.home}</ButtonLink>
        <Link href={links.courses} className="font-semibold text-ink underline decoration-brand decoration-2 underline-offset-[0.3em] transition-colors hover:decoration-ink">
          {copy.courses}
        </Link>
        <Link href={links.contact} className="font-semibold text-ink underline decoration-brand decoration-2 underline-offset-[0.3em] transition-colors hover:decoration-ink">
          {copy.contact}
        </Link>
      </div>
    </div>
  );
}
