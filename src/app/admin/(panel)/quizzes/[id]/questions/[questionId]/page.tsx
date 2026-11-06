import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { QuestionForm } from "@/components/admin/question-form";
import { adminRoutes } from "@/constants/admin";
import { getAdminQuestion, getAdminQuiz } from "@/lib/admin";
import { adminQuizHref, adminQuizQuestionsHref } from "@/lib/helpers/admin";

export const metadata: Metadata = {
  title: "Question"
}

export default async function AdminQuestionPage({ params }: PageProps<"/admin/quizzes/[id]/questions/[questionId]">) {
  const { id, questionId } = await params;
  const quiz = await getAdminQuiz(Number(id));
  if (!quiz) notFound();
  const isNew = questionId === "new";
  const question = isNew ? undefined : await getAdminQuestion(Number(questionId));
  if (!isNew && !question) notFound();
  const title = isNew ? "Add question" : `Question ${question?.sortOrder}`;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AdminPageHeader
        title={title}
        description={quiz.title}
        crumbs={[
          { label: "Dashboard", href: adminRoutes.dashboard },
          { label: "Quizzes", href: adminRoutes.quizzes },
          { label: quiz.title, href: adminQuizHref(quiz.id) },
          { label: "Questions", href: adminQuizQuestionsHref(quiz.id) },
          { label: title }
        ]}
      />
      <QuestionForm question={question} cancelHref={adminQuizQuestionsHref(quiz.id)}/>
    </div>
  );
}
