import Link from "next/link";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Trash2, Users } from "lucide-react";
import { deleteCompany, mergeCompany, saveCompany } from "@/app/admin/(panel)/companies/actions";
import { AdminConfirmAction } from "@/components/admin/admin-actions";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CompanyForm } from "@/components/admin/company-form";
import { MergeCompanyAction } from "@/components/admin/merge-company-action";
import { Button } from "@/components/ui/button";
import { adminRoutes } from "@/constants/admin";
import { getAdminCompany, getCompanyPickerData } from "@/lib/admin-distributors";
import { adminCompanyUsersHref } from "@/lib/helpers/admin";
import { initialCompanyFormState } from "@/lib/helpers/admin-distributors";

export const metadata: Metadata = {
  title: "Edit company"
}

export default async function AdminCompanyPage({ params }: PageProps<"/admin/companies/[id]">) {
  const { id } = await params;
  const [company, picker] = await Promise.all([getAdminCompany(Number(id)), getCompanyPickerData()]);
  if (!company) notFound();
  const enrollments = `${company.studentCount.toLocaleString("en-CA")} ${company.studentCount === 1 ? "enrollment" : "enrollments"}`;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AdminPageHeader
        title={company.name}
        description={company.distributor ? `${enrollments} · ${company.distributor}` : enrollments}
        crumbs={[{ label: "Dashboard", href: adminRoutes.dashboard }, { label: "Companies", href: adminRoutes.companies }, { label: company.name }]}
        actions={(
          <>
            <Button variant="outline" asChild><Link href={adminCompanyUsersHref(company.id)}><Users/>Students</Link></Button>
            {company.studentCount > 0 ? (
              <MergeCompanyAction action={mergeCompany.bind(null, company.id)} companyId={company.id} companyName={company.name} studentCount={company.studentCount} data={picker}/>
            ) : (
              <AdminConfirmAction
                action={deleteCompany.bind(null, company.id)}
                trigger={<Button variant="outline"><Trash2/>Delete</Button>}
                title={`Delete ${company.name}?`}
                description="It has no students, so nothing else changes."
                confirmLabel="Delete company"
                destructive
              />
            )}
          </>
        )}
      />
      <CompanyForm
        action={saveCompany.bind(null, company.id)}
        initialState={initialCompanyFormState(company)}
        distributors={picker.distributors}
        creating={false}
        submitLabel="Save changes"
        cancelHref={adminRoutes.companies}
      />
    </div>
  );
}
