import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { adminIdentity } from "@/lib/helpers/admin";
import { requireAdminShell } from "@/lib/session";

export const instant = false;

export default async function AdminPanelLayout({ children }: LayoutProps<"/admin">) {
  const admin = adminIdentity(await requireAdminShell());

  return (
    <SidebarProvider>
      <AdminSidebar/>
      <SidebarInset>
        <AdminTopbar admin={admin}/>
        <div className="flex-1 bg-muted/30">
          <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
