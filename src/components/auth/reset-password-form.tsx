"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { CircleCheck, Info } from "lucide-react";
import { resetPassword } from "@/app/[lang]/(site)/reset-password/actions";
import { ButtonLink } from "@/components/ui/button-link";
import { FormField } from "@/components/ui/form-field";
import { FormNotice } from "@/components/ui/form-notice";
import { PasswordToggle } from "@/components/ui/password-toggle";
import { SubmitButton } from "@/components/ui/submit-button";
import { initialResetPasswordState, passwordMinLength } from "@/constants/auth";
import { resetPasswordErrorMessage } from "@/lib/helpers/auth";
import { interpolate } from "@/lib/helpers/format";
import { fieldIds } from "@/lib/helpers/forms";
import type { ResetPasswordCopy, ResetPasswordField } from "@/types/auth";

interface ResetPasswordFormProps {
  labels: ResetPasswordCopy;
  loginHref: string;
  contactEmail: string;
}

export function ResetPasswordForm({ labels, loginHref, contactEmail }: ResetPasswordFormProps) {
  const [state, action, pending] = useActionState(resetPassword, initialResetPasswordState);
  const [shown, setShown] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const noticeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.status === "invalid") formRef.current?.querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
    else if (state.status !== "idle") noticeRef.current?.focus();
  }, [state]);

  if (state.status === "done") {
    return (
      <div ref={noticeRef} tabIndex={-1} role="status" className="mt-6 focus-visible:outline-none">
        <div className="rounded-xl border border-success/25 bg-success-soft p-5">
          <CircleCheck aria-hidden className="size-6 text-success" strokeWidth={1.75}/>
          <p className="mt-3 font-semibold text-ink">{labels.done.title}</p>
          <p className="mt-1 leading-relaxed text-ink-muted">{labels.done.body}</p>
        </div>
        <ButtonLink href={loginHref} arrow className="mt-6 w-full">{labels.done.login}</ButtonLink>
      </div>
    );
  }

  const toggle = <PasswordToggle shown={shown} onToggle={() => setShown((value) => !value)} showLabel={labels.showPassword} hideLabel={labels.hidePassword}/>;
  const fieldProps = (field: ResetPasswordField) => ({
    name: field,
    ids: fieldIds("reset", field),
    label: labels.fields[field],
    type: shown ? "text" as const : "password" as const,
    autoComplete: "new-password",
    error: resetPasswordErrorMessage(labels.errors, state.errors, field),
    trailing: toggle
  });

  return (
    <form ref={formRef} action={action} noValidate className="mt-8 space-y-5">
      {state.status === "unavailable" && (
        <FormNotice ref={noticeRef} notice={{ title: labels.unavailable.title, body: interpolate(labels.unavailable.body, { email: contactEmail }) }}/>
      )}
      <FormField {...fieldProps("password")}/>
      <p className="-mt-2 flex items-center gap-2 text-sm text-ink-muted">
        <Info aria-hidden className="size-4 shrink-0" strokeWidth={1.75}/>
        {interpolate(labels.rule, { min: passwordMinLength })}
      </p>
      <FormField {...fieldProps("confirm")}/>
      <SubmitButton pending={pending} label={labels.submit} pendingLabel={labels.submitting} className="w-full"/>
    </form>
  );
}
