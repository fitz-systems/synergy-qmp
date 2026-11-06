"use client";

import { CircleAlert, CircleCheck, Download, FileUp, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { importColumns, importKindLabels, statusToneIconStyles, statusToneStyles } from "@/constants/admin";
import { cn } from "@/lib/helpers/class-names";
import type { AdminQuiz, ImportKind, ImportPreviewRow } from "@/types/admin";

interface ImportPanelProps {
  preview: Record<ImportKind, ImportPreviewRow[]>;
  quizzes: AdminQuiz[];
}

interface ImportTabProps {
  kind: ImportKind;
  rows: ImportPreviewRow[];
  quizzes: AdminQuiz[];
}

// Todo: Parse the uploaded file, validate rows on the server and import them
export function ImportPanel({ preview, quizzes }: ImportPanelProps) {
  return (
    <Tabs defaultValue="users" className="gap-6">
      <TabsList>
        {(Object.keys(importKindLabels) as ImportKind[]).map((kind) => (
          <TabsTrigger key={kind} value={kind}>{importKindLabels[kind]}</TabsTrigger>
        ))}
      </TabsList>
      {(Object.keys(importKindLabels) as ImportKind[]).map((kind) => (
        <TabsContent key={kind} value={kind}>
          <ImportTab kind={kind} rows={preview[kind]} quizzes={quizzes}/>
        </TabsContent>
      ))}
    </Tabs>
  );
}

function ImportTab({ kind, rows, quizzes }: ImportTabProps) {
  const problems = rows.filter((row) => row.problem).length;
  const fileId = `import-file-${kind}`;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload a CSV file</CardTitle>
          <CardDescription>
            Columns: <span className="font-mono text-xs">{importColumns[kind].join(", ")}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {kind === "questions" && (
            <div className="grid gap-2 sm:w-80">
              <Label htmlFor="import-quiz">Add questions to</Label>
              <Select defaultValue={String(quizzes[0]?.id ?? "")}>
                <SelectTrigger id="import-quiz" className="w-full"><SelectValue/></SelectTrigger>
                <SelectContent>
                  {quizzes.map((quiz) => <SelectItem key={quiz.id} value={String(quiz.id)}>{quiz.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          <label
            htmlFor={fileId}
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed bg-muted/40 px-6 py-10 text-center transition-colors hover:bg-muted has-focus-visible:ring-2 has-focus-visible:ring-ring"
          >
            <Upload aria-hidden className="size-6 text-muted-foreground"/>
            <span className="text-sm font-medium">Drop a CSV file here, or click to choose one</span>
            <span className="text-xs text-muted-foreground">Up to 5,000 rows</span>
            <input id={fileId} type="file" accept=".csv,text/csv" className="sr-only"/>
          </label>
          <Button variant="outline" size="sm"><Download/>Download template</Button>
        </CardContent>
      </Card>

      <Card className="gap-0 py-0">
        <CardHeader className="border-b py-4">
          <CardTitle>Preview</CardTitle>
          <CardDescription className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5"><CircleCheck aria-hidden className={cn("size-4", statusToneIconStyles.success)}/>{rows.length - problems} ready</span>
            <span className="inline-flex items-center gap-1.5"><CircleAlert aria-hidden className={cn("size-4", statusToneIconStyles.danger)}/>{problems} with problems, skipped</span>
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
              {rows.map((row) => (
                <TableRow key={row.line} className={row.problem ? "bg-red-50/60 dark:bg-red-950/30" : undefined}>
                  <TableCell className="pl-4 tabular-nums text-muted-foreground">{row.line}</TableCell>
                  {row.values.map((value, index) => <TableCell key={index}>{value || <span className="text-muted-foreground">—</span>}</TableCell>)}
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
          <Button variant="outline">Clear</Button>
          <Button><FileUp/>Import {rows.length - problems} {importKindLabels[kind].toLowerCase()}</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
