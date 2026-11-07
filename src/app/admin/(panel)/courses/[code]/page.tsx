import Link from "next/link";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FileText, ListChecks, Upload } from "lucide-react";
import { AdminField, AdminFormActions, AdminFormSection, AdminSwitchField } from "@/components/admin/admin-form-parts";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { adminRoutes } from "@/constants/admin";
import { locales } from "@/i18n/config";
import { getAdminCourse } from "@/lib/admin";
import { adminQuestionsHref, languageLabel } from "@/lib/helpers/admin";

export const metadata: Metadata = {
  title: "Edit course"
}

export default async function AdminCoursePage({ params }: PageProps<"/admin/courses/[code]">) {
  const { code } = await params;
  const course = await getAdminCourse(code);
  if (!course) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AdminPageHeader
        title={course.names.en}
        crumbs={[{ label: "Dashboard", href: adminRoutes.dashboard }, { label: "Courses", href: adminRoutes.courses }, { label: course.names.en }]}
      />
      <form className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Name, description and material</CardTitle>
            <CardDescription>Each language has its own name, description, course material PDF, certificate code and exam questions.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="en" className="gap-5">
              <TabsList>
                {locales.map((locale) => <TabsTrigger key={locale} value={locale}>{languageLabel(locale)}</TabsTrigger>)}
              </TabsList>
              {locales.map((locale) => {
                const label = languageLabel(locale);
                const file = course.materialFiles[locale];
                return (
                  <TabsContent key={locale} value={locale} className="grid gap-5">
                    <AdminField id={`name-${locale}`} label={`Name (${label})`}>
                      <Input id={`name-${locale}`} name={`name.${locale}`} defaultValue={course.names[locale]}/>
                    </AdminField>
                    <AdminField id={`description-${locale}`} label={`Description (${label})`}>
                      <Textarea id={`description-${locale}`} name={`description.${locale}`} rows={3} defaultValue={course.descriptions[locale]}/>
                    </AdminField>
                    <AdminField id={`certificate-code-${locale}`} label={`Certificate code (${label})`} hint={`RCEEM reference code printed on ${label} certificates.`}>
                      <Input id={`certificate-code-${locale}`} name={`certificateCode.${locale}`} defaultValue={course.certificateCodes[locale]} className="font-mono"/>
                    </AdminField>
                    <div className="grid gap-2">
                      <p className="text-sm font-medium">Course material ({label})</p>
                      <div className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="flex items-center gap-2 text-sm">
                          <FileText aria-hidden className="size-4 text-muted-foreground"/>
                          {file ?? <span className="text-red-700 dark:text-red-400">No PDF uploaded yet</span>}
                        </p>
                        <Button type="button" variant="outline" size="sm"><Upload/>{file ? "Replace PDF" : "Upload PDF"}</Button>
                      </div>
                      <p className="text-xs text-muted-foreground">Stored privately. Only enrolled students who are logged in can open it.</p>
                    </div>
                    <div className="grid gap-2">
                      <p className="text-sm font-medium">Exam questions ({label})</p>
                      <div className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="flex items-center gap-2 text-sm">
                          <ListChecks aria-hidden className="size-4 text-muted-foreground"/>
                          {course.questionCounts[locale]} questions
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

        <AdminFormSection title="Exam" description="Applies to both languages and to new attempts. Past attempts keep the settings they were taken with.">
          <AdminField id="pass-mark" label="Pass mark (%)">
            <Input id="pass-mark" name="passMarkPct" type="number" min={1} max={100} defaultValue={course.passMarkPct}/>
          </AdminField>
          <AdminField id="questions-per-attempt" label="Questions per attempt" hint="Drawn at random from the active questions in the student's language.">
            <Input id="questions-per-attempt" name="questionsPerAttempt" type="number" min={1} defaultValue={course.questionsPerAttempt}/>
          </AdminField>
          <AdminField id="time-limit" label="Time limit (minutes)">
            <Input id="time-limit" name="timeLimitMinutes" type="number" min={1} defaultValue={course.timeLimitMinutes}/>
          </AdminField>
          <AdminField id="max-attempts" label="Maximum attempts" hint="Leave blank for unlimited attempts.">
            <Input id="max-attempts" name="maxAttempts" type="number" min={1} placeholder="Unlimited" defaultValue={course.maxAttempts ?? ""}/>
          </AdminField>
          <AdminSwitchField name="shuffleQuestions" label="Shuffle questions" hint="Each attempt shows the questions in a new order." checked={course.shuffleQuestions}/>
          <AdminSwitchField name="shuffleAnswers" label="Shuffle answers" hint="Answer options appear in a new order." checked={course.shuffleAnswers}/>
        </AdminFormSection>

        <AdminFormSection title="Status">
          <AdminSwitchField
            name="active"
            label="Active"
            hint="Inactive courses are hidden from the public site and can't take new enrollments."
            checked={course.active}
            className="sm:col-span-2"
          />
        </AdminFormSection>

        <AdminFormActions submitLabel="Save changes" cancelHref={adminRoutes.courses}/>
      </form>
    </div>
  );
}
