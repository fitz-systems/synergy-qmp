import Link from "next/link";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Download, FileUp, Plus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTableToolbar, ToggleBadge } from "@/components/admin/admin-table-parts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminRoutes, questionTypeLabels } from "@/constants/admin";
import { getAdminQuestions, getAdminQuiz } from "@/lib/admin";
import { adminQuestionHref, adminQuizHref, correctAnswerText } from "@/lib/helpers/admin";

export const metadata: Metadata = {
  title: "Questions"
}

export default async function AdminQuestionsPage({ params }: PageProps<"/admin/quizzes/[id]/questions">) {
  const { id } = await params;
  const quiz = await getAdminQuiz(Number(id));
  if (!quiz) notFound();
  const questions = await getAdminQuestions(quiz.id);

  return (
    <>
      <AdminPageHeader
        title="Questions"
        description={`${quiz.title} · ${quiz.questionsShown} of these are drawn for each attempt`}
        crumbs={[{ label: "Dashboard", href: adminRoutes.dashboard }, { label: "Quizzes", href: adminRoutes.quizzes }, { label: quiz.title, href: adminQuizHref(quiz.id) }, { label: "Questions" }]}
        actions={(
          <>
            <Button variant="outline"><Download/>Export CSV</Button>
            <Button variant="outline" asChild><Link href={adminRoutes.importData}><FileUp/>Import CSV</Link></Button>
            <Button asChild><Link href={adminQuestionHref(quiz.id, "new")}><Plus/>Add question</Link></Button>
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
                  <Button variant="ghost" size="sm" asChild><Link href={adminQuestionHref(quiz.id, question.id)}>Edit</Link></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
