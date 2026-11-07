import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { QuestionForm } from "@/components/admin/question-form";
import { adminRoutes } from "@/constants/admin";
import { getAdminQuestion, getCourseQuestionBank } from "@/lib/admin";
import { adminCourseHref, adminQuestionsHref, languageLabel } from "@/lib/helpers/admin";

export const metadata: Metadata = {
  title: "Question"
}

export default async function AdminQuestionPage({ params }: PageProps<"/admin/courses/[code]/[locale]/questions/[questionId]">) {
  const { code, locale, questionId } = await params;
  const bank = await getCourseQuestionBank(code, locale);
  if (!bank) notFound();
  const { course } = bank;
  const isNew = questionId === "new";
  const question = isNew ? undefined : await getAdminQuestion(course.code, bank.locale, Number(questionId));
  if (!isNew && !question) notFound();
  const title = isNew ? "Add question" : `Question ${question?.sortOrder}`;
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
      />
      <QuestionForm question={question} cancelHref={questionsHref}/>
    </div>
  );
}
