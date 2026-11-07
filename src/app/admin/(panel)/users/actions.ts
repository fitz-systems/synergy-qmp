"use server";

import { refresh, revalidateTag } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { enrollmentsCacheTag, userActionMessages, welcomeFailedParam } from "@/constants/admin";
import { Prisma } from "@/generated/prisma/client";
import { clearStudentPass, createStudent, markStudentPassed, reissueStudentCertificate, resetStudentAttempts, sendStudentPasswordReset, setStudentActive, setStudentPaid, updateStudent } from "@/lib/admin-user-mutations";
import { adminUserHref, parseDateInput, readUserForm, validateUserForm } from "@/lib/helpers/admin";
import { readFormString } from "@/lib/helpers/forms";
import { resolveLocale } from "@/lib/helpers/locale";
import { requestPasswordResetLink, requireAdmin } from "@/lib/session";
import type { AdminActionResult, UserFormState } from "@/types/admin";

function isUniqueViolation(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export async function saveUser(userId: number | null, _previous: UserFormState, formData: FormData): Promise<UserFormState> {
  const admin = await requireAdmin();
  const values = readUserForm(formData);
  const errors = validateUserForm(values);
  if (Object.keys(errors).length > 0) return { status: "invalid", values, errors }

  if (userId !== null && !Number.isInteger(userId)) notFound();

  let result: Awaited<ReturnType<typeof createStudent>>;
  try {
    result = userId === null ? await createStudent(admin.id, values) : await updateStudent(admin.id, userId, values);
  } catch (error) {
    if (isUniqueViolation(error)) return { status: "invalid", values, errors: { email: "emailTaken" } }
    console.error("Saving user failed", error);
    return { status: "failed", values, errors: {} }
  }
  if (!result) notFound();
  if ("errors" in result) return { status: "invalid", values, errors: result.errors }
  const savedId = result.id;

  revalidateTag(enrollmentsCacheTag, "max");
  let welcomeFailed = false;
  if (userId === null && values.sendWelcome) {
    // Todo: Send a dedicated welcome email instead of the password reset email
    try {
      await requestPasswordResetLink(values.email, resolveLocale(values.locale));
    } catch (error) {
      console.error("Welcome email failed", error);
      welcomeFailed = true;
    }
  }

  redirect(welcomeFailed ? `${adminUserHref(savedId)}?${welcomeFailedParam}=failed` : adminUserHref(savedId));
}

async function runUserAction(userId: number, work: (adminId: number) => Promise<AdminActionResult>): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  if (!Number.isInteger(userId)) return { ok: false, error: userActionMessages.notFound }
  try {
    const result = await work(admin.id);
    if (result.ok) refresh();
    return result;
  } catch (error) {
    console.error("Admin user action failed", error);
    return { ok: false, error: userActionMessages.failed }
  }
}

export async function sendPasswordReset(userId: number) {
  return runUserAction(userId, (adminId) => sendStudentPasswordReset(adminId, userId));
}

export async function setUserActive(userId: number, active: boolean) {
  return runUserAction(userId, (adminId) => setStudentActive(adminId, userId, active === true));
}

export async function resetAttempts(userId: number) {
  return runUserAction(userId, (adminId) => resetStudentAttempts(adminId, userId));
}

export async function setPaid(userId: number, paid: boolean) {
  return runUserAction(userId, (adminId) => setStudentPaid(adminId, userId, paid === true));
}

export async function markPassed(userId: number, formData: FormData) {
  return runUserAction(userId, (adminId) => markStudentPassed(adminId, userId, parseDateInput(readFormString(formData, "passedOn"))));
}

export async function clearPass(userId: number) {
  return runUserAction(userId, (adminId) => clearStudentPass(adminId, userId));
}

export async function reissueCertificate(userId: number) {
  return runUserAction(userId, (adminId) => reissueStudentCertificate(adminId, userId));
}
