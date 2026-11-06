import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ImportPanel } from "@/components/admin/import-panel";
import { adminRoutes } from "@/constants/admin";
import { getAdminQuizzes, getImportPreview } from "@/lib/admin";

export const metadata: Metadata = {
  title: "Import"
}

export default async function AdminImportPage() {
  const [preview, quizzes] = await Promise.all([getImportPreview(), getAdminQuizzes()]);

  return (
    <>
      <AdminPageHeader
        title="Import"
        description="Add students or questions in bulk from a CSV file. Rows with problems are skipped and listed so you can fix them."
        crumbs={[{ label: "Dashboard", href: adminRoutes.dashboard }, { label: "Import" }]}
      />
      <ImportPanel preview={preview} quizzes={quizzes}/>
    </>
  );
}
