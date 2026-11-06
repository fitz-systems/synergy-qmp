"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { CircleCheck } from "lucide-react";
import { submitContactForm } from "@/app/[lang]/(site)/contact/actions";
import { FormField } from "@/components/ui/form-field";
import { FormNotice } from "@/components/ui/form-notice";
import { SubmitButton } from "@/components/ui/submit-button";
import { contactFieldLimits, contactHoneypotField, contactHoneypotLabel, initialContactFormState } from "@/constants/contact";
import { formLocaleField } from "@/constants/forms";
import type { Locale } from "@/i18n/config";
import { contactFieldErrorMessage, contactNotice } from "@/lib/helpers/contact";
import { interpolate } from "@/lib/helpers/format";
import { fieldIds } from "@/lib/helpers/forms";
import type { ContactField, ContactFormLabels } from "@/types/contact";

interface ContactFormProps {
  locale: Locale;
  labels: ContactFormLabels;
  email: string;
  phone: string;
}

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

  const notice = contactNotice(labels, state.status, { email, phone });
  const fieldProps = (field: ContactField) => ({
    name: field,
    ids: fieldIds("contact", field),
    label: labels.fields[field],
    defaultValue: state.values[field],
    error: contactFieldErrorMessage(labels.errors, state.errors, field),
    maxLength: contactFieldLimits[field]
  });

  return (
    <form ref={formRef} action={action} noValidate className="mt-8 space-y-5">
      <input type="hidden" name={formLocaleField} value={locale}/>
      <div aria-hidden className="absolute -left-[9999px] size-px overflow-hidden">
        <label>
          {contactHoneypotLabel}
          <input type="text" name={contactHoneypotField} tabIndex={-1} autoComplete="off"/>
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField {...fieldProps("name")} autoComplete="name"/>
        <FormField {...fieldProps("email")} type="email" autoComplete="email"/>
      </div>
      <FormField {...fieldProps("subject")}/>
      <FormField {...fieldProps("message")} multiline/>

      {notice && <FormNotice ref={noticeRef} notice={notice}/>}

      <SubmitButton pending={pending} label={labels.submit} pendingLabel={labels.sending}/>
    </form>
  );
}
