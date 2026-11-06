import Image from "next/image";
import logo from "@/assets/images/logo.png";

import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata: Metadata = {
  title: "Log in"
}

// Todo: Sign in through Better Auth and only allow accounts with the admin role
export default function AdminLoginPage() {
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
          <form className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="admin-email">Email</Label>
              <Input id="admin-email" name="email" type="email" autoComplete="username" required/>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="admin-password">Password</Label>
              <Input id="admin-password" name="password" type="password" autoComplete="current-password" required/>
            </div>
            <Button type="button" className="w-full">Log in</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
