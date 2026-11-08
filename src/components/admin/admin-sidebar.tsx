"use client";

import Link from "next/link";

import { usePathname } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { AdminLogo } from "@/components/admin/admin-logo";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail } from "@/components/ui/sidebar";
import { adminNav, adminRoutes } from "@/constants/admin";
import { isAdminRouteActive } from "@/lib/helpers/admin";

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link href={adminRoutes.dashboard} className="flex h-10 items-center gap-2 rounded-md px-2 group-data-[collapsible=icon]:hidden">
          <AdminLogo className="h-6"/>
          <span className="rounded bg-sidebar-accent px-1.5 py-0.5 text-[0.6875rem] font-semibold text-sidebar-accent-foreground">Admin</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {adminNav.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.route}>
                    <SidebarMenuButton asChild isActive={isAdminRouteActive(pathname, item.route)} tooltip={item.label}>
                      <Link href={adminRoutes[item.route]}>
                        <item.icon/>
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="View public site">
              <Link href="/en">
                <ExternalLink/>
                <span>View public site</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail/>
    </Sidebar>
  );
}
