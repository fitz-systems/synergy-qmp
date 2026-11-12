import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { AdminLogo } from "@/components/admin/admin-logo";
import { SignedInAdminRedirect } from "@/components/admin/signed-in-admin-redirect";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Log in",
  description: "Sign in to the Synergy QMP admin portal with your staff account."
}

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-muted/40 p-6">
      <Suspense>
        <SignedInAdminRedirect/>
      </Suspense>
      <div className="flex items-center gap-2">
        <AdminLogo className="h-7" priority/>
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
