"use server";

import { refresh, updateTag } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { adminRoutes, courseActionMessages, questionActionMessages } from "@/constants/admin";
import { coursesCacheTag } from "@/constants/cache";
import { hasLocale } from "@/i18n/config";
import { deleteQuestion as deleteBankQuestion, saveQuestion as saveBankQuestion, setCourseMaterial, updateCourse } from "@/lib/admin-course-mutations";
import { adminQuestionsHref, isCourseOption } from "@/lib/helpers/admin";
import { readCourseForm, readQuestionForm, validateCourseForm, validateQuestionForm } from "@/lib/helpers/admin-courses";
import { requireAdmin } from "@/lib/session";
import type { AdminActionResult, CourseFormState, QuestionFormState } from "@/types/admin";

export async function saveCourse(code: string, _previous: CourseFormState, formData: FormData): Promise<CourseFormState> {
  const admin = await requireAdmin();
  if (!isCourseOption(code)) notFound();
  const values = readCourseForm(formData);
  const errors = validateCourseForm(values);
  if (Object.keys(errors).length > 0) return { status: "invalid", values, errors }

  let result: Awaited<ReturnType<typeof updateCourse>>;
  try {
    result = await updateCourse(admin.id, code, values);
  } catch (error) {
    console.error("Saving course failed", error);
    return { status: "failed", values, errors: {} }
  }
  if (!result) notFound();
  if ("errors" in result) return { status: "invalid", values, errors: result.errors }

  updateTag(coursesCacheTag);
  redirect(adminRoutes.courses);
}

export async function uploadCourseMaterial(code: string, locale: string, pathname: string): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  if (!isCourseOption(code) || !hasLocale(locale) || typeof pathname !== "string") return { ok: false, error: courseActionMessages.notFound }
  try {
    const result = await setCourseMaterial(admin.id, code, locale, pathname);
    if (result.ok) refresh();
    return result;
  } catch (error) {
    console.error("Saving course material failed", error);
    return { ok: false, error: courseActionMessages.uploadFailed }
  }
}

export async function saveQuestion(code: string, locale: string, questionId: number | null, _previous: QuestionFormState, formData: FormData): Promise<QuestionFormState> {
  const admin = await requireAdmin();
  if (!isCourseOption(code) || !hasLocale(locale) || (questionId !== null && !Number.isInteger(questionId))) notFound();
  const values = readQuestionForm(formData);
  const errors = validateQuestionForm(values);
  if (Object.keys(errors).length > 0) return { status: "invalid", values, errors }

  let result: Awaited<ReturnType<typeof saveBankQuestion>>;
  try {
    result = await saveBankQuestion(admin.id, code, locale, questionId, values);
  } catch (error) {
    console.error("Saving question failed", error);
    return { status: "failed", values, errors: {} }
  }
  if (!result) notFound();
  if ("errors" in result) return { status: "invalid", values, errors: result.errors }

  redirect(adminQuestionsHref(code, locale));
}

export async function deleteQuestion(code: string, locale: string, questionId: number): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  if (!isCourseOption(code) || !hasLocale(locale) || !Number.isInteger(questionId)) return { ok: false, error: questionActionMessages.notFound }

  let result: AdminActionResult;
  try {
    result = await deleteBankQuestion(admin.id, code, locale, questionId);
  } catch (error) {
    console.error("Deleting question failed", error);
    return { ok: false, error: questionActionMessages.failed }
  }
  if (!result.ok) return result;

  redirect(adminQuestionsHref(code, locale));
}
