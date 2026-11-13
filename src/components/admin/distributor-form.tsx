"use client";

import { useActionState, useEffect, useRef } from "react";
import { CircleAlert } from "lucide-react";
import { AdminField, AdminFormActions, AdminFormSection } from "@/components/admin/admin-form-parts";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { distributorFormFailedNotice, seatAdjustmentLimit } from "@/constants/admin";
import { useActionSubmit } from "@/hooks/use-action-submit";
import type { DistributorFormField, DistributorFormState } from "@/types/admin";

interface DistributorFormProps {
  action: (state: DistributorFormState, formData: FormData) => Promise<DistributorFormState>;
  initialState: DistributorFormState;
  creating: boolean;
  submitLabel: string;
  cancelHref: string;
}

function fieldId(field: DistributorFormField) {
  return `distributor-${field}`;
}

export function DistributorForm({ action, initialState, creating, submitLabel, cancelHref }: DistributorFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const submit = useActionSubmit(formAction);
  const formRef = useRef<HTMLFormElement>(null);
  const noticeRef = useRef<HTMLDivElement>(null);
  const { values, errors } = state;

  useEffect(() => {
    if (state.status === "invalid") formRef.current?.querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
    else if (state.status === "failed") noticeRef.current?.focus();
  }, [state]);

  function invalidProps(field: DistributorFormField) {
    return { "aria-invalid": errors[field] ? true : undefined, "aria-describedby": errors[field] ? `${fieldId(field)}-error` : undefined }
  }

  return (
    <form ref={formRef} onSubmit={submit} noValidate className="space-y-6">
      {state.status === "failed" && (
        <div ref={noticeRef} tabIndex={-1} role="alert" className="flex gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive focus-visible:outline-none">
          <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0"/>
          {distributorFormFailedNotice}
        </div>
      )}

      <AdminFormSection title="Distributor" description="Distributors buy seats for the companies they bring in. Each student enrolled at one of their companies uses one seat.">
        <AdminField id={fieldId("name")} label="Name" error={errors.name}>
          <Input id={fieldId("name")} name="name" defaultValue={values.name} autoComplete="off" required {...invalidProps("name")}/>
        </AdminField>
        {creating && (
          <AdminField id={fieldId("seats")} label="Starting seats" hint="Seats they've paid for so far. You can add more later." error={errors.seats}>
            <Input id={fieldId("seats")} name="seats" type="number" inputMode="numeric" step={1} min={-seatAdjustmentLimit} max={seatAdjustmentLimit} defaultValue={values.seats} {...invalidProps("seats")}/>
          </AdminField>
        )}
        <AdminField id="distributor-notes" label="Notes" hint="Only visible to admins. Contacts, contract details, and so on." className="grid gap-2 sm:col-span-2">
          <Textarea id="distributor-notes" name="notes" rows={3} defaultValue={values.notes}/>
        </AdminField>
      </AdminFormSection>
      <AdminFormActions submitLabel={submitLabel} cancelHref={cancelHref} pending={pending}/>
    </form>
  );
}
