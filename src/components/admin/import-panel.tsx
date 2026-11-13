"use client";

import { useRef, useState, useTransition } from "react";
import { Building2, CircleAlert, CircleCheck, Download, FileText, FileUp, LoaderCircle, Plus, Ticket, Upload } from "lucide-react";
import { createMissingCompanies } from "@/app/admin/(panel)/companies/actions";
import { previewImport, runImport } from "@/app/admin/(panel)/import/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminRoutes, importColumns, importKindLabels, importMaxBytes, importMaxRows, importMessages, importPreviewLimit, statusToneIconStyles, statusToneStyles } from "@/constants/admin";
import { questionBankValue } from "@/lib/helpers/admin";
import { seatBalanceTone, seatCountLabel, seatsLeftLabel } from "@/lib/helpers/admin-distributors";
import { importCountLabel, importTemplate, importTemplateFileName } from "@/lib/helpers/admin-import";
import { cn } from "@/lib/helpers/class-names";
import { decodeCsvBytes } from "@/lib/helpers/csv";
import type { AdminActionResult, ImportKind, ImportPreview, ImportResult, ImportSeatUse, QuestionBank } from "@/types/admin";

interface ImportPanelProps {
  banks: QuestionBank[];
}

interface ImportTabProps {
  kind: ImportKind;
  banks: QuestionBank[];
}

interface ChosenFile {
  name: string;
  text: string;
}

interface MissingCompaniesProps {
  names: string[];
  pending: boolean;
  outcome: AdminActionResult | null;
  onAdd: () => void;
}

interface SeatUsesProps {
  seats: ImportSeatUse[];
}

const missingCompaniesShown = 8;

const importKinds = Object.keys(importKindLabels) as ImportKind[];

export function ImportPanel({ banks }: ImportPanelProps) {
  return (
    <Tabs defaultValue={importKinds[0]} className="gap-6">
      <TabsList>
        {importKinds.map((kind) => <TabsTrigger key={kind} value={kind}>{importKindLabels[kind]}</TabsTrigger>)}
      </TabsList>
      {importKinds.map((kind) => (
        <TabsContent key={kind} value={kind} forceMount className="data-[state=inactive]:hidden">
          <ImportTab kind={kind} banks={banks}/>
        </TabsContent>
      ))}
    </Tabs>
  );
}

