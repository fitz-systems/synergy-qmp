"use client";

import { useRef, useState, useTransition } from "react";
import { CircleAlert, CircleCheck, Download, FileText, FileUp, LoaderCircle, Upload } from "lucide-react";
import { previewImport, runImport } from "@/app/admin/(panel)/import/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { importColumns, importKindLabels, importMaxBytes, importMaxRows, importMessages, importPreviewLimit, statusToneIconStyles, statusToneStyles } from "@/constants/admin";
import { questionBankValue } from "@/lib/helpers/admin";
import { importTemplate, importTemplateFileName } from "@/lib/helpers/admin-import";
import { cn } from "@/lib/helpers/class-names";
import { decodeCsvBytes } from "@/lib/helpers/csv";
import type { ImportKind, ImportPreview, ImportResult, QuestionBank } from "@/types/admin";

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

function ImportTab({ kind, banks }: ImportTabProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [bank, setBank] = useState(banks[0] ? questionBankValue(banks[0]) : "");
  const [file, setFile] = useState<ChosenFile | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [dragging, setDragging] = useState(false);
  const [pending, startTransition] = useTransition();
  const fileId = `import-file-${kind}`;
  const label = importKindLabels[kind].toLowerCase();

  function check(chosen: ChosenFile, bankValue: string) {
    startTransition(async () => setPreview(await previewImport({ kind, bank: bankValue, fileName: chosen.name, text: chosen.text })));
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
            {kind === "users" && <span className="mt-1 block">Course is ground or air, language is en or fr. No emails are sent. Use Send password reset on each student to email them a welcome link to set their password.</span>}
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
              Import {preview.ready} {label}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
