import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { enrollmentStatusLabels, statusToneStyles } from "@/constants/admin";
import { cn } from "@/lib/helpers/class-names";
import type { AdminTableFilter, EnrollmentStatus } from "@/types/admin";

interface StatusBadgeProps {
  status: EnrollmentStatus;
}

interface ToggleBadgeProps {
  on: boolean;
  onLabel: string;
  offLabel: string;
}

interface AdminTableToolbarProps {
  searchLabel: string;
  filters?: AdminTableFilter[];
}

interface AdminTablePaginationProps {
  from: number;
  to: number;
  total: number;
  noun: string;
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

// Todo: Wire search, filters and paging to server-side queries (TanStack Table)
export function AdminTableToolbar({ searchLabel, filters = [] }: AdminTableToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative sm:w-80">
        <Search aria-hidden className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/>
        <Input type="search" placeholder={searchLabel} aria-label={searchLabel} className="bg-background pl-8"/>
      </div>
      {filters.map((filter) => (
        <Select key={filter.label}>
          <SelectTrigger aria-label={filter.label} className="bg-background sm:w-44">
            <SelectValue placeholder={filter.label}/>
          </SelectTrigger>
          <SelectContent>
            {filter.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
    </div>
  );
}

export function AdminTablePagination({ from, to, total, noun }: AdminTablePaginationProps) {
  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t px-4 py-3 sm:flex-row">
      <p className="text-sm text-muted-foreground">Showing {from}–{to} of {total} {noun}</p>
      <Pagination className="mx-0 w-auto">
        <PaginationContent>
          <PaginationItem><PaginationPrevious href="#" aria-disabled className="pointer-events-none opacity-50"/></PaginationItem>
          <PaginationItem><PaginationNext href="#"/></PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
