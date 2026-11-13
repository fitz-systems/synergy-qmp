import type { Metadata } from "next";
import { saveDistributor } from "@/app/admin/(panel)/distributors/actions";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DistributorForm } from "@/components/admin/distributor-form";
import { adminRoutes } from "@/constants/admin";
import { initialDistributorFormState } from "@/lib/helpers/admin-distributors";

export const metadata: Metadata = {
  title: "Add distributor"
}

export default function AdminNewDistributorPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AdminPageHeader
        title="Add distributor"
        crumbs={[{ label: "Dashboard", href: adminRoutes.dashboard }, { label: "Distributors", href: adminRoutes.distributors }, { label: "Add distributor" }]}
      />
      <DistributorForm action={saveDistributor.bind(null, null)} initialState={initialDistributorFormState()} creating submitLabel="Add distributor" cancelHref={adminRoutes.distributors}/>
    </div>
  );
}
