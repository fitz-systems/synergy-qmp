import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { UserForm } from "@/components/admin/user-form";
import { adminRoutes } from "@/constants/admin";
import { getAdminUser } from "@/lib/admin";
import { adminUserHref, fullName } from "@/lib/helpers/admin";

export const metadata: Metadata = {
  title: "Edit user"
}

export default async function AdminEditUserPage({ params }: PageProps<"/admin/users/[id]/edit">) {
  const { id } = await params;
  const user = await getAdminUser(Number(id));
  if (!user) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AdminPageHeader
        title={`Edit ${fullName(user)}`}
        crumbs={[{ label: "Dashboard", href: adminRoutes.dashboard }, { label: "Users", href: adminRoutes.users }, { label: fullName(user), href: adminUserHref(user.id) }, { label: "Edit" }]}
      />
      <UserForm user={user} submitLabel="Save changes" cancelHref={adminUserHref(user.id)}/>
    </div>
  );
}
