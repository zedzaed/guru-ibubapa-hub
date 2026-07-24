import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const account = await requireRole(["admin"]);
  return <AppShell account={account}>{children}</AppShell>;
}
