"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { CircleAlert } from "lucide-react";
import { AdminField, AdminFormActions, AdminFormSection } from "@/components/admin/admin-form-parts";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { companyFormFailedNotice, companyPickerLabels, noDistributorValue } from "@/constants/admin";
import { useActionSubmit } from "@/hooks/use-action-submit";
import { seatsLeftLabel } from "@/lib/helpers/admin-distributors";
import type { CompanyFormField, CompanyFormState, DistributorOption } from "@/types/admin";

interface CompanyFormProps {
  action: (state: CompanyFormState, formData: FormData) => Promise<CompanyFormState>;
  initialState: CompanyFormState;
  distributors: DistributorOption[];
  creating: boolean;
  submitLabel: string;
  cancelHref: string;
}

function fieldId(field: CompanyFormField) {
  return `company-${field}`;
}

export function CompanyForm({ action, initialState, distributors, creating, submitLabel, cancelHref }: CompanyFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const submit = useActionSubmit(formAction);
  const [distributor, setDistributor] = useState(initialState.values.distributor);
  const formRef = useRef<HTMLFormElement>(null);
  const noticeRef = useRef<HTMLDivElement>(null);
  const { values, errors } = state;
  const moved = !creating && distributor !== initialState.values.distributor;

  useEffect(() => {
    if (state.status === "invalid") formRef.current?.querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
    else if (state.status === "failed") noticeRef.current?.focus();
  }, [state]);

  function invalidProps(field: CompanyFormField) {
    return { "aria-invalid": errors[field] ? true : undefined, "aria-describedby": errors[field] ? `${fieldId(field)}-error` : undefined }
  }

  return (
    <form ref={formRef} onSubmit={submit} noValidate className="space-y-6">
      {state.status === "failed" && (
        <div ref={noticeRef} tabIndex={-1} role="alert" className="flex gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive focus-visible:outline-none">
          <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0"/>
          {companyFormFailedNotice}
        </div>
      )}

      <AdminFormSection title="Company" description="Students are linked to a company from this list.">
        <AdminField id={fieldId("name")} label="Name" error={errors.name}>
          <Input id={fieldId("name")} name="name" defaultValue={values.name} autoComplete="off" required {...invalidProps("name")}/>
        </AdminField>
        <AdminField
          id={fieldId("distributor")}
          label="Distributor"
          hint={moved ? "Students already enrolled keep their seat where it was used. Only new students use the new distributor's seats." : "New students at this company use one of the distributor's seats."}
          error={errors.distributor}
        >
          <Select name="distributor" value={distributor} onValueChange={setDistributor}>
            <SelectTrigger id={fieldId("distributor")} className="w-full" {...invalidProps("distributor")}><SelectValue/></SelectTrigger>
            <SelectContent>
              <SelectItem value={noDistributorValue}>{companyPickerLabels.noDistributor}</SelectItem>
              {distributors.map((option) => (
                <SelectItem key={option.id} value={String(option.id)}>{option.name} · {seatsLeftLabel(option.seatBalance)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </AdminField>
      </AdminFormSection>
      <AdminFormActions submitLabel={submitLabel} cancelHref={cancelHref} pending={pending}/>
    </form>
  );
}
