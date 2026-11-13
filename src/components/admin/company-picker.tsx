"use client";

import { useEffect, useId, useMemo, useRef, useState, useTransition } from "react";
import { ArrowLeft, Check, ChevronsUpDown, LoaderCircle, Plus, Search } from "lucide-react";
import { createCompanyInline } from "@/app/admin/(panel)/companies/actions";
import { SeatBalanceBadge } from "@/components/admin/admin-table-parts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { companyPickerLabels, noDistributorValue } from "@/constants/admin";
import { nameKey, normalizeName } from "@/lib/helpers/admin-distributors";
import { cn } from "@/lib/helpers/class-names";
import type { CompanyOption, CompanyPickerData, DistributorOption } from "@/types/admin";

interface CompanyPickerProps {
  id: string;
  name?: string;
  data: CompanyPickerData;
  value: string;
  onValueChange: (value: string, companies: CompanyOption[]) => void;
  allowNone?: boolean;
  allowCreate?: boolean;
  excludeId?: number;
  invalid?: boolean;
  describedBy?: string;
  labels?: Partial<Pick<typeof companyPickerLabels, "placeholder" | "none">>;
  showDistributor?: boolean;
}

interface PickerGroup {
  key: string;
  label: string;
  distributor?: DistributorOption;
  companies: CompanyOption[];
}

interface CreateFormProps {
  initialName: string;
  distributors: DistributorOption[];
  onCancel: () => void;
  onCreated: (company: CompanyOption) => void;
}

interface PickerOptionProps {
  id: string;
  index: number;
  active: boolean;
  selected: boolean;
  onHover: (index: number) => void;
  onChoose: () => void;
  children: React.ReactNode;
}

function pickerGroups(companies: CompanyOption[], distributors: DistributorOption[], query: string): PickerGroup[] {
  const needle = nameKey(query);
  const groups: PickerGroup[] = [
    ...distributors.map((distributor) => ({ key: String(distributor.id), label: distributor.name, distributor, companies: [] as CompanyOption[] })),
    { key: noDistributorValue, label: companyPickerLabels.noDistributor, companies: [] }
  ];
  const byKey = new Map(groups.map((group) => [group.key, group]));
  for (const company of companies) {
    const group = byKey.get(company.distributorId ? String(company.distributorId) : noDistributorValue) ?? byKey.get(noDistributorValue)!;
    if (!needle || company.name.toLowerCase().includes(needle) || (group.distributor && group.label.toLowerCase().includes(needle))) group.companies.push(company);
  }
  return groups.filter((group) => group.companies.length > 0);
}

