import Link from "next/link";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Download, FileUp, Plus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ToggleBadge } from "@/components/admin/admin-table-parts";
import { AdminTableToolbar } from "@/components/admin/admin-table-toolbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminRoutes, questionTypeLabels } from "@/constants/admin";
import { getAdminQuestions, getCourseQuestionBank } from "@/lib/admin";
import { adminCourseHref, adminQuestionHref, correctAnswerText, languageLabel } from "@/lib/helpers/admin";

export const metadata: Metadata = {
  title: "Questions"
}

export default async function AdminQuestionsPage({ params }: PageProps<"/admin/courses/[code]/[locale]/questions">) {
  const { code, locale } = await params;
  const bank = await getCourseQuestionBank(code, locale);
  if (!bank) notFound();
  const { course } = bank;
  const questions = await getAdminQuestions(course.code, bank.locale);
  const title = `Questions (${languageLabel(bank.locale)})`;

  return (
    <>
      <AdminPageHeader
        title={title}
        description={`${course.names[bank.locale]} · ${course.questionsPerAttempt} of these are drawn for each attempt`}
        crumbs={[
          { label: "Dashboard", href: adminRoutes.dashboard },
          { label: "Courses", href: adminRoutes.courses },
          { label: course.names.en, href: adminCourseHref(course.code) },
          { label: title }
        ]}
        actions={(
          <>
            <Button variant="outline"><Download/>Export CSV</Button>
            <Button variant="outline" asChild><Link href={adminRoutes.importData}><FileUp/>Import CSV</Link></Button>
            <Button asChild><Link href={adminQuestionHref(course.code, bank.locale, "new")}><Plus/>Add question</Link></Button>
          </>
        )}
      />
      <AdminTableToolbar searchLabel="Search questions"/>
      <Card className="gap-0 overflow-hidden py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 pl-4">#</TableHead>
              <TableHead>Question</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Correct answer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-4 text-right"><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {questions.map((question) => (
              <TableRow key={question.id}>
                <TableCell className="pl-4 tabular-nums text-muted-foreground">{question.sortOrder}</TableCell>
                <TableCell className="max-w-md whitespace-normal font-medium">{question.prompt}</TableCell>
                <TableCell><Badge variant="secondary">{questionTypeLabels[question.type]}</Badge></TableCell>
                <TableCell>{correctAnswerText(question)}</TableCell>
                <TableCell><ToggleBadge on={question.active} onLabel="Active" offLabel="Hidden"/></TableCell>
                <TableCell className="pr-4 text-right">
                  <Button variant="ghost" size="sm" asChild><Link href={adminQuestionHref(course.code, bank.locale, question.id)}>Edit</Link></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
