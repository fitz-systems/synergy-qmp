"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { ArrowRightLeft, CircleAlert, Ticket, Undo2, type LucideIcon } from "lucide-react";
import { AdminField, AdminFormActions, AdminFormSection } from "@/components/admin/admin-form-parts";
import { CompanyPicker } from "@/components/admin/company-picker";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { courseOptions, languageOptions, statusToneIconStyles, userFormFailedNotice } from "@/constants/admin";
import { useActionSubmit } from "@/hooks/use-action-submit";
import { userFormFieldError } from "@/lib/helpers/admin";
import { seatMove, seatsLeftLabel } from "@/lib/helpers/admin-distributors";
import { cn } from "@/lib/helpers/class-names";
import type { CompanyOption, CompanyPickerData, StatusTone, UserFormField, UserFormState } from "@/types/admin";

interface CurrentSeat {
  companyId: number | null;
  seatDistributorId: number | null;
}

interface UserFormProps {
  action: (state: UserFormState, formData: FormData) => Promise<UserFormState>;
  initialState: UserFormState;
  companies: CompanyPickerData;
  currentSeat?: CurrentSeat;
  creating: boolean;
  submitLabel: string;
  cancelHref: string;
}

interface SeatImpactProps {
  id: string;
  companyId: string;
  companies: CompanyOption[];
  data: CompanyPickerData;
  currentSeat?: CurrentSeat;
}

interface SeatLine {
  icon: LucideIcon;
  tone: StatusTone;
  text: string;
}

interface SwitchRowProps {
  name: string;
  label: string;
  hint: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

function seatLines({ companyId, companies, data, currentSeat }: Omit<SeatImpactProps, "id">): SeatLine[] {
  const distributorOf = (id: number | null | undefined) => data.distributors.find((distributor) => distributor.id === id);
  const company = companies.find((option) => String(option.id) === companyId);
  const original = companies.find((option) => option.id === currentSeat?.companyId);
  const holder = currentSeat ? { ...currentSeat, companyDistributorId: original?.distributorId ?? null } : null;
  const move = seatMove(holder, { companyId: company?.id ?? null, distributorId: company?.distributorId ?? null });
  const lines: SeatLine[] = [];

  const charged = distributorOf(move.charge);
  if (charged) {
    const after = charged.seatBalance - 1;
    lines.push(after < 0
      ? { icon: Ticket, tone: "warning", text: `Uses a seat from ${charged.name}, which has ${seatsLeftLabel(charged.seatBalance)}. Saving puts them at ${after.toLocaleString("en-CA")}.` }
      : { icon: Ticket, tone: "neutral", text: `Uses a seat from ${charged.name}: ${seatsLeftLabel(charged.seatBalance)}, ${seatsLeftLabel(after)} after saving.` });
  }
  const refunded = distributorOf(move.refund);
  if (refunded) lines.push({ icon: Undo2, tone: "neutral", text: `Gives a seat back to ${refunded.name}.` });
  if (!move.moved && currentSeat?.seatDistributorId) {
    const holderName = distributorOf(currentSeat.seatDistributorId)?.name;
    if (holderName) lines.push({ icon: ArrowRightLeft, tone: "neutral", text: `Already uses a seat from ${holderName}. No change.` });
  }
  return lines;
}

function SeatImpact({ id, ...props }: SeatImpactProps) {
  const lines = seatLines(props);
  if (lines.length === 0) return null;
  return (
    <ul id={id} aria-live="polite" className="grid gap-1">
      {lines.map((line) => (
        <li key={line.text} className="flex gap-1.5 text-xs text-muted-foreground">
          <line.icon aria-hidden className={cn("mt-px size-3.5 shrink-0", statusToneIconStyles[line.tone])}/>
          {line.text}
        </li>
      ))}
    </ul>
  );
}

function SwitchRow({ name, label, hint, checked, onCheckedChange }: SwitchRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border p-4 sm:col-span-2">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <Switch name={name} checked={checked} onCheckedChange={onCheckedChange} aria-label={label}/>
    </div>
  );
}

