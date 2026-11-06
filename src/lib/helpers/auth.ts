import { APIError } from "better-auth/api";
import { initialLoginFormState, loginFields, loginRememberField, loginStatusByAuthError } from "@/constants/auth";
import type { LoginCredentials, LoginErrorLabels, LoginFailureStatus, LoginField, LoginFormLabels, LoginFormState } from "@/types/auth";
import type { NoticeLabels } from "@/types/forms";
import { interpolate } from "./format";
import { isEmail, readFormString } from "./forms";

export function readLoginForm(formData: FormData): LoginCredentials {
  return {
    email: readFormString(formData, "email"),
    password: String(formData.get("password") ?? ""),
    rememberMe: formData.get(loginRememberField) === "on"
  }
}

export function validateLoginForm(credentials: LoginCredentials): LoginFormState["errors"] {
  const errors: LoginFormState["errors"] = {}
  for (const field of loginFields) {
    if (!credentials[field]) errors[field] = "required";
  }
  if (!errors.email && !isEmail(credentials.email)) errors.email = "invalidEmail";
  return errors;
}

export function loginFieldErrorMessage(labels: LoginErrorLabels, errors: LoginFormState["errors"], field: LoginField) {
  const error = errors[field];
  if (!error) return undefined;
  return error === "required" ? labels.required[field] : labels.invalidEmail;
}

export function loginFailureStatus(error: unknown): LoginFailureStatus {
  return error instanceof APIError ? loginStatusByAuthError[error.status] ?? "failed" : "failed";
}

export function loginFailureState(credentials: LoginCredentials, status: LoginFormState["status"], errors: LoginFormState["errors"] = {}): LoginFormState {
  return { ...initialLoginFormState, status, errors, values: { email: credentials.email, rememberMe: credentials.rememberMe } }
}

export function loginNotice(labels: LoginFormLabels, status: LoginFormState["status"], email: string): NoticeLabels | null {
  if (status === "idle" || status === "invalid") return null;
  const notice = labels.notices[status];
  return { title: notice.title, body: interpolate(notice.body, { email }) }
}
