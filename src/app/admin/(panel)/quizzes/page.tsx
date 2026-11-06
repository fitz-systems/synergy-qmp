import Link from "next/link";

import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ToggleBadge } from "@/components/admin/admin-table-parts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminRoutes } from "@/constants/admin";
import { getAdminQuizzes } from "@/lib/admin";
import { adminQuizHref, adminQuizQuestionsHref, courseLabel, languageLabel } from "@/lib/helpers/admin";

export const metadata: Metadata = {
  title: "Quizzes"
}

export default async function AdminQuizzesPage() {
  const quizzes = await getAdminQuizzes();

  return (
    <>
      <AdminPageHeader
        title="Quizzes"
        description="One exam per course and language, each with its own settings and question bank."
        crumbs={[{ label: "Dashboard", href: adminRoutes.dashboard }, { label: "Quizzes" }]}
        actions={<Button asChild><Link href={adminRoutes.newQuiz}><Plus/>Add quiz</Link></Button>}
      />
      <Card className="gap-0 overflow-hidden py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Quiz</TableHead>
              <TableHead>Course</TableHead>
              <TableHead className="text-right">Questions</TableHead>
              <TableHead className="text-right">Pass mark</TableHead>
              <TableHead className="text-right">Time limit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-4 text-right"><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quizzes.map((quiz) => (
              <TableRow key={quiz.id}>
                <TableCell className="pl-4">
                  <Link href={adminQuizHref(quiz.id)} className="font-medium hover:underline">{quiz.title}</Link>
                </TableCell>
                <TableCell>{courseLabel(quiz.courseCode)} · {languageLabel(quiz.locale)}</TableCell>
                <TableCell className="text-right tabular-nums">{quiz.questionsShown} of {quiz.questionCount}</TableCell>
                <TableCell className="text-right tabular-nums">{quiz.passMarkPct}%</TableCell>
                <TableCell className="text-right tabular-nums">{quiz.timeLimitMinutes} min</TableCell>
                <TableCell><ToggleBadge on={quiz.active} onLabel="Active" offLabel="Inactive"/></TableCell>
                <TableCell className="pr-4 text-right">
                  <Button variant="outline" size="sm" asChild><Link href={adminQuizQuestionsHref(quiz.id)}>Questions</Link></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
