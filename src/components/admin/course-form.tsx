"use client";

import Link from "next/link";

import { useActionState, useEffect, useRef, useState } from "react";
import { CircleAlert, ListChecks } from "lucide-react";
import { AdminField, AdminFormActions, AdminFormSection, AdminSwitchField } from "@/components/admin/admin-form-parts";
import { CourseMaterialUpload } from "@/components/admin/course-material-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { courseFormFailedNotice, courseSettingRanges } from "@/constants/admin";
import { locales, type Locale } from "@/i18n/config";
import { adminQuestionsHref, languageLabel } from "@/lib/helpers/admin";
import type { AdminCourse, CourseFormField, CourseFormState, CourseSetting } from "@/types/admin";

interface CourseFormProps {
  action: (state: CourseFormState, formData: FormData) => Promise<CourseFormState>;
  initialState: CourseFormState;
  course: AdminCourse;
  cancelHref: string;
}

function fieldId(field: string) {
  return `course-${field.replace(".", "-")}`;
}

function errorLocale(errors: CourseFormState["errors"]) {
  const field = Object.keys(errors).find((key) => key.includes("."));
  return field ? field.split(".")[1] as Locale : undefined;
}

export function CourseForm({ action, initialState, course, cancelHref }: CourseFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [tab, setTab] = useState<string>(locales[0]);
  const [shownState, setShownState] = useState(state);
  const [shuffleQuestions, setShuffleQuestions] = useState(initialState.values.shuffleQuestions);
  const [shuffleAnswers, setShuffleAnswers] = useState(initialState.values.shuffleAnswers);
  const [active, setActive] = useState(initialState.values.active);
  const formRef = useRef<HTMLFormElement>(null);
  const noticeRef = useRef<HTMLDivElement>(null);
  const { values } = state;

  if (state !== shownState) {
    setShownState(state);
    const locale = state.status === "invalid" ? errorLocale(state.errors) : undefined;
    if (locale) setTab(locale);
  }

  useEffect(() => {
    if (state.status === "invalid") formRef.current?.querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
    else if (state.status === "failed") noticeRef.current?.focus();
  }, [state]);

  function invalid(field: CourseFormField) {
    const error = state.errors[field];
    return { error, inputProps: { "aria-invalid": error ? true : undefined, "aria-describedby": error ? `${fieldId(field)}-error` : undefined } }
  }

  function numberField(field: CourseSetting, label: string, hint?: string, placeholder?: string) {
    const { error, inputProps } = invalid(field);
    const { min, max } = courseSettingRanges[field];
    return (
      <AdminField id={fieldId(field)} label={label} hint={hint} error={error}>
        <Input id={fieldId(field)} name={field} type="number" inputMode="numeric" min={min} max={max} placeholder={placeholder} defaultValue={values[field]} {...inputProps}/>
      </AdminField>
    );
  }

  return (
    <form ref={formRef} action={formAction} noValidate className="space-y-6">
      {state.status === "failed" && (
        <div ref={noticeRef} tabIndex={-1} role="alert" className="flex gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive focus-visible:outline-none">
          <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0"/>
          {courseFormFailedNotice}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Course content</CardTitle>
          <CardDescription>Each language has its own name, description, lecture title, learning outcomes, course material PDF, certificate code and exam questions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={setTab} className="gap-5">
            <TabsList>
              {locales.map((locale) => <TabsTrigger key={locale} value={locale}>{languageLabel(locale)}</TabsTrigger>)}
            </TabsList>
            {locales.map((locale) => {
              const label = languageLabel(locale);
              const name = invalid(`name.${locale}`);
              const lectureTitle = invalid(`lectureTitle.${locale}`);
              const outcomes = invalid(`outcomes.${locale}`);
              const certificateCode = invalid(`certificateCode.${locale}`);
              return (
                <TabsContent key={locale} value={locale} forceMount className="grid gap-5 data-[state=inactive]:hidden">
                  <AdminField id={fieldId(`name.${locale}`)} label={`Name (${label})`} hint="Shown in the student area and on certificates." error={name.error}>
                    <Input id={fieldId(`name.${locale}`)} name={`name.${locale}`} defaultValue={values[`name.${locale}`]} required {...name.inputProps}/>
                  </AdminField>
                  <AdminField id={fieldId(`description.${locale}`)} label={`Description (${label})`}>
                    <Textarea id={fieldId(`description.${locale}`)} name={`description.${locale}`} rows={3} defaultValue={values[`description.${locale}`]}/>
                  </AdminField>
                  <AdminField id={fieldId(`lectureTitle.${locale}`)} label={`Lecture title (${label})`} hint="Shown in the curriculum on the course page." error={lectureTitle.error}>
                    <Input id={fieldId(`lectureTitle.${locale}`)} name={`lectureTitle.${locale}`} defaultValue={values[`lectureTitle.${locale}`]} required {...lectureTitle.inputProps}/>
                  </AdminField>
                  <AdminField id={fieldId(`outcomes.${locale}`)} label={`Learning outcomes (${label})`} hint="One per line. Listed under “Learning outcomes” on the course page." error={outcomes.error}>
                    <Textarea id={fieldId(`outcomes.${locale}`)} name={`outcomes.${locale}`} rows={6} defaultValue={values[`outcomes.${locale}`]} required {...outcomes.inputProps}/>
                  </AdminField>
                  <AdminField id={fieldId(`certificateCode.${locale}`)} label={`Certificate code (${label})`} hint={`RCEEM reference code printed on ${label} certificates.`} error={certificateCode.error}>
                    <Input id={fieldId(`certificateCode.${locale}`)} name={`certificateCode.${locale}`} defaultValue={values[`certificateCode.${locale}`]} className="font-mono" required {...certificateCode.inputProps}/>
                  </AdminField>
                  <CourseMaterialUpload code={course.code} locale={locale} label={label} uploaded={course.materialUploaded[locale]}/>
                  <div className="grid gap-2">
                    <p className="text-sm font-medium">Exam questions ({label})</p>
                    <div className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                      <p className="flex items-center gap-2 text-sm">
                        <ListChecks aria-hidden className="size-4 text-muted-foreground"/>
                        {course.activeQuestionCounts[locale]} active of {course.questionCounts[locale]} questions
                      </p>
                      <Button variant="outline" size="sm" asChild><Link href={adminQuestionsHref(course.code, locale)}>Manage questions</Link></Button>
                    </div>
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>

      <AdminFormSection title="Course page" description="Shown on the public course pages in both languages.">
        <AdminField id={fieldId("price")} label="Price (CAD)" hint="Shown next to the enroll button. Enrollment is still through the contact page." error={invalid("price").error}>
          <Input id={fieldId("price")} name="price" inputMode="decimal" defaultValue={values.price} {...invalid("price").inputProps}/>
        </AdminField>
        {numberField("durationHours", "Course duration (hours)")}
        {numberField("lectureMinutes", "Lecture length (minutes)")}
      </AdminFormSection>

      <AdminFormSection title="Exam" description="Applies to both languages and to new attempts. Past attempts keep the pass mark and questions they were taken with.">
        {numberField("passMarkPct", "Pass mark (%)")}
        {numberField("questionsPerAttempt", "Questions per attempt", "Drawn at random from the active questions in the student's language.")}
        {numberField("timeLimitMinutes", "Time limit (minutes)")}
        {numberField("maxAttempts", "Maximum attempts", "Leave blank for unlimited attempts.", "Unlimited")}
        {numberField("certificateValidMonths", "Certificate valid for (months)", "Applies to every certificate for this course, including ones already issued.")}
        <div aria-hidden className="hidden sm:block"/>
        <AdminSwitchField name="shuffleQuestions" label="Shuffle questions" hint="Each attempt shows the questions in a new order." checked={shuffleQuestions} onCheckedChange={setShuffleQuestions}/>
        <AdminSwitchField name="shuffleAnswers" label="Shuffle answers" hint="Answer options appear in a new order. True / false questions keep theirs." checked={shuffleAnswers} onCheckedChange={setShuffleAnswers}/>
      </AdminFormSection>

      <AdminFormSection title="Status">
        <AdminSwitchField
          name="active"
          label="Active"
          hint="Inactive courses can't take new enrollments. Enrolled students keep their access."
          checked={active}
          onCheckedChange={setActive}
          className="sm:col-span-2"
        />
      </AdminFormSection>

      <AdminFormActions submitLabel="Save changes" cancelHref={cancelHref} pending={pending}/>
    </form>
  );
}
