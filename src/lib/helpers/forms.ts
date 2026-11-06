import { emailPattern } from "@/constants/forms";
import type { FieldIds } from "@/types/forms";

export function fieldIds(form: string, field: string): FieldIds {
  const input = `${form}-${field}`;
  return { input, error: `${input}-error` }
}

export function readFormString(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

export function isEmail(value: string) {
  return emailPattern.test(value);
}
