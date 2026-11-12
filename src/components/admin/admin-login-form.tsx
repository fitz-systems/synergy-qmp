"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { CircleAlert, Eye, EyeOff } from "lucide-react";
import { submitAdminLogin } from "@/app/admin/(auth)/login/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminLoginFields, adminPasswordToggleLabels } from "@/constants/admin";
import { initialLoginFormState } from "@/constants/auth";
import { adminLoginFieldError, adminLoginNotice } from "@/lib/helpers/admin";
import { fieldIds } from "@/lib/helpers/forms";

export function AdminLoginForm() {
  const [state, action, pending] = useActionState(submitAdminLogin, initialLoginFormState);
  const formRef = useRef<HTMLFormElement>(null);
  const noticeRef = useRef<HTMLDivElement>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (state.status === "invalid") formRef.current?.querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
    else if (state.status !== "idle") noticeRef.current?.focus();
  }, [state]);

  const notice = adminLoginNotice(state.status);

  return (
    <form ref={formRef} action={action} noValidate className="grid gap-4">
      {notice && (
        <div ref={noticeRef} tabIndex={-1} role="alert" className="flex gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive focus-visible:outline-none">
          <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0"/>
          {notice}
        </div>
      )}
      {adminLoginFields.map((field) => {
        const ids = fieldIds("admin", field.name);
        const error = adminLoginFieldError(state.errors, field.name);
        const isPassword = field.name === "password";
        return (
          <div key={field.name} className="grid gap-2">
            <Label htmlFor={ids.input}>{field.label}</Label>
            <div className="relative">
              <Input
                id={ids.input}
                name={field.name}
                type={isPassword && showPassword ? "text" : field.type}
                autoComplete={field.autoComplete}
                defaultValue={field.name === "email" ? state.values.email : undefined}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? ids.error : undefined}
                className={isPassword ? "pr-10" : undefined}
              />
              {isPassword && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((shown) => !shown)}
                  className="absolute inset-y-0 right-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
                >
                  {showPassword ? <EyeOff aria-hidden/> : <Eye aria-hidden/>}
                  <span className="sr-only">{showPassword ? adminPasswordToggleLabels.hide : adminPasswordToggleLabels.show}</span>
                </Button>
              )}
            </div>
            {error && <p id={ids.error} className="text-sm text-destructive">{error}</p>}
          </div>
        );
      })}
      <Button type="submit" className="w-full" disabled={pending}>{pending ? "Logging in…" : "Log in"}</Button>
    </form>
  );
}
