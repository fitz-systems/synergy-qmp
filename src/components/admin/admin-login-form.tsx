"use client";

import { useActionState, useEffect, useRef } from "react";
import { CircleAlert } from "lucide-react";
import { submitAdminLogin } from "@/app/admin/(auth)/login/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminLoginFields } from "@/constants/admin";
import { initialLoginFormState } from "@/constants/auth";
import { adminLoginFieldError, adminLoginNotice } from "@/lib/helpers/admin";
import { fieldIds } from "@/lib/helpers/forms";

export function AdminLoginForm() {
  const [state, action, pending] = useActionState(submitAdminLogin, initialLoginFormState);
  const formRef = useRef<HTMLFormElement>(null);
  const noticeRef = useRef<HTMLDivElement>(null);

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
        return (
          <div key={field.name} className="grid gap-2">
            <Label htmlFor={ids.input}>{field.label}</Label>
            <Input
              id={ids.input}
              name={field.name}
              type={field.type}
              autoComplete={field.autoComplete}
              defaultValue={field.name === "email" ? state.values.email : undefined}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? ids.error : undefined}
            />
            {error && <p id={ids.error} className="text-sm text-destructive">{error}</p>}
          </div>
        );
      })}
      <Button type="submit" className="w-full" disabled={pending}>{pending ? "Logging in…" : "Log in"}</Button>
    </form>
  );
}
