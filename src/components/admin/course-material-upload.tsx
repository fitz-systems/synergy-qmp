"use client";

import { useRef, useState, useTransition } from "react";
import { upload } from "@vercel/blob/client";
import { FileText, LoaderCircle, Upload } from "lucide-react";
import { uploadCourseMaterial } from "@/app/admin/(panel)/courses/actions";
import { Button } from "@/components/ui/button";
import { adminCourseMaterialHref, courseActionMessages, courseMaterialContentType, courseMaterialMaxBytes } from "@/constants/admin";
import type { Locale } from "@/i18n/config";
import { adminCourseMaterialViewHref } from "@/lib/helpers/admin";
import { cn } from "@/lib/helpers/class-names";
import { courseMaterialKey } from "@/lib/helpers/course-material";
import type { AdminActionResult } from "@/types/admin";
import type { CourseCode } from "@/types/courses";

interface CourseMaterialUploadProps {
  code: CourseCode;
  locale: Locale;
  label: string;
  uploaded: boolean;
}

export function CourseMaterialUpload({ code, locale, label, uploaded }: CourseMaterialUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<AdminActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  function choose(file: File | undefined) {
    if (inputRef.current) inputRef.current.value = "";
    if (!file) return;
    if (file.type !== courseMaterialContentType) return setResult({ ok: false, error: courseActionMessages.notPdf });
    if (file.size > courseMaterialMaxBytes) return setResult({ ok: false, error: courseActionMessages.tooLarge });

    setResult(null);
    startTransition(async () => {
      try {
        const blob = await upload(courseMaterialKey(code, locale), file, {
          access: "private",
          handleUploadUrl: adminCourseMaterialHref,
          clientPayload: JSON.stringify({ code, locale }),
          contentType: courseMaterialContentType,
          multipart: true
        });
        setResult(await uploadCourseMaterial(code, locale, blob.pathname));
      } catch (error) {
        console.error("Course material upload failed", error);
        setResult({ ok: false, error: courseActionMessages.uploadFailed });
      }
    });
  }

  const message = result ? (result.ok ? result.message : result.error) : undefined;

  return (
    <div className="grid gap-2">
      <p className="text-sm font-medium">Course material ({label})</p>
      <div className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2 text-sm">
          <FileText aria-hidden className="size-4 text-muted-foreground"/>
          {uploaded
            ? <a href={adminCourseMaterialViewHref(code, locale)} target="_blank" rel="noreferrer" className="hover:underline">View current PDF</a>
            : <span className="text-red-700 dark:text-red-400">No PDF uploaded yet</span>}
        </p>
        <input ref={inputRef} type="file" accept={courseMaterialContentType} className="sr-only" tabIndex={-1} aria-hidden onChange={(event) => choose(event.target.files?.[0])}/>
        <Button type="button" variant="outline" size="sm" disabled={pending} onClick={() => inputRef.current?.click()}>
          {pending ? <LoaderCircle aria-hidden className="animate-spin"/> : <Upload/>}
          {pending ? "Uploading…" : uploaded ? "Replace PDF" : "Upload PDF"}
        </Button>
      </div>
      <p role="status" className={cn("text-sm", result?.ok ? "text-muted-foreground" : "text-destructive")}>{message}</p>
      <p className="text-xs text-muted-foreground">Stored privately. Only enrolled students who are logged in can open it. Students get the new PDF as soon as it&apos;s uploaded.</p>
    </div>
  );
}
