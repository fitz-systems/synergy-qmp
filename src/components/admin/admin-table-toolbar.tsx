"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LoaderCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adminFilterAll, adminSearchDebounceMs, adminSearchParam } from "@/constants/admin";
import { adminListHref } from "@/lib/helpers/admin";
import type { AdminTableFilter } from "@/types/admin";

interface AdminTableToolbarProps {
  searchLabel: string;
  filters?: AdminTableFilter[];
  values?: Record<string, string>;
}

export function AdminTableToolbar({ searchLabel, filters = [], values = {} }: AdminTableToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState(values[adminSearchParam] ?? "");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function navigate(next: Record<string, string>) {
    window.clearTimeout(timer.current);
    startTransition(() => router.replace(adminListHref(pathname, next), { scroll: false }));
  }

  function changeSearch(value: string) {
    setSearch(value);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => navigate({ ...values, [adminSearchParam]: value.trim() }), adminSearchDebounceMs);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center" aria-busy={pending}>
      <div className="relative sm:w-80">
        {pending
          ? <LoaderCircle aria-hidden className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground"/>
          : <Search aria-hidden className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/>}
        <Input
          type="search"
          value={search}
          onChange={(event) => changeSearch(event.target.value)}
          placeholder={searchLabel}
          aria-label={searchLabel}
          className="bg-background pl-8"
        />
      </div>
      {filters.map((filter) => (
        <Select
          key={filter.param}
          value={values[filter.param] ?? adminFilterAll}
          onValueChange={(value) => navigate({ ...values, [adminSearchParam]: search.trim(), [filter.param]: value })}
        >
          <SelectTrigger aria-label={filter.label} className="bg-background sm:w-44">
            <SelectValue placeholder={filter.label}/>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={adminFilterAll}>{filter.allLabel}</SelectItem>
            {filter.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
    </div>
  );
}
