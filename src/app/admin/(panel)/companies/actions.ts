"use server";

import { notFound, redirect } from "next/navigation";
import { adminRoutes, companyActionMessages } from "@/constants/admin";
import { createCompanies, createCompanyQuick, deleteCompany as deleteStoredCompany, mergeCompany as mergeStoredCompany, saveCompany as saveStoredCompany } from "@/lib/admin-distributor-mutations";
import { adminCompanyHref, positiveIdOf } from "@/lib/helpers/admin";
import { companyDistributorId, normalizeName, readCompanyForm, validateCompanyForm } from "@/lib/helpers/admin-distributors";
import { readFormString } from "@/lib/helpers/forms";
import { requireAdmin } from "@/lib/session";
import type { AdminActionResult, CompanyCreateResult, CompanyFormState } from "@/types/admin";

export async function saveCompany(companyId: number | null, _previous: CompanyFormState, formData: FormData): Promise<CompanyFormState> {
  const admin = await requireAdmin();
  if (companyId !== null && !Number.isInteger(companyId)) notFound();
  const values = readCompanyForm(formData);
  const errors = validateCompanyForm(values);
  if (Object.keys(errors).length > 0) return { status: "invalid", values, errors }

  let saved: Awaited<ReturnType<typeof saveStoredCompany>>;
  try {
    saved = await saveStoredCompany(admin.id, companyId, values.name, companyDistributorId(values));
  } catch (error) {
    console.error("Saving company failed", error);
    return { status: "failed", values, errors: {} }
  }
  if (!saved) notFound();
  if ("errors" in saved) return { status: "invalid", values, errors: saved.errors }

  redirect(adminCompanyHref(saved.id));
}

export async function createCompanyInline(name: string, distributorId: number | null): Promise<CompanyCreateResult> {
  const admin = await requireAdmin();
  const cleaned = typeof name === "string" ? normalizeName(name) : "";
  if (!cleaned) return { ok: false, error: companyActionMessages.nameRequired }
  if (distributorId !== null && !Number.isInteger(distributorId)) return { ok: false, error: companyActionMessages.distributorMissing }
  try {
    return await createCompanyQuick(admin.id, cleaned, distributorId);
  } catch (error) {
    console.error("Adding company failed", error);
    return { ok: false, error: companyActionMessages.failed }
  }
}

export async function createMissingCompanies(names: string[]): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  const cleaned = Array.isArray(names) ? names.filter((name) => typeof name === "string").map(normalizeName).filter(Boolean) : [];
  if (cleaned.length === 0) return { ok: true }
  try {
    return await createCompanies(admin.id, cleaned);
  } catch (error) {
    console.error("Adding companies from import failed", error);
    return { ok: false, error: companyActionMessages.failed }
  }
}

export async function deleteCompany(companyId: number): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  if (!Number.isInteger(companyId)) return { ok: false, error: companyActionMessages.notFound }

  let result: AdminActionResult;
  try {
    result = await deleteStoredCompany(admin.id, companyId);
  } catch (error) {
    console.error("Deleting company failed", error);
    return { ok: false, error: companyActionMessages.failed }
  }
  if (!result.ok) return result;
  redirect(adminRoutes.companies);
}

export async function mergeCompany(companyId: number, formData: FormData): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  const targetId = positiveIdOf(readFormString(formData, "target"));
  if (!Number.isInteger(companyId)) return { ok: false, error: companyActionMessages.notFound }
  if (targetId === undefined) return { ok: false, error: companyActionMessages.mergeTarget }

  let result: Awaited<ReturnType<typeof mergeStoredCompany>>;
  try {
    result = await mergeStoredCompany(admin.id, companyId, targetId);
  } catch (error) {
    console.error("Merging company failed", error);
    return { ok: false, error: companyActionMessages.failed }
  }
  if (!result.ok) return result;
  redirect(adminCompanyHref(targetId));
}
