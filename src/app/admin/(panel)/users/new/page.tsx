import type { Metadata } from "next";
import { saveUser } from "@/app/admin/(panel)/users/actions";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { UserForm } from "@/components/admin/user-form";
import { adminRoutes } from "@/constants/admin";
import { initialUserFormState } from "@/lib/helpers/admin";

export const metadata: Metadata = {
  title: "Add user"
}

export default function AdminNewUserPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AdminPageHeader
        title="Add user"
        description="Create a student account and enroll them in a course."
        crumbs={[{ label: "Dashboard", href: adminRoutes.dashboard }, { label: "Users", href: adminRoutes.users }, { label: "Add user" }]}
      />
      <UserForm action={saveUser.bind(null, null)} initialState={initialUserFormState()} creating submitLabel="Create user" cancelHref={adminRoutes.users}/>
    </div>
  );
}
