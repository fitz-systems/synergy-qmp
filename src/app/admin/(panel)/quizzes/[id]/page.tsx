import Link from "next/link";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Copy, ListChecks } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { QuizForm } from "@/components/admin/quiz-form";
import { Button } from "@/components/ui/button";
import { adminRoutes } from "@/constants/admin";
import { getAdminQuiz } from "@/lib/admin";
import { adminQuizQuestionsHref } from "@/lib/helpers/admin";

export const metadata: Metadata = {
  title: "Quiz settings"
}

export default async function AdminQuizPage({ params }: PageProps<"/admin/quizzes/[id]">) {
  const { id } = await params;
  const quiz = await getAdminQuiz(Number(id));
  if (!quiz) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AdminPageHeader
        title={quiz.title}
        crumbs={[{ label: "Dashboard", href: adminRoutes.dashboard }, { label: "Quizzes", href: adminRoutes.quizzes }, { label: quiz.title }]}
        actions={(
          <>
            <Button variant="outline"><Copy/>Duplicate</Button>
            <Button variant="outline" asChild><Link href={adminQuizQuestionsHref(quiz.id)}><ListChecks/>Questions ({quiz.questionCount})</Link></Button>
          </>
        )}
      />
      <QuizForm quiz={quiz} submitLabel="Save changes" cancelHref={adminRoutes.quizzes}/>
    </div>
  );
}
