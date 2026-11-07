"use server";

import { redirect } from "next/navigation";
import { adminRoutes } from "@/constants/admin";
import { signOut } from "@/lib/session";

export async function signOutAdmin() {
  await signOut();
  redirect(adminRoutes.login);
}
