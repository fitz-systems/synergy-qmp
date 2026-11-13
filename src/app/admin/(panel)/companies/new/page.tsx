import type { Metadata } from "next";
import { saveCompany } from "@/app/admin/(panel)/companies/actions";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CompanyForm } from "@/components/admin/company-form";
import { adminRoutes, companyListFilterParam } from "@/constants/admin";
import { getDistributorOptions } from "@/lib/admin-distributors";
import { positiveIdOf, searchParamValue } from "@/lib/helpers/admin";
import { initialCompanyFormState } from "@/lib/helpers/admin-distributors";

export const metadata: Metadata = {
  title: "Add company"
}

export default async function AdminNewCompanyPage({ searchParams }: PageProps<"/admin/companies/new">) {
  const distributors = await getDistributorOptions();
  const requested = positiveIdOf(searchParamValue(await searchParams, companyListFilterParam));
  const distributorId = distributors.some((distributor) => distributor.id === requested) ? requested : undefined;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AdminPageHeader
        title="Add company"
        crumbs={[{ label: "Dashboard", href: adminRoutes.dashboard }, { label: "Companies", href: adminRoutes.companies }, { label: "Add company" }]}
      />
      <CompanyForm action={saveCompany.bind(null, null)} initialState={initialCompanyFormState(undefined, distributorId)} distributors={distributors} creating submitLabel="Add company" cancelHref={adminRoutes.companies}/>
    </div>
  );
}
