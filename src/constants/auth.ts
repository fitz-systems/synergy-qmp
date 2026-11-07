import type { Route } from "@/constants/routes";
import type { ForgotPasswordFormState, LoginFailureStatus, LoginField, LoginFormState, ResetPasswordField, ResetPasswordFormState, UserRole } from "@/types/auth";

export const loginFields: LoginField[] = ["email", "password"];

export const loginRememberField = "rememberMe";

export const initialLoginFormState: LoginFormState = {
  status: "idle",
  values: { email: "", rememberMe: true },
  errors: {}
}

export const postLoginRoute: Route = "myCourse";

export const postSignOutRoute: Route = "home";

export const adminRole: UserRole = "admin";

export const loginStatusByAuthError: Record<string, LoginFailureStatus> = {
  UNAUTHORIZED: "invalidCredentials",
  FORBIDDEN: "deactivated",
  TOO_MANY_REQUESTS: "rateLimited"
}

export const passwordMinLength = 8;

export const passwordResetTokenSeconds = 60 * 60;

export const welcomeTokenSeconds = 7 * 24 * 60 * 60;

export const resetTokenPrefix = "reset-password:";

export const resetTokenField = "token";

export const invalidTokenCode = "INVALID_TOKEN";

export const resetPasswordFields: ResetPasswordField[] = ["password", "confirm"];

export const initialForgotPasswordState: ForgotPasswordFormState = {
  status: "idle",
  email: ""
}

export const initialResetPasswordState: ResetPasswordFormState = {
  status: "idle",
  errors: {}
}
