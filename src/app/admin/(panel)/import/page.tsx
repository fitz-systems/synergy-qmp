import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ImportPanel } from "@/components/admin/import-panel";
import { adminRoutes } from "@/constants/admin";
import { getAdminCourses } from "@/lib/admin-courses";
import { questionBanks } from "@/lib/helpers/admin";

export const metadata: Metadata = {
  title: "Import"
}

export default async function AdminImportPage() {
  const courses = await getAdminCourses();

  return (
    <>
      <AdminPageHeader
        title="Import"
        description="Add students or questions in bulk from a CSV file. You see a preview first; rows with problems are skipped and listed so you can fix them."
        crumbs={[{ label: "Dashboard", href: adminRoutes.dashboard }, { label: "Import" }]}
      />
      <ImportPanel banks={questionBanks(courses)}/>
    </>
  );
}
