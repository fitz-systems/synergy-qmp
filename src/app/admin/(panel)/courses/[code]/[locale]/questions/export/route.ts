import { notFound } from "next/navigation";
import { getAdminQuestions, getCourseQuestionBank } from "@/lib/admin-courses";
import { questionsCsv, questionsCsvFileName } from "@/lib/helpers/admin-courses";

export async function GET(_request: Request, { params }: RouteContext<"/admin/courses/[code]/[locale]/questions/export">) {
  const { code, locale } = await params;
  const bank = await getCourseQuestionBank(code, locale);
  if (!bank) notFound();
  const questions = await getAdminQuestions(bank.course.code, bank.locale);

  return new Response(questionsCsv(questions), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${questionsCsvFileName(bank.course.code, bank.locale)}"`,
      "Cache-Control": "private, no-store"
    }
  });
}
