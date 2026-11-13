import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { saveUser } from "@/app/admin/(panel)/users/actions";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { UserForm } from "@/components/admin/user-form";
import { adminRoutes } from "@/constants/admin";
import { getCompanyPickerData } from "@/lib/admin-distributors";
import { getAdminUserDetail } from "@/lib/admin-users";
import { adminUserHref, fullName, initialUserFormState } from "@/lib/helpers/admin";

export const metadata: Metadata = {
  title: "Edit user"
}

export default async function AdminEditUserPage({ params }: PageProps<"/admin/users/[id]/edit">) {
  const { id } = await params;
  const [user, companies] = await Promise.all([getAdminUserDetail(Number(id)), getCompanyPickerData()]);
  if (!user) notFound();
  const currentSeat = user.current ? { companyId: user.current.companyId, seatDistributorId: user.current.seatDistributorId } : undefined;
  const name = fullName(user);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AdminPageHeader
        title={`Edit ${name}`}
        crumbs={[{ label: "Dashboard", href: adminRoutes.dashboard }, { label: "Users", href: adminRoutes.users }, { label: name, href: adminUserHref(user.id) }, { label: "Edit" }]}
      />
      <UserForm action={saveUser.bind(null, user.id)} initialState={initialUserFormState(user)} companies={companies} currentSeat={currentSeat} creating={false} submitLabel="Save changes" cancelHref={adminUserHref(user.id)}/>
    </div>
  );
}
