import Link from "next/link";

import { Button } from "@/components/ui/button";
import { adminRoutes } from "@/constants/admin";

export default function AdminNotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-muted/40 p-6 text-center">
      <p className="text-sm font-semibold text-muted-foreground">404</p>
      <h1 className="text-2xl font-semibold tracking-tight">Not found</h1>
      <p className="max-w-sm text-sm text-muted-foreground">That record doesn&apos;t exist, or it may have been deleted.</p>
      <Button asChild><Link href={adminRoutes.dashboard}>Back to the dashboard</Link></Button>
    </main>
  );
}
