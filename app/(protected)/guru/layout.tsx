import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/lib/auth";

export default async function TeacherLayout({ children }: { children: ReactNode }) {
  const account = await requireRole(["guru"]);
  return <AppShell account={account}>{children}</AppShell>;
}
