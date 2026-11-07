"use client";

import Link from "next/link";

import { useActionState, useEffect, useRef } from "react";
import { ArrowLeft, MailCheck } from "lucide-react";
import { requestPasswordReset } from "@/app/[lang]/(site)/forgot-password/actions";
import { FormField } from "@/components/ui/form-field";
import { FormNotice } from "@/components/ui/form-notice";
import { SubmitButton } from "@/components/ui/submit-button";
import { initialForgotPasswordState } from "@/constants/auth";
import { formLocaleField } from "@/constants/forms";
import type { Locale } from "@/i18n/config";
import { forgotPasswordErrorMessage } from "@/lib/helpers/auth";
import { interpolate } from "@/lib/helpers/format";
import { fieldIds } from "@/lib/helpers/forms";
import type { ForgotPasswordCopy } from "@/types/auth";

interface ForgotPasswordFormProps {
  locale: Locale;
  labels: ForgotPasswordCopy;
  loginHref: string;
  contactEmail: string;
}

export function ForgotPasswordForm({ locale, labels, loginHref, contactEmail }: ForgotPasswordFormProps) {
  const [state, action, pending] = useActionState(requestPasswordReset, initialForgotPasswordState);
  const formRef = useRef<HTMLFormElement>(null);
  const noticeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.status === "invalid") formRef.current?.querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
    else if (state.status !== "idle") noticeRef.current?.focus();
  }, [state]);

  const backLink = (
    <Link href={loginHref} className="inline-flex items-center gap-2 text-[0.9375rem] font-semibold text-ink underline decoration-brand decoration-2 underline-offset-[0.3em] transition-colors hover:decoration-ink">
      <ArrowLeft aria-hidden className="size-4" strokeWidth={2}/>
      {labels.back}
    </Link>
  );

  if (state.status === "sent") {
    return (
      <div ref={noticeRef} tabIndex={-1} role="status" className="mt-6 focus-visible:outline-none">
        <div className="rounded-xl border border-success/25 bg-success-soft p-5">
          <MailCheck aria-hidden className="size-6 text-success" strokeWidth={1.75}/>
          <p className="mt-3 font-semibold text-ink">{labels.sent.title}</p>
          <p className="mt-1 leading-relaxed text-ink-muted">{interpolate(labels.sent.body, { email: state.email })}</p>
        </div>
        <div className="mt-6">{backLink}</div>
      </div>
    );
  }

  return (
    <form ref={formRef} action={action} noValidate className="mt-8 space-y-5">
      <input type="hidden" name={formLocaleField} value={locale}/>
      {state.status === "failed" && (
        <FormNotice ref={noticeRef} notice={{ title: labels.failed.title, body: interpolate(labels.failed.body, { email: contactEmail }) }}/>
      )}
      <FormField
        name="email"
        ids={fieldIds("forgot", "email")}
        label={labels.email}
        type="email"
        autoComplete="email"
        defaultValue={state.email}
        error={forgotPasswordErrorMessage(labels.errors, state.error)}
      />
      <SubmitButton pending={pending} label={labels.submit} pendingLabel={labels.submitting} className="w-full"/>
      <div className="pt-1 text-center">{backLink}</div>
    </form>
  );
}
