"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { CircleAlert, Plus, Trash2 } from "lucide-react";
import { AdminField, AdminFormActions, AdminSwitchField } from "@/components/admin/admin-form-parts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { maxQuestionOptions, minQuestionOptions, questionFormFailedNotice, questionTypeLabels } from "@/constants/admin";
import type { Locale } from "@/i18n/config";
import { optionLetter } from "@/lib/helpers/admin";
import { defaultQuestionOptions, isQuestionType, questionOptionsOf } from "@/lib/helpers/admin-courses";
import type { AdminQuestionOption, QuestionFormField, QuestionFormState, QuestionType } from "@/types/admin";

interface QuestionFormProps {
  action: (state: QuestionFormState, formData: FormData) => Promise<QuestionFormState>;
  initialState: QuestionFormState;
  locale: Locale;
  submitLabel: string;
  cancelHref: string;
}

function fieldId(field: QuestionFormField) {
  return `question-${field}`;
}

export function QuestionForm({ action, initialState, locale, submitLabel, cancelHref }: QuestionFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [type, setType] = useState<QuestionType>(initialState.values.type);
  const [options, setOptions] = useState<AdminQuestionOption[]>(questionOptionsOf(initialState.values));
  const [active, setActive] = useState(initialState.values.active);
  const formRef = useRef<HTMLFormElement>(null);
  const noticeRef = useRef<HTMLDivElement>(null);
  const { values, errors } = state;

  useEffect(() => {
    if (state.status === "invalid") formRef.current?.querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
    else if (state.status === "failed") noticeRef.current?.focus();
  }, [state]);

  function changeType(next: string) {
    if (!isQuestionType(next)) return;
    setType(next);
    setOptions(defaultQuestionOptions(next, locale));
  }

  function update(index: number, change: Partial<AdminQuestionOption>) {
    setOptions((current) => current.map((option, i) => (i === index ? { ...option, ...change } : change.correct ? { ...option, correct: false } : option)));
  }

  function remove(index: number) {
    setOptions((current) => {
      const next = current.filter((_, i) => i !== index);
      return next.some((option) => option.correct) ? next : next.map((option, i) => ({ ...option, correct: i === 0 }));
    });
  }

  function invalidProps(field: QuestionFormField) {
    return { "aria-invalid": errors[field] ? true : undefined, "aria-describedby": errors[field] ? `${fieldId(field)}-error` : undefined }
  }

  return (
    <form ref={formRef} action={formAction} noValidate className="space-y-6">
      {state.status === "failed" && (
        <div ref={noticeRef} tabIndex={-1} role="alert" className="flex gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive focus-visible:outline-none">
          <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0"/>
          {questionFormFailedNotice}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Question</CardTitle>
          <CardDescription>Editing a question never changes answers already recorded for past attempts.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          <AdminField id="question-type" label="Type">
            <Select name="type" value={type} onValueChange={changeType}>
              <SelectTrigger id="question-type" className="w-full sm:w-60"><SelectValue/></SelectTrigger>
              <SelectContent>
                {Object.entries(questionTypeLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
              </SelectContent>
            </Select>
          </AdminField>
          <AdminField id={fieldId("prompt")} label="Question" error={errors.prompt}>
            <Textarea id={fieldId("prompt")} name="prompt" rows={4} defaultValue={values.prompt} required {...invalidProps("prompt")}/>
          </AdminField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Answers</CardTitle>
          <CardDescription>Select the correct answer.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <fieldset className="space-y-3" aria-describedby={errors.options ? `${fieldId("options")}-error` : undefined}>
            <legend className="sr-only">Answers and correct answer</legend>
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-3 rounded-lg border p-3 has-checked:border-primary has-checked:bg-primary/10">
                <input
                  type="radio"
                  name="correct"
                  value={index}
                  checked={option.correct}
                  onChange={() => update(index, { correct: true })}
                  aria-label={`Answer ${optionLetter(index)} is correct`}
                  className="size-4 shrink-0 accent-foreground"
                />
                <span className="w-5 text-sm font-semibold text-muted-foreground">{optionLetter(index)}</span>
                <Input
                  name="option"
                  aria-label={`Answer ${optionLetter(index)}`}
                  value={option.text}
                  onChange={(event) => update(index, { text: event.target.value })}
                  readOnly={type === "trueFalse"}
                  className="bg-background"
                  {...(index === 0 ? invalidProps("options") : {})}
                />
                {type === "multipleChoice" && options.length > minQuestionOptions && (
                  <Button type="button" variant="ghost" size="icon" aria-label={`Remove answer ${optionLetter(index)}`} onClick={() => remove(index)}>
                    <Trash2/>
                  </Button>
                )}
              </div>
            ))}
          </fieldset>
          {errors.options && <p id={`${fieldId("options")}-error`} className="text-sm text-destructive">{errors.options}</p>}
          {type === "multipleChoice" && options.length < maxQuestionOptions && (
            <Button type="button" variant="outline" size="sm" onClick={() => setOptions((current) => [...current, { text: "", correct: false }])}>
              <Plus/>Add answer
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5">
          <AdminField id="question-explanation" label="Explanation" hint="Shown to admins only, to explain why the answer is correct.">
            <Textarea id="question-explanation" name="explanation" rows={3} defaultValue={values.explanation}/>
          </AdminField>
          <AdminField id={fieldId("sortOrder")} label="Order" hint="Questions are listed in this order, and asked in it when shuffling is off." error={errors.sortOrder}>
            <Input id={fieldId("sortOrder")} name="sortOrder" type="number" inputMode="numeric" min={0} max={9999} defaultValue={values.sortOrder} className="sm:w-32" {...invalidProps("sortOrder")}/>
          </AdminField>
          <AdminSwitchField name="active" label="Active" hint="Hidden questions are never drawn for new attempts." checked={active} onCheckedChange={setActive} error={errors.active}/>
        </CardContent>
      </Card>

      <AdminFormActions submitLabel={submitLabel} cancelHref={cancelHref} pending={pending}/>
    </form>
  );
}
