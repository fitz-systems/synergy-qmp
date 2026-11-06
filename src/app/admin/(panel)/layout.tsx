import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

// Todo: Redirect to /admin/login unless the session belongs to an admin
export default function AdminPanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <SidebarProvider>
      <AdminSidebar/>
      <SidebarInset>
        <AdminTopbar/>
        <div className="flex-1 bg-muted/30">
          <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
