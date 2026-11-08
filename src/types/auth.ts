import type { Dictionary } from "@/i18n/dictionaries";

export type LoginField = "email" | "password";

export type LoginFieldError = "required" | "invalidEmail";

export type LoginFormStatus = "idle" | "invalid" | "invalidCredentials" | "deactivated" | "rateLimited" | "failed";

export type LoginFailureStatus = Exclude<LoginFormStatus, "idle" | "invalid">;

export type LoginPageCopy = Dictionary["loginPage"];

export type LoginFormLabels = LoginPageCopy["form"];

export type LoginErrorLabels = LoginFormLabels["errors"];

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginFormState {
  status: LoginFormStatus;
  values: Omit<LoginCredentials, "password">;
  errors: Partial<Record<LoginField, LoginFieldError>>;
}

export type ForgotPasswordCopy = Dictionary["forgotPasswordPage"];

export type ResetPasswordCopy = Dictionary["resetPasswordPage"];

export type ForgotPasswordError = "required" | "invalidEmail";

export interface ForgotPasswordFormState {
  status: "idle" | "invalid" | "sent" | "rateLimited" | "failed";
  email: string;
  error?: ForgotPasswordError;
}

export type ResetPasswordField = "password" | "confirm";

export type ResetPasswordFieldError = "required" | "tooShort" | "mismatch";

export interface ResetPasswordFormState {
  status: "idle" | "invalid" | "done" | "expired" | "failed";
  errors: Partial<Record<ResetPasswordField, ResetPasswordFieldError>>;
}

export type UserRole = "student" | "admin";

export interface SessionUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  preferredLocale: string;
}

export interface AuthSessionRecord {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string | null;
  preferredLocale?: string | null;
}

export interface AuthUserProfile {
  email: string;
  firstName?: string;
  preferredLocale?: string;
}

export type RateLimitAction = "signIn" | "passwordReset";

export type RateLimitScope = "ip" | "email";

export interface RateLimitRule {
  scope: RateLimitScope;
  max: number;
  windowSeconds: number;
}
