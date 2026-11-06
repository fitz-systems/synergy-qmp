import Link from "next/link";

import { ChevronRight } from "lucide-react";
import type { Crumb } from "@/types/navigation";

interface StudentPageHeaderProps {
  title: string;
  crumbs: Crumb[];
  current: string;
  breadcrumbLabel: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function StudentPageHeader({ title, crumbs, current, breadcrumbLabel, subtitle, children }: StudentPageHeaderProps) {
  return (
    <div className="border-b border-line bg-canvas">
      <div className="container-site py-10 md:py-12">
        <nav aria-label={breadcrumbLabel}>
          <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[0.9375rem] font-medium">
            {crumbs.map((crumb) => (
              <li key={crumb.href} className="flex items-center gap-1.5">
                <Link href={crumb.href} className="text-ink-muted transition-colors hover:text-ink">{crumb.label}</Link>
                <ChevronRight aria-hidden className="size-4 text-ink-subtle" strokeWidth={2}/>
              </li>
            ))}
            <li aria-current="page" className="text-brand-ink">{current}</li>
          </ol>
        </nav>
        <h1 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 text-lg font-medium text-ink-muted">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}
