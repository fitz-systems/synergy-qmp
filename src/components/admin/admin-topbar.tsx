"use client";

import { useTransition } from "react";
import { LogOut, UserRound } from "lucide-react";
import { signOutAdmin } from "@/app/admin/actions";
import { ThemeToggle } from "@/components/admin/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { initialsOf } from "@/lib/helpers/admin";
import type { AdminIdentity } from "@/types/admin";

interface AdminTopbarProps {
  admin: AdminIdentity;
}

export function AdminTopbar({ admin }: AdminTopbarProps) {
  const [signingOut, startSignOut] = useTransition();

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur">
      <SidebarTrigger className="-ml-1"/>
      <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4"/>
      <div className="flex-1"/>
      <ThemeToggle/>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-9 gap-2 px-2">
            <Avatar className="size-7">
              <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">{initialsOf(admin.name)}</AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium sm:inline">{admin.name}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <p className="text-sm font-medium">{admin.name}</p>
            <p className="text-xs text-muted-foreground">{admin.email}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator/>
          <DropdownMenuItem disabled>
            <UserRound/>
            Account settings
          </DropdownMenuItem>
          <DropdownMenuItem disabled={signingOut} onSelect={() => startSignOut(() => signOutAdmin())}>
            <LogOut/>
            {signingOut ? "Logging out…" : "Log out"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
