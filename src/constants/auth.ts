import type { Route } from "@/constants/routes";
import type { LoginFailureStatus, LoginField, LoginFormState } from "@/types/auth";

export const loginFields: LoginField[] = ["email", "password"];

export const loginRememberField = "rememberMe";

export const initialLoginFormState: LoginFormState = {
  status: "idle",
  values: { email: "", rememberMe: true },
  errors: {}
}

// Todo: Send students to their course page once it exists
export const postLoginRoute: Route = "home";

// Better Auth error statuses: wrong email or password, the deactivated-account hook in lib/auth.ts, and its rate limiter
export const loginStatusByAuthError: Record<string, LoginFailureStatus> = {
  UNAUTHORIZED: "invalidCredentials",
  FORBIDDEN: "deactivated",
  TOO_MANY_REQUESTS: "rateLimited"
}
