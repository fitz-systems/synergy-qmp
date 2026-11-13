"use server";

import { refresh } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { adminRoutes, distributorActionMessages } from "@/constants/admin";
import { adjustSeats as adjustStoredSeats, deleteDistributor as deleteStoredDistributor, saveDistributor as saveStoredDistributor } from "@/lib/admin-distributor-mutations";
import { adminDistributorHref } from "@/lib/helpers/admin";
import { readDistributorForm, seatAmountOf, validateDistributorForm } from "@/lib/helpers/admin-distributors";
import { readFormString } from "@/lib/helpers/forms";
import { requireAdmin } from "@/lib/session";
import type { AdminActionResult, DistributorFormState, SeatAdjustment } from "@/types/admin";

export async function saveDistributor(distributorId: number | null, _previous: DistributorFormState, formData: FormData): Promise<DistributorFormState> {
  const admin = await requireAdmin();
  if (distributorId !== null && !Number.isInteger(distributorId)) notFound();
  const values = readDistributorForm(formData);
  const errors = validateDistributorForm(values, distributorId === null);
  if (Object.keys(errors).length > 0) return { status: "invalid", values, errors }

  let saved: Awaited<ReturnType<typeof saveStoredDistributor>>;
  try {
    saved = await saveStoredDistributor(admin.id, distributorId, values);
  } catch (error) {
    console.error("Saving distributor failed", error);
    return { status: "failed", values, errors: {} }
  }
  if (!saved) notFound();
  if ("errors" in saved) return { status: "invalid", values, errors: saved.errors }

  redirect(adminDistributorHref(saved.id));
}

export async function deleteDistributor(distributorId: number): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  if (!Number.isInteger(distributorId)) return { ok: false, error: distributorActionMessages.notFound }

  let result: AdminActionResult;
  try {
    result = await deleteStoredDistributor(admin.id, distributorId);
  } catch (error) {
    console.error("Deleting distributor failed", error);
    return { ok: false, error: distributorActionMessages.failed }
  }
  if (!result.ok) return result;
  redirect(adminRoutes.distributors);
}

export async function adjustSeats(distributorId: number, adjustment: SeatAdjustment, formData: FormData): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  if (!Number.isInteger(distributorId)) return { ok: false, error: distributorActionMessages.notFound }
  const kind: SeatAdjustment = adjustment === "set" ? "set" : "add";
  const amount = seatAmountOf(readFormString(formData, "amount"), kind);
  if (amount === null) return { ok: false, error: kind === "add" ? distributorActionMessages.invalidAmount : distributorActionMessages.invalidBalance }
  const note = readFormString(formData, "note").replace(/\s+/g, " ").slice(0, 200);

  try {
    const result = await adjustStoredSeats(admin.id, distributorId, kind, amount, note);
    if (result.ok) refresh();
    return result;
  } catch (error) {
    console.error("Adjusting seats failed", error);
    return { ok: false, error: distributorActionMessages.failed }
  }
}
