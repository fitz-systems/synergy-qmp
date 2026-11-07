"use server";

import { revalidateTag } from "next/cache";
import { enrollmentsCacheTag, importMessages } from "@/constants/admin";
import { importRows, previewImportRows } from "@/lib/admin-import";
import { requireAdmin } from "@/lib/session";
import type { ImportPreview, ImportRequest, ImportResult } from "@/types/admin";

function isImportRequest(request: ImportRequest) {
  return (request.kind === "users" || request.kind === "questions") && typeof request.text === "string" && typeof request.bank === "string" && typeof request.fileName === "string";
}

export async function previewImport(request: ImportRequest): Promise<ImportPreview> {
  await requireAdmin();
  if (!isImportRequest(request)) return { fileError: importMessages.unreadable, rows: [], ready: 0 }
  try {
    return await previewImportRows(request);
  } catch (error) {
    console.error("Import preview failed", error);
    return { fileError: importMessages.unreadable, rows: [], ready: 0 }
  }
}

export async function runImport(request: ImportRequest, expected: number): Promise<ImportResult> {
  const admin = await requireAdmin();
  if (!isImportRequest(request) || !Number.isInteger(expected)) return { ok: false, error: importMessages.unreadable }

  let result: ImportResult;
  try {
    result = await importRows(admin.id, request, expected);
  } catch (error) {
    console.error("Import failed", error);
    return { ok: false, error: importMessages.failed }
  }
  if (result.ok && result.kind === "users") revalidateTag(enrollmentsCacheTag, "max");
  return result;
}
