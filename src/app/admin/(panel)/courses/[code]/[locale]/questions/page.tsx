import Link from "next/link";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CircleAlert, Download, FileUp, Plus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ToggleBadge } from "@/components/admin/admin-table-parts";
import { AdminTableToolbar } from "@/components/admin/admin-table-toolbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminRoutes, questionListFilters, questionTypeLabels, statusToneStyles } from "@/constants/admin";
import { getAdminQuestions, getCourseQuestionBank } from "@/lib/admin-courses";
import { adminCourseHref, adminQuestionHref, adminQuestionsExportHref, correctAnswerText, languageLabel } from "@/lib/helpers/admin";
import { parseQuestionListQuery, questionListFilterValues } from "@/lib/helpers/admin-courses";

export const metadata: Metadata = {
  title: "Questions"
}

export default async function AdminQuestionsPage({ params, searchParams }: PageProps<"/admin/courses/[code]/[locale]/questions">) {
  const { code, locale } = await params;
  const bank = await getCourseQuestionBank(code, locale);
  if (!bank) notFound();
  const { course } = bank;
  const query = parseQuestionListQuery(await searchParams);
  const questions = await getAdminQuestions(course.code, bank.locale, query);
  const values = questionListFilterValues(query);
  const filtered = query.search !== "" || query.status !== undefined;
  const activeCount = course.activeQuestionCounts[bank.locale];
  const title = `Questions (${languageLabel(bank.locale)})`;

  return (
    <>
      <AdminPageHeader
        title={title}
        description={`${course.names[bank.locale]} · ${activeCount} active of ${course.questionCounts[bank.locale]} · ${course.questionsPerAttempt} drawn for each attempt`}
        crumbs={[
          { label: "Dashboard", href: adminRoutes.dashboard },
          { label: "Courses", href: adminRoutes.courses },
          { label: course.names.en, href: adminCourseHref(course.code) },
          { label: title }
        ]}
        actions={(
          <>
            <Button variant="outline" asChild><a href={adminQuestionsExportHref(course.code, bank.locale)} download><Download/>Export CSV</a></Button>
            <Button variant="outline" asChild><Link href={adminRoutes.importData}><FileUp/>Import CSV</Link></Button>
            <Button asChild><Link href={adminQuestionHref(course.code, bank.locale, "new")}><Plus/>Add question</Link></Button>
          </>
        )}
      />
      {activeCount < course.questionsPerAttempt && (
        <div role="alert" className={`flex gap-2 rounded-md border px-3 py-2 text-sm ${statusToneStyles.danger}`}>
          <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0"/>
          Only {activeCount} questions are active, fewer than the {course.questionsPerAttempt} drawn for each attempt. Students will get shorter exams until more are added.
        </div>
      )}
      <AdminTableToolbar searchLabel="Search questions" filters={questionListFilters} values={values}/>
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
                <TableCell className="max-w-xs whitespace-normal">{correctAnswerText(question)}</TableCell>
                <TableCell><ToggleBadge on={question.active} onLabel="Active" offLabel="Hidden"/></TableCell>
                <TableCell className="pr-4 text-right">
                  <Button variant="ghost" size="sm" asChild><Link href={adminQuestionHref(course.code, bank.locale, question.id)}>Edit</Link></Button>
                </TableCell>
              </TableRow>
            ))}
            {questions.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  {filtered ? "No questions match these filters." : "No questions yet."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
