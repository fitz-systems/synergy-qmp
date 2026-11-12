import { APIError } from "better-auth/api";
import { adminRole, initialLoginFormState, invalidTokenCode, loginFields, loginRememberField, loginStatusByAuthError, passwordMinLength, resetLinkCallbackParam, resetPasswordFields } from "@/constants/auth";
import { defaultLocale, type Locale } from "@/i18n/config";
import type { AuthSessionRecord, ForgotPasswordCopy, ForgotPasswordError, LoginCredentials, LoginErrorLabels, LoginFailureStatus, LoginField, LoginFormLabels, LoginFormState, ResetPasswordCopy, ResetPasswordField, ResetPasswordFormState, SessionUser, SetPasswordCopy } from "@/types/auth";
import type { NoticeLabels } from "@/types/forms";
import { interpolate } from "./format";
import { isEmail, readFormString } from "./forms";
import { localizedHref } from "./routes";

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

export function validateForgotPasswordEmail(email: string): ForgotPasswordError | undefined {
  if (!email) return "required";
  if (!isEmail(email)) return "invalidEmail";
  return undefined;
}

export function forgotPasswordErrorMessage(labels: ForgotPasswordCopy["errors"], error?: ForgotPasswordError) {
  return error ? labels[error] : undefined;
}

export function readResetPasswordForm(formData: FormData): Record<ResetPasswordField, string> {
  return { password: String(formData.get("password") ?? ""), confirm: String(formData.get("confirm") ?? "") }
}

export function validateResetPassword(values: Record<ResetPasswordField, string>): ResetPasswordFormState["errors"] {
  const errors: ResetPasswordFormState["errors"] = {}
  for (const field of resetPasswordFields) {
    if (!values[field]) errors[field] = "required";
  }
  if (!errors.password && values.password.length < passwordMinLength) errors.password = "tooShort";
  if (!errors.password && !errors.confirm && values.password !== values.confirm) errors.confirm = "mismatch";
  return errors;
}

export function resetPasswordErrorMessage(labels: ResetPasswordCopy["errors"], errors: ResetPasswordFormState["errors"], field: ResetPasswordField) {
  const error = errors[field];
  if (!error) return undefined;
  if (error === "required") return labels.required[field];
  if (error === "tooShort") return interpolate(labels.tooShort, { min: passwordMinLength });
  return labels.mismatch;
}

export function resetFailureStatus(error: unknown): ResetPasswordFormState["status"] {
  return error instanceof APIError && error.body?.code === invalidTokenCode ? "expired" : "failed";
}

export function sessionUser(user: AuthSessionRecord): SessionUser {
  return {
    id: Number(user.id),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role === adminRole ? adminRole : "student",
    preferredLocale: user.preferredLocale ?? defaultLocale
  }
}

export function resetTokenFromQuery(query: Record<string, string | string[] | undefined>) {
  const { token, error } = query;
  return typeof token === "string" && token && !error ? token : null;
}

export function setPasswordCopy(reset: ResetPasswordCopy, overrides: SetPasswordCopy): ResetPasswordCopy {
  return {
    ...reset,
    metaTitle: overrides.metaTitle,
    title: overrides.title,
    body: overrides.body,
    submit: overrides.submit,
    done: { ...reset.done, ...overrides.done },
    expired: { ...reset.expired, ...overrides.expired }
  }
}

export function welcomeLinkUrl(url: string, locale: Locale) {
  const link = new URL(url);
  link.searchParams.set(resetLinkCallbackParam, localizedHref(locale, "setPassword"));
  return link.toString();
}
