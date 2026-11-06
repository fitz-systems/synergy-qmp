import type { Route } from "@/constants/routes";
import type { ForgotPasswordFormState, LoginFailureStatus, LoginField, LoginFormState, ResetPasswordField, ResetPasswordFormState } from "@/types/auth";

export const loginFields: LoginField[] = ["email", "password"];

export const loginRememberField = "rememberMe";

export const initialLoginFormState: LoginFormState = {
  status: "idle",
  values: { email: "", rememberMe: true },
  errors: {}
}

// Todo: Send students to their course page once it exists
export const postLoginRoute: Route = "home";

export const loginStatusByAuthError: Record<string, LoginFailureStatus> = {
  UNAUTHORIZED: "invalidCredentials",
  FORBIDDEN: "deactivated",
  TOO_MANY_REQUESTS: "rateLimited"
}

export const passwordMinLength = 8;

export const resetPasswordFields: ResetPasswordField[] = ["password", "confirm"];

export const initialForgotPasswordState: ForgotPasswordFormState = {
  status: "idle",
  email: ""
}

export const initialResetPasswordState: ResetPasswordFormState = {
  status: "idle",
  errors: {}
}
