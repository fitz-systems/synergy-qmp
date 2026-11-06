"use client";

import Link from "next/link";

import { useActionState, useEffect, useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { submitLogin } from "@/app/[lang]/login/actions";
import { FormField } from "@/components/ui/form-field";
import { FormNotice } from "@/components/ui/form-notice";
import { SubmitButton } from "@/components/ui/submit-button";
import { initialLoginFormState, loginRememberField } from "@/constants/auth";
import { formLocaleField } from "@/constants/forms";
import type { Locale } from "@/i18n/config";
import { loginFieldErrorMessage, loginNotice } from "@/lib/helpers/auth";
import { fieldIds } from "@/lib/helpers/forms";
import type { LoginFormLabels } from "@/types/auth";

interface LoginFormProps {
  locale: Locale;
  labels: LoginFormLabels;
  forgotPasswordHref: string;
  contactEmail: string;
}

export function LoginForm({ locale, labels, forgotPasswordHref, contactEmail }: LoginFormProps) {
  const [state, action, pending] = useActionState(submitLogin, initialLoginFormState);
  const [showPassword, setShowPassword] = useState(false);
  
  const formRef = useRef<HTMLFormElement>(null);
  const noticeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.status === "invalid") formRef.current?.querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
    else if (state.status !== "idle") noticeRef.current?.focus();
  }, [state]);

  const notice = loginNotice(labels, state.status, contactEmail);
  const rememberId = fieldIds("login", loginRememberField).input;

  return (
    <form ref={formRef} action={action} noValidate className="mt-8 space-y-5">
      <input type="hidden" name={formLocaleField} value={locale}/>

      {notice && <FormNotice ref={noticeRef} notice={notice}/>}

      <FormField
        name="email"
        ids={fieldIds("login", "email")}
        label={labels.fields.email}
        type="email"
        autoComplete="username"
        defaultValue={state.values.email}
        error={loginFieldErrorMessage(labels.errors, state.errors, "email")}
      />
      <FormField
        name="password"
        ids={fieldIds("login", "password")}
        label={labels.fields.password}
        type={showPassword ? "text" : "password"}
        autoComplete="current-password"
        error={loginFieldErrorMessage(labels.errors, state.errors, "password")}
        trailing={(
          <button
            type="button"
            aria-pressed={showPassword}
            onClick={() => setShowPassword((shown) => !shown)}
            className="inline-flex size-10 items-center justify-center rounded-md text-ink-subtle transition-colors hover:text-ink"
          >
            {showPassword ? <EyeOff aria-hidden className="size-[1.125rem]" strokeWidth={1.75}/> : <Eye aria-hidden className="size-[1.125rem]" strokeWidth={1.75}/>}
            <span className="sr-only">{showPassword ? labels.hidePassword : labels.showPassword}</span>
          </button>
        )}
      />

      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <label htmlFor={rememberId} className="flex min-h-11 cursor-pointer items-center gap-3 text-[0.9375rem] text-ink">
          <input
            id={rememberId}
            type="checkbox"
            name={loginRememberField}
            defaultChecked={state.values.rememberMe}
            className="size-[1.125rem] cursor-pointer rounded accent-ink"
          />
          {labels.rememberMe}
        </label>
        <Link
          href={forgotPasswordHref}
          className="text-[0.9375rem] font-semibold text-ink underline decoration-brand decoration-2 underline-offset-[0.3em] transition-colors hover:decoration-ink"
        >
          {labels.forgotPassword}
        </Link>
      </div>

      <SubmitButton pending={pending} label={labels.submit} pendingLabel={labels.submitting} className="w-full"/>
    </form>
  );
}
