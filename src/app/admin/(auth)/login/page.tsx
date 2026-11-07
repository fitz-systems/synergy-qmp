import Image from "next/image";
import logo from "@/assets/images/logo.png";

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { adminRoutes } from "@/constants/admin";
import { adminRole } from "@/constants/auth";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Log in"
}

export default async function AdminLoginPage() {
  const user = await getCurrentUser();
  if (user?.role === adminRole) redirect(adminRoutes.dashboard);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-muted/40 p-6">
      <div className="flex items-center gap-2">
        <Image src={logo} alt="Synergy QMP" priority className="h-7 w-auto"/>
        <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-semibold text-muted-foreground">Admin</span>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Log in to the admin</CardTitle>
          <CardDescription>Use your Synergy QMP staff account.</CardDescription>
        </CardHeader>
        <CardContent>
          <AdminLoginForm/>
        </CardContent>
      </Card>
    </main>
  );
}
