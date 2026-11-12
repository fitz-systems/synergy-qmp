import type { Route } from "@/constants/routes";
import type { ForgotPasswordFormState, LoginFailureStatus, LoginField, LoginFormState, RateLimitAction, RateLimitRule, ResetPasswordField, ResetPasswordFormState, UserRole } from "@/types/auth";

export const loginFields: LoginField[] = ["email", "password"];

export const loginRememberField = "rememberMe";

export const initialLoginFormState: LoginFormState = {
  status: "idle",
  values: { email: "", rememberMe: false },
  errors: {}
}

export const postLoginRoute: Route = "myCourse";

export const postSignOutRoute: Route = "home";

export const adminRole: UserRole = "admin";

export const sessionShellStaleSeconds = 5 * 60;

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

export const rateLimitRules: Record<RateLimitAction, RateLimitRule[]> = {
  signIn: [
    { scope: "ip", max: 20, windowSeconds: 15 * 60 },
    { scope: "email", max: 5, windowSeconds: 15 * 60 }
  ],
  passwordReset: [
    { scope: "ip", max: 5, windowSeconds: 15 * 60 },
    { scope: "email", max: 3, windowSeconds: 60 * 60 }
  ]
}

export const rateLimitRetentionSeconds = 24 * 60 * 60;

export const clientIpHeaders = ["x-real-ip", "x-forwarded-for"];

export const unknownClientIp = "unknown";

export const disabledAuthPaths = ["/sign-in/email", "/request-password-reset", "/reset-password"];
