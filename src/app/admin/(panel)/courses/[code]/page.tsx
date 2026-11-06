import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FileText, Upload } from "lucide-react";
import { AdminField, AdminFormActions, AdminFormSection } from "@/components/admin/admin-form-parts";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { adminRoutes, languageOptions } from "@/constants/admin";
import { getAdminCourse } from "@/lib/admin";

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
            <CardDescription>Each language has its own name, description and course material PDF.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="en" className="gap-5">
              <TabsList>
                {languageOptions.map((option) => <TabsTrigger key={option.value} value={option.value}>{option.label}</TabsTrigger>)}
              </TabsList>
              {languageOptions.map(({ value: locale, label }) => {
                const file = course.materialFiles[locale as keyof typeof course.materialFiles];
                return (
                  <TabsContent key={locale} value={locale} className="grid gap-5">
                    <AdminField id={`name-${locale}`} label={`Name (${label})`}>
                      <Input id={`name-${locale}`} name={`name.${locale}`} defaultValue={course.names[locale as keyof typeof course.names]}/>
                    </AdminField>
                    <AdminField id={`description-${locale}`} label={`Description (${label})`}>
                      <Textarea id={`description-${locale}`} name={`description.${locale}`} rows={3} defaultValue={course.descriptions[locale as keyof typeof course.descriptions]}/>
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
                  </TabsContent>
                );
              })}
            </Tabs>
          </CardContent>
        </Card>

        <AdminFormSection title="Certification">
          <AdminField id="certificate-code" label="Certificate code" hint="Printed on every certificate for this course.">
            <Input id="certificate-code" name="certificateCode" defaultValue={course.certificateCode} className="font-mono"/>
          </AdminField>
          <AdminField id="pass-mark" label="Default pass mark (%)">
            <Input id="pass-mark" name="passMarkPct" type="number" min={1} max={100} defaultValue={course.passMarkPct}/>
          </AdminField>
          <div className="flex items-center justify-between gap-4 rounded-lg border p-4 sm:col-span-2">
            <div>
              <p className="text-sm font-medium">Active</p>
              <p className="text-xs text-muted-foreground">Inactive courses are hidden from the public site and can&apos;t take new enrollments.</p>
            </div>
            <Switch name="active" defaultChecked={course.active} aria-label="Active"/>
          </div>
        </AdminFormSection>

        <AdminFormActions submitLabel="Save changes" cancelHref={adminRoutes.courses}/>
      </form>
    </div>
  );
}
