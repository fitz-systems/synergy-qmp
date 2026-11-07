import Link from "next/link";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { enrollmentStatusLabels, statusToneStyles } from "@/constants/admin";
import { cn } from "@/lib/helpers/class-names";
import type { EnrollmentStatus } from "@/types/admin";

interface StatusBadgeProps {
  status: EnrollmentStatus;
}

interface ToggleBadgeProps {
  on: boolean;
  onLabel: string;
  offLabel: string;
}

interface AdminTablePaginationProps {
  from: number;
  to: number;
  total: number;
  noun: string;
  previousHref?: string;
  nextHref?: string;
}

interface PageLinkProps {
  href?: string;
  label: string;
  children: React.ReactNode;
}

const statusStyles: Record<EnrollmentStatus, string> = {
  passed: statusToneStyles.success,
  inProgress: statusToneStyles.warning,
  notStarted: statusToneStyles.neutral,
  failed: statusToneStyles.danger
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return <Badge variant="outline" className={cn("font-medium", statusStyles[status])}>{enrollmentStatusLabels[status]}</Badge>;
}

export function ToggleBadge({ on, onLabel, offLabel }: ToggleBadgeProps) {
  return (
    <Badge variant="outline" className={cn("font-medium", on ? statusToneStyles.success : statusToneStyles.neutral)}>
      {on ? onLabel : offLabel}
    </Badge>
  );
}

function PageLink({ href, label, children }: PageLinkProps) {
  if (!href) return <Button variant="ghost" size="sm" disabled aria-label={label}>{children}</Button>;
  return <Button variant="ghost" size="sm" asChild><Link href={href} aria-label={label} scroll={false}>{children}</Link></Button>;
}

export function AdminTablePagination({ from, to, total, noun, previousHref, nextHref }: AdminTablePaginationProps) {
  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t px-4 py-3 sm:flex-row">
      <p className="text-sm text-muted-foreground">
        {total === 0 ? `No ${noun}` : `Showing ${from.toLocaleString("en-CA")}–${to.toLocaleString("en-CA")} of ${total.toLocaleString("en-CA")} ${noun}`}
      </p>
      <nav aria-label="Pagination" className="flex gap-1">
        <PageLink href={previousHref} label="Previous page"><ChevronLeft/>Previous</PageLink>
        <PageLink href={nextHref} label="Next page">Next<ChevronRight/></PageLink>
      </nav>
    </div>
  );
}
