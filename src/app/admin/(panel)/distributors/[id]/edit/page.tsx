import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { saveDistributor } from "@/app/admin/(panel)/distributors/actions";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DistributorForm } from "@/components/admin/distributor-form";
import { adminRoutes } from "@/constants/admin";
import { getAdminDistributor } from "@/lib/admin-distributors";
import { adminDistributorHref } from "@/lib/helpers/admin";
import { initialDistributorFormState } from "@/lib/helpers/admin-distributors";

export const metadata: Metadata = {
  title: "Edit distributor"
}

export default async function AdminEditDistributorPage({ params }: PageProps<"/admin/distributors/[id]/edit">) {
  const { id } = await params;
  const distributor = await getAdminDistributor(Number(id));
  if (!distributor) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AdminPageHeader
        title={`Edit ${distributor.name}`}
        crumbs={[{ label: "Dashboard", href: adminRoutes.dashboard }, { label: "Distributors", href: adminRoutes.distributors }, { label: distributor.name, href: adminDistributorHref(distributor.id) }, { label: "Edit" }]}
      />
      <DistributorForm action={saveDistributor.bind(null, distributor.id)} initialState={initialDistributorFormState(distributor)} creating={false} submitLabel="Save changes" cancelHref={adminDistributorHref(distributor.id)}/>
    </div>
  );
}