function downloadTemplate(kind: ImportKind) {
  const url = URL.createObjectURL(new Blob([importTemplate(kind)], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = importTemplateFileName(kind);
  link.click();
  URL.revokeObjectURL(url);
}

function MissingCompanies({ names, pending, outcome, onAdd }: MissingCompaniesProps) {
  const listed = names.slice(0, missingCompaniesShown).join(", ");
  const more = names.length - missingCompaniesShown;
  const noun = names.length === 1 ? "company" : "companies";
  return (
    <div className={cn("flex flex-col gap-3 rounded-md border px-3 py-3 text-sm sm:flex-row sm:items-center sm:justify-between", statusToneStyles.warning)}>
      <div className="flex gap-2">
        <Building2 aria-hidden className="mt-0.5 size-4 shrink-0"/>
        <div>
          <p className="font-medium">{names.length} {noun} in this file {names.length === 1 ? "isn't" : "aren't"} in the company list, so {names.length === 1 ? "its rows are" : "their rows are"} skipped.</p>
          <p>{listed}{more > 0 ? `, and ${more} more` : ""}</p>
          <p className="mt-1 text-xs">Added companies have no distributor. If they belong to one, set it under <a href={adminRoutes.companies} target="_blank" rel="noreferrer" className="underline">Companies</a> before importing so the right seats are used.</p>
          {outcome && !outcome.ok && <p role="alert" className="mt-1 font-medium">{outcome.error}</p>}
        </div>
      </div>
      <Button type="button" variant="outline" size="sm" className="shrink-0 bg-background" onClick={onAdd} disabled={pending}>
        {pending ? <LoaderCircle aria-hidden className="animate-spin"/> : <Plus/>}
        Add {names.length === 1 ? "it" : `all ${names.length}`}
      </Button>
    </div>
  );
}

function SeatUses({ seats }: SeatUsesProps) {
  return (
    <div className="grid gap-1.5 rounded-md border px-3 py-3 text-sm">
      <p className="flex items-center gap-2 font-medium"><Ticket aria-hidden className="size-4 shrink-0 text-muted-foreground"/>Seats this import uses</p>
      <ul className="grid gap-1 pl-6">
        {seats.map((seat) => {
          const after = seat.balance - seat.used;
          return (
            <li key={seat.distributor} className="flex flex-wrap gap-x-2">
              <span className="font-medium">{seat.distributor}</span>
              <span className="text-muted-foreground">uses {seatCountLabel(seat.used)}: {seatsLeftLabel(seat.balance)} now,</span>
              <span className={cn(after < 0 ? statusToneIconStyles[seatBalanceTone(after)] : "text-muted-foreground")}>{seatsLeftLabel(after)} after</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ImportTab({ kind, banks }: ImportTabProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [bank, setBank] = useState(banks[0] ? questionBankValue(banks[0]) : "");
  const [file, setFile] = useState<ChosenFile | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [companiesOutcome, setCompaniesOutcome] = useState<AdminActionResult | null>(null);
  const [dragging, setDragging] = useState(false);
  const [pending, startTransition] = useTransition();
  const fileId = `import-file-${kind}`;

  function check(chosen: ChosenFile, bankValue: string) {
    setCompaniesOutcome(null);
    startTransition(async () => setPreview(await previewImport({ kind, bank: bankValue, fileName: chosen.name, text: chosen.text })));
  }

  function addMissingCompanies() {
    if (!file || !preview?.missingCompanies) return;
    const names = preview.missingCompanies;
    startTransition(async () => {
      const outcome = await createMissingCompanies(names);
      setCompaniesOutcome(outcome);
      if (outcome.ok) setPreview(await previewImport({ kind, bank, fileName: file.name, text: file.text }));
    });
  }

  async function choose(selected: File | undefined) {
    if (inputRef.current) inputRef.current.value = "";
    if (!selected) return;
    setResult(null);
    if (selected.size > importMaxBytes) {
      setFile(null);
      setPreview({ fileError: importMessages.tooLarge, rows: [], ready: 0 });
      return;
    }
    const chosen = { name: selected.name, text: decodeCsvBytes(await selected.arrayBuffer()) };
    setFile(chosen);
    check(chosen, bank);
  }

  function changeBank(value: string) {
    setBank(value);
    if (file) check(file, value);
  }

  function clear() {
    setFile(null);
    setPreview(null);
    setResult(null);
    setCompaniesOutcome(null);
  }

  function runIt() {
    if (!file || !preview) return;
    startTransition(async () => {
      const outcome = await runImport({ kind, bank, fileName: file.name, text: file.text }, preview.ready);
      setResult(outcome);
      if (outcome.ok) {
        setFile(null);
        setPreview(null);
      } else if (outcome.error === importMessages.changed) {
        setPreview(await previewImport({ kind, bank, fileName: file.name, text: file.text }));
      }
    });
  }

  const problems = preview ? preview.rows.length - preview.ready : 0;
  const shown = preview?.rows.slice(0, importPreviewLimit) ?? [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload a CSV file</CardTitle>
          <CardDescription>
            Columns: <span className="font-mono text-xs">{importColumns[kind].join(", ")}</span>
            {kind === "users" && <span className="mt-1 block">Course is ground or air, language is en or fr. Company can be blank or must match a company in the list (capitals and spacing don&apos;t matter). No emails are sent. Use Send password reset on each student to email them a welcome link to set their password.</span>}
            {kind === "questions" && <span className="mt-1 block">Correct is the letter of the right answer (A to D). Two answers like True / False or Vrai / Faux make a true / false question.</span>}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {kind === "questions" && (
            <div className="grid gap-2 sm:w-80">
              <Label htmlFor="import-bank">Add questions to</Label>
              <Select value={bank} onValueChange={changeBank} disabled={pending}>
                <SelectTrigger id="import-bank" className="w-full"><SelectValue/></SelectTrigger>
                <SelectContent>
                  {banks.map((option) => <SelectItem key={questionBankValue(option)} value={questionBankValue(option)}>{option.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          <label
            htmlFor={fileId}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              void choose(event.dataTransfer.files[0]);
            }}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed bg-muted/40 px-6 py-10 text-center transition-colors hover:bg-muted has-focus-visible:ring-2 has-focus-visible:ring-ring",
              dragging && "border-primary bg-primary/10"
            )}
          >
            {pending ? <LoaderCircle aria-hidden className="size-6 animate-spin text-muted-foreground"/> : <Upload aria-hidden className="size-6 text-muted-foreground"/>}
            <span className="text-sm font-medium">{file ? <span className="inline-flex items-center gap-1.5"><FileText aria-hidden className="size-4"/>{file.name}</span> : "Drop a CSV file here, or click to choose one"}</span>
            <span className="text-xs text-muted-foreground">Up to {importMaxRows.toLocaleString("en-CA")} rows and 900 KB</span>
            <input ref={inputRef} id={fileId} type="file" accept=".csv,text/csv" className="sr-only" disabled={pending} onChange={(event) => void choose(event.target.files?.[0])}/>
          </label>
          <Button type="button" variant="outline" size="sm" onClick={() => downloadTemplate(kind)}><Download/>Download template</Button>
          <div role="status" aria-live="polite">
            {result && (
              <p className={cn("flex items-center gap-2 rounded-md border px-3 py-2 text-sm", result.ok ? statusToneStyles.success : statusToneStyles.danger)}>
                {result.ok ? <CircleCheck aria-hidden className="size-4 shrink-0"/> : <CircleAlert aria-hidden className="size-4 shrink-0"/>}
                {result.ok ? result.message : result.error}
              </p>
            )}
            {preview?.fileError && (
              <p className={cn("flex items-center gap-2 rounded-md border px-3 py-2 text-sm", statusToneStyles.danger)}>
                <CircleAlert aria-hidden className="size-4 shrink-0"/>{preview.fileError}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {preview && !preview.fileError && (
        <Card className="gap-0 py-0">
          <CardHeader className="border-b py-4">
            <CardTitle>Preview</CardTitle>
            <CardDescription className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5"><CircleCheck aria-hidden className={cn("size-4", statusToneIconStyles.success)}/>{preview.ready} ready</span>
              <span className="inline-flex items-center gap-1.5"><CircleAlert aria-hidden className={cn("size-4", statusToneIconStyles.danger)}/>{problems} with problems, skipped</span>
              {preview.rows.length > shown.length && <span>Showing the first {shown.length} of {preview.rows.length} rows</span>}
            </CardDescription>
          </CardHeader>
          {(companiesOutcome?.ok && companiesOutcome.message || (preview.missingCompanies?.length ?? 0) > 0 || (preview.seats?.length ?? 0) > 0) && (
            <div className="grid gap-3 border-b p-4">
              {companiesOutcome?.ok && companiesOutcome.message && (
                <p role="status" className={cn("flex items-center gap-2 rounded-md border px-3 py-2 text-sm", statusToneStyles.success)}>
                  <CircleCheck aria-hidden className="size-4 shrink-0"/>{companiesOutcome.message}
                </p>
              )}
              {preview.missingCompanies && preview.missingCompanies.length > 0 && (
                <MissingCompanies names={preview.missingCompanies} pending={pending} outcome={companiesOutcome} onAdd={addMissingCompanies}/>
              )}
              {preview.seats && preview.seats.length > 0 && <SeatUses seats={preview.seats}/>}
            </div>
          )}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-14 pl-4">Line</TableHead>
                  {importColumns[kind].map((column) => <TableHead key={column} className="font-mono text-xs">{column}</TableHead>)}
                  <TableHead className="pr-4">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shown.map((row) => (
                  <TableRow key={row.line} className={row.problem ? "bg-red-50/60 dark:bg-red-950/30" : undefined}>
                    <TableCell className="pl-4 tabular-nums text-muted-foreground">{row.line}</TableCell>
                    {row.values.map((value, index) => <TableCell key={index} className="max-w-xs truncate">{value || <span className="text-muted-foreground">—</span>}</TableCell>)}
                    <TableCell className="pr-4">
                      {row.problem
                        ? <Badge variant="outline" className={cn("whitespace-normal", statusToneStyles.danger)}>{row.problem}</Badge>
                        : <Badge variant="outline" className={statusToneStyles.success}>Ready</Badge>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <CardFooter className="justify-end gap-2 border-t py-4">
            <Button type="button" variant="outline" onClick={clear} disabled={pending}>Clear</Button>
            <Button type="button" onClick={runIt} disabled={pending || preview.ready === 0}>
              {pending ? <LoaderCircle aria-hidden className="animate-spin"/> : <FileUp/>}
              Import {importCountLabel(kind, preview.ready)}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
