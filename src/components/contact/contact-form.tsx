"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { CircleAlert, CircleCheck, LoaderCircle } from "lucide-react";
import { submitContactForm } from "@/app/[lang]/contact/actions";
import { contactFieldLimits, contactHoneypotField, contactHoneypotLabel, contactLocaleField, initialContactFormState } from "@/constants/contact";
import type { Locale } from "@/i18n/config";
import { contactFieldErrorMessage, contactFieldIds, contactNoticeLabels } from "@/lib/helpers/contact";
import { interpolate } from "@/lib/helpers/format";
import type { ContactField, ContactFormLabels } from "@/types/contact";

interface ContactFormProps {
  locale: Locale;
  labels: ContactFormLabels;
  email: string;
  phone: string;
}

const controlClass = "block w-full rounded-md border border-line-strong bg-canvas px-3.5 text-base text-ink transition-[border-color,box-shadow] duration-200 hover:border-ink-subtle focus:border-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ink/10 aria-invalid:border-danger aria-invalid:focus-visible:ring-danger/15";

export function ContactForm(props: ContactFormProps) {
  const [attempt, setAttempt] = useState(0);
  return <ContactFormBody key={attempt} {...props} onReset={() => setAttempt((count) => count + 1)}/>;
}

interface ContactFormBodyProps extends ContactFormProps {
  onReset: () => void;
}

function ContactFormBody({ locale, labels, email, phone, onReset }: ContactFormBodyProps) {
  const [state, action, pending] = useActionState(submitContactForm, initialContactFormState);
  const formRef = useRef<HTMLFormElement>(null);
  const noticeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.status === "invalid") formRef.current?.querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
    else if (state.status !== "idle") noticeRef.current?.focus();
  }, [state]);

  if (state.status === "sent") {
    return (
      <div ref={noticeRef} tabIndex={-1} role="status" className="mt-8 rounded-xl border border-success/25 bg-success-soft p-6 focus-visible:outline-none">
        <CircleCheck aria-hidden className="size-7 text-success" strokeWidth={1.75}/>
        <h3 className="mt-3 text-xl font-semibold text-ink">{labels.sent.title}</h3>
        <p className="mt-1.5 leading-relaxed text-ink-muted">{interpolate(labels.sent.body, { email: state.values.email })}</p>
        <button
          type="button"
          onClick={onReset}
          className="mt-5 text-[0.9375rem] font-semibold text-ink underline decoration-brand decoration-2 underline-offset-[0.3em] transition-colors hover:decoration-ink"
        >
          {labels.sent.again}
        </button>
      </div>
    );
  }

  const notice = contactNoticeLabels(labels, state.status);
  const errorFor = (field: ContactField) => contactFieldErrorMessage(labels.errors, state.errors, field);

  return (
    <form ref={formRef} action={action} noValidate className="mt-8 space-y-5">
      <input type="hidden" name={contactLocaleField} value={locale}/>
      <div aria-hidden className="absolute -left-[9999px] size-px overflow-hidden">
        <label>
          {contactHoneypotLabel}
          <input type="text" name={contactHoneypotField} tabIndex={-1} autoComplete="off"/>
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field field="name" label={labels.fields.name} defaultValue={state.values.name} error={errorFor("name")} autoComplete="name"/>
        <Field field="email" label={labels.fields.email} defaultValue={state.values.email} error={errorFor("email")} type="email" autoComplete="email"/>
      </div>
      <Field field="subject" label={labels.fields.subject} defaultValue={state.values.subject} error={errorFor("subject")}/>
      <Field field="message" label={labels.fields.message} defaultValue={state.values.message} error={errorFor("message")} multiline/>

      {notice && (
        <div ref={noticeRef} tabIndex={-1} role="alert" className="flex gap-3 rounded-lg border border-danger/25 bg-danger-soft p-4 focus-visible:outline-none">
          <CircleAlert aria-hidden className="mt-0.5 size-5 shrink-0 text-danger" strokeWidth={1.75}/>
          <div>
            <p className="font-semibold text-ink">{notice.title}</p>
            <p className="mt-1 text-[0.9375rem] leading-relaxed text-ink-muted">{interpolate(notice.body, { email, phone })}</p>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-brand px-7 text-base font-semibold text-ink transition-[background-color,transform] duration-200 ease-out-expo hover:bg-brand-hover active:translate-y-px disabled:cursor-wait disabled:opacity-70"
      >
        {pending && <LoaderCircle aria-hidden className="size-4 animate-spin" strokeWidth={2}/>}
        {pending ? labels.sending : labels.submit}
      </button>
    </form>
  );
}

interface FieldProps {
  field: ContactField;
  label: string;
  defaultValue: string;
  error?: string;
  type?: "text" | "email";
  autoComplete?: string;
  multiline?: boolean;
}

function Field({ field, label, defaultValue, error, type = "text", autoComplete, multiline = false }: FieldProps) {
  const ids = contactFieldIds(field);
  const shared = {
    id: ids.input,
    name: field,
    defaultValue,
    maxLength: contactFieldLimits[field],
    "aria-required": true,
    "aria-invalid": Boolean(error),
    "aria-describedby": error ? ids.error : undefined
  }

  return (
    <div>
      <label htmlFor={ids.input} className="block text-[0.9375rem] font-semibold text-ink">
        {label}
        <span aria-hidden className="ml-0.5 text-danger">*</span>
      </label>
      <div className="mt-2">
        {multiline
          ? <textarea {...shared} rows={6} className={`${controlClass} min-h-40 resize-y py-3 leading-relaxed`}/>
          : <input {...shared} type={type} autoComplete={autoComplete} className={`${controlClass} h-12`}/>}
      </div>
      {error && (
        <p id={ids.error} className="mt-2 flex items-start gap-1.5 text-sm font-medium text-danger">
          <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" strokeWidth={2}/>
          {error}
        </p>
      )}
    </div>
  );
}