function CreateCompanyForm({ initialName, distributors, onCancel, onCreated }: CreateFormProps) {
  const [name, setName] = useState(initialName);
  const [distributor, setDistributor] = useState(noDistributorValue);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const nameId = useId();
  const distributorId = useId();

  function create() {
    const cleaned = normalizeName(name);
    if (!cleaned) {
      setError("Enter the company name.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await createCompanyInline(cleaned, distributor === noDistributorValue ? null : Number(distributor));
      if (result.ok) onCreated(result.company);
      else setError(result.error);
    });
  }

  return (
    <div className="grid gap-4 p-4">
      <div className="grid gap-2">
        <Label htmlFor={nameId}>Company name</Label>
        <Input
          id={nameId}
          value={name}
          autoFocus
          autoComplete="off"
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== "Enter") return;
            event.preventDefault();
            create();
          }}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={distributorId}>Distributor</Label>
        <Select value={distributor} onValueChange={setDistributor}>
          <SelectTrigger id={distributorId} className="w-full"><SelectValue/></SelectTrigger>
          <SelectContent>
            <SelectItem value={noDistributorValue}>{companyPickerLabels.noDistributor}</SelectItem>
            {distributors.map((option) => <SelectItem key={option.id} value={String(option.id)}>{option.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">Students at this company use the distributor&apos;s seats.</p>
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex justify-between gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={pending}><ArrowLeft/>{companyPickerLabels.cancel}</Button>
        <Button type="button" size="sm" onClick={create} disabled={pending}>
          {pending && <LoaderCircle aria-hidden className="animate-spin"/>}
          {companyPickerLabels.create}
        </Button>
      </div>
    </div>
  );
}

export function CompanyPicker({ id, name, data, value, onValueChange, allowNone = true, allowCreate = true, excludeId, invalid, describedBy, labels, showDistributor = true }: CompanyPickerProps) {
  const text = { ...companyPickerLabels, ...labels }
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [query, setQuery] = useState("");
  const [companies, setCompanies] = useState(data.companies);
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const available = useMemo(() => companies.filter((company) => company.id !== excludeId), [companies, excludeId]);
  const groups = useMemo(() => pickerGroups(available, data.distributors, query), [available, data.distributors, query]);
  const showNone = allowNone && query.trim() === "";
  const options = useMemo(() => [...(showNone ? [null] : []), ...groups.flatMap((group) => group.companies)], [groups, showNone]);
  const selected = companies.find((company) => String(company.id) === value);
  const selectedDistributor = data.distributors.find((distributor) => distributor.id === selected?.distributorId);
  const exactMatch = available.some((company) => nameKey(company.name) === nameKey(query));

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  function changeOpen(next: boolean) {
    setOpen(next);
    if (next) return;
    setCreating(false);
    setQuery("");
  }

  function changeQuery(next: string) {
    setQuery(next);
    setActive(0);
  }

  function choose(company: CompanyOption | null, list = companies) {
    onValueChange(company ? String(company.id) : "", list);
    changeOpen(false);
  }

  function created(company: CompanyOption) {
    const next = [...companies, company].toSorted((a, b) => a.name.localeCompare(b.name));
    setCompanies(next);
    choose(company, next);
  }

  function keyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((current) => options.length === 0 ? 0 : (current + step + options.length) % options.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (options.length > 0) choose(options[Math.min(active, options.length - 1)]);
      else if (allowCreate && query.trim()) setCreating(true);
    }
  }

  let index = showNone ? 1 : 0;
  const optionId = (position: number) => `${listId}-${position}`;

  return (
    <Popover open={open} onOpenChange={changeOpen}>
      {name && <input type="hidden" name={name} value={value}/>}
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-invalid={invalid ? true : undefined}
          aria-describedby={describedBy}
          className="h-auto min-h-9 w-full justify-between px-3 py-1.5 text-left font-normal aria-invalid:border-destructive"
        >
          {selected ? (
            <span className="min-w-0">
              <span className="block truncate">{selected.name}</span>
              {showDistributor && <span className="block truncate text-xs text-muted-foreground">{selectedDistributor?.name ?? companyPickerLabels.noDistributor}</span>}
            </span>
          ) : (
            <span className="text-muted-foreground">{text.placeholder}</span>
          )}
          <ChevronsUpDown aria-hidden className="size-4 shrink-0 opacity-50"/>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-(--radix-popover-trigger-width) min-w-72 p-0">
        {creating ? (
          <CreateCompanyForm initialName={query} distributors={data.distributors} onCancel={() => setCreating(false)} onCreated={created}/>
        ) : (
          <>
            <div className="relative border-b">
              <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/>
              <input
                value={query}
                onChange={(event) => changeQuery(event.target.value)}
                onKeyDown={keyDown}
                placeholder={companyPickerLabels.search}
                aria-label={companyPickerLabels.search}
                role="combobox"
                aria-expanded
                aria-controls={listId}
                aria-activedescendant={options.length > 0 ? optionId(Math.min(active, options.length - 1)) : undefined}
                autoComplete="off"
                autoFocus
                className="h-10 w-full bg-transparent pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <div ref={listRef} id={listId} role="listbox" aria-label="Companies" className="max-h-72 overflow-y-auto p-1">
              {showNone && (
                <PickerOption id={optionId(0)} index={0} active={active === 0} selected={!selected} onHover={setActive} onChoose={() => choose(null)}>
                  <span className="text-muted-foreground">{text.none}</span>
                </PickerOption>
              )}
              {groups.map((group) => (
                <div key={group.key} role="group" aria-label={group.label}>
                  <div role="presentation" className="flex items-center gap-2 px-2 pb-1 pt-3 text-xs font-medium text-muted-foreground">
                    <span className="truncate">{group.label}</span>
                    {group.distributor && <SeatBalanceBadge balance={group.distributor.seatBalance} className="ml-auto"/>}
                  </div>
                  {group.companies.map((company) => {
                    const position = index++;
                    return (
                      <PickerOption key={company.id} id={optionId(position)} index={position} active={active === position} selected={company.id === selected?.id} onHover={setActive} onChoose={() => choose(company)}>
                        {company.name}
                      </PickerOption>
                    );
                  })}
                </div>
              ))}
              {options.length === 0 && <p className="px-2 py-6 text-center text-sm text-muted-foreground">{companyPickerLabels.noMatches}</p>}
            </div>
            {allowCreate && (
              <div className="border-t p-1">
                <button type="button" onClick={() => setCreating(true)} className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground">
                  <Plus aria-hidden className="size-4"/>
                  {query.trim() && !exactMatch ? <span className="truncate">{companyPickerLabels.add} &ldquo;{normalizeName(query)}&rdquo;</span> : companyPickerLabels.add}
                </button>
              </div>
            )}
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}

function PickerOption({ id, index, active, selected, onHover, onChoose, children }: PickerOptionProps) {
  return (
    <div
      id={id}
      role="option"
      aria-selected={selected}
      data-index={index}
      onMouseMove={() => onHover(index)}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onChoose}
      className={cn("flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm", active && "bg-accent text-accent-foreground")}
    >
      <Check aria-hidden className={cn("size-4 shrink-0", selected ? "opacity-100" : "opacity-0")}/>
      <span className="truncate">{children}</span>
    </div>
  );
}
