import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/lib/auth";

export default async function ParentLayout({ children }: { children: ReactNode }) {
  const account = await requireRole(["ibu_bapa"]);
  return <AppShell account={account}>{children}</AppShell>;
}