export function UserForm({ action, initialState, companies, currentSeat, creating, submitLabel, cancelHref }: UserFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const submit = useActionSubmit(formAction);
  const [company, setCompany] = useState(initialState.values.company);
  const [companyOptions, setCompanyOptions] = useState(companies.companies);
  const [course, setCourse] = useState(initialState.values.course);
  const [locale, setLocale] = useState(initialState.values.locale);
  const [active, setActive] = useState(initialState.values.active);
  const [paid, setPaid] = useState(initialState.values.paid);
  const [sendWelcome, setSendWelcome] = useState(initialState.values.sendWelcome);
  const formRef = useRef<HTMLFormElement>(null);
  const noticeRef = useRef<HTMLDivElement>(null);
  const { values } = state;

  useEffect(() => {
    if (state.status === "invalid") formRef.current?.querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
    else if (state.status === "failed") noticeRef.current?.focus();
  }, [state]);

  function invalid(field: UserFormField) {
    const error = userFormFieldError(state.errors, field);
    return { error, inputProps: { "aria-invalid": error ? true : undefined, "aria-describedby": error ? `${fieldId(field)}-error` : undefined } }
  }

  function fieldId(field: UserFormField) {
    return `user-${field}`;
  }

  const firstName = invalid("firstName");
  const lastName = invalid("lastName");
  const email = invalid("email");
  const companyField = invalid("company");
  const courseField = invalid("course");
  const localeField = invalid("locale");

  return (
    <form ref={formRef} onSubmit={submit} noValidate className="space-y-6">
      {state.status === "failed" && (
        <div ref={noticeRef} tabIndex={-1} role="alert" className="flex gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive focus-visible:outline-none">
          <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0"/>
          {userFormFailedNotice}
        </div>
      )}

      <AdminFormSection title="Student" description="The name appears on the certificate exactly as entered.">
        <AdminField id={fieldId("firstName")} label="First name" error={firstName.error}>
          <Input id={fieldId("firstName")} name="firstName" defaultValue={values.firstName} autoComplete="off" required {...firstName.inputProps}/>
        </AdminField>
        <AdminField id={fieldId("lastName")} label="Last name" error={lastName.error}>
          <Input id={fieldId("lastName")} name="lastName" defaultValue={values.lastName} autoComplete="off" required {...lastName.inputProps}/>
        </AdminField>
        <AdminField id={fieldId("email")} label="Email" hint="Used to log in. Must be unique." error={email.error}>
          <Input id={fieldId("email")} name="email" type="email" defaultValue={values.email} autoComplete="off" required {...email.inputProps}/>
        </AdminField>
        <AdminField id={fieldId("company")} label="Company" error={companyField.error}>
          <CompanyPicker
            id={fieldId("company")}
            name="company"
            data={companies}
            value={company}
            onValueChange={(value, options) => {
              setCompany(value);
              setCompanyOptions(options);
            }}
            invalid={companyField.error !== undefined}
            describedBy={[companyField.error ? `${fieldId("company")}-error` : "", "user-company-seats"].filter(Boolean).join(" ")}
          />
          <SeatImpact id="user-company-seats" companyId={company} companies={companyOptions} data={companies} currentSeat={currentSeat}/>
        </AdminField>
      </AdminFormSection>

      <AdminFormSection title="Enrollment" description="The course and language decide which material and exam the student gets.">
        <AdminField id={fieldId("course")} label="Course" error={courseField.error}>
          <Select name="course" value={course} onValueChange={setCourse}>
            <SelectTrigger id={fieldId("course")} className="w-full" {...courseField.inputProps}><SelectValue/></SelectTrigger>
            <SelectContent>
              {courseOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </AdminField>
        <AdminField id={fieldId("locale")} label="Language" error={localeField.error}>
          <Select name="locale" value={locale} onValueChange={setLocale}>
            <SelectTrigger id={fieldId("locale")} className="w-full" {...localeField.inputProps}><SelectValue/></SelectTrigger>
            <SelectContent>
              {languageOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </AdminField>
        <AdminField id="user-notes" label="Notes" hint="Only visible to admins." className="grid gap-2 sm:col-span-2">
          <Textarea id="user-notes" name="notes" rows={3} defaultValue={values.notes}/>
        </AdminField>
        <SwitchRow name="paid" label="Paid" hint="Whether the course fee has been received." checked={paid} onCheckedChange={setPaid}/>
        <SwitchRow name="active" label="Active" hint="Deactivated students can't log in. Their records are kept." checked={active} onCheckedChange={setActive}/>
        {creating && (
          <SwitchRow name="sendWelcome" label="Send welcome email" hint="Emails a link to set a password. Passwords are never sent by email." checked={sendWelcome} onCheckedChange={setSendWelcome}/>
        )}
      </AdminFormSection>

      <AdminFormActions submitLabel={submitLabel} cancelHref={cancelHref} pending={pending}/>
    </form>
  );
}
