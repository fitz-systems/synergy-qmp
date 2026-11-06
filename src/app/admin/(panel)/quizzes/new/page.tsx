import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { QuizForm } from "@/components/admin/quiz-form";
import { adminRoutes } from "@/constants/admin";

export const metadata: Metadata = {
  title: "Add quiz"
}

export default function AdminNewQuizPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AdminPageHeader
        title="Add quiz"
        description="Create a quiz for a course and language, then add its questions."
        crumbs={[{ label: "Dashboard", href: adminRoutes.dashboard }, { label: "Quizzes", href: adminRoutes.quizzes }, { label: "Add quiz" }]}
      />
      <QuizForm submitLabel="Create quiz" cancelHref={adminRoutes.quizzes}/>
    </div>
  );
}
