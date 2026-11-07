import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteQuestion, saveQuestion } from "@/app/admin/(panel)/courses/actions";
import { AdminConfirmAction } from "@/components/admin/admin-actions";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { QuestionForm } from "@/components/admin/question-form";
import { Button } from "@/components/ui/button";
import { adminRoutes } from "@/constants/admin";
import { getAdminQuestion, getCourseQuestionBank, getNextQuestionSortOrder } from "@/lib/admin-courses";
import { adminCourseHref, adminQuestionsHref, languageLabel } from "@/lib/helpers/admin";
import { initialQuestionFormState } from "@/lib/helpers/admin-courses";

export const metadata: Metadata = {
  title: "Question"
}

export default async function AdminQuestionPage({ params }: PageProps<"/admin/courses/[code]/[locale]/questions/[questionId]">) {
  const { code, locale, questionId } = await params;
  const bank = await getCourseQuestionBank(code, locale);
  if (!bank) notFound();
  const { course } = bank;
  const id = questionId === "new" ? null : Number(questionId);
  const question = id === null ? undefined : (await getAdminQuestion(course.code, bank.locale, id)) ?? undefined;
  if (id !== null && !question) notFound();
  const nextSortOrder = question ? question.sortOrder : await getNextQuestionSortOrder(course.code, bank.locale);
  const title = question ? `Question ${question.sortOrder}` : "Add question";
  const questionsHref = adminQuestionsHref(course.code, bank.locale);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AdminPageHeader
        title={title}
        description={course.names[bank.locale]}
        crumbs={[
          { label: "Dashboard", href: adminRoutes.dashboard },
          { label: "Courses", href: adminRoutes.courses },
          { label: course.names.en, href: adminCourseHref(course.code) },
          { label: `Questions (${languageLabel(bank.locale)})`, href: questionsHref },
          { label: title }
        ]}
        actions={question && (
          <AdminConfirmAction
            action={deleteQuestion.bind(null, course.code, bank.locale, question.id)}
            trigger={<Button variant="outline"><Trash2/>Delete</Button>}
            title="Delete this question?"
            description="It's removed from the question bank for good. Past attempts keep the question and answers as they were asked. To take it out of new exams but keep it, turn off Active instead."
            confirmLabel="Delete question"
            destructive
          />
        )}
      />
      <QuestionForm
        action={saveQuestion.bind(null, course.code, bank.locale, question?.id ?? null)}
        initialState={initialQuestionFormState(question, bank.locale, nextSortOrder)}
        locale={bank.locale}
        submitLabel={question ? "Save question" : "Add question"}
        cancelHref={questionsHref}
      />
    </div>
  );
}
