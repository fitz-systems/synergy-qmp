import { redirect } from "next/navigation";
import { adminRoutes } from "@/constants/admin";
import { adminRole } from "@/constants/auth";
import { getCurrentUser } from "@/lib/session";

export async function SignedInAdminRedirect() {
  const user = await getCurrentUser();
  if (user?.role === adminRole) redirect(adminRoutes.dashboard);
  return null;
}
