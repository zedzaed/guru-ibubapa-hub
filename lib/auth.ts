import "server-only";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AppRole, CurrentAccount } from "@/lib/types";

export function portalForRole(role: AppRole) {
  if (role === "admin") return "/admin";
  if (role === "guru") return "/guru";
  return "/ibu-bapa";
}

export async function getCurrentAccount(): Promise<CurrentAccount | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: profile }, { data: roles }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id,nama,email,phone")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true }),
  ]);

  const rolePriority: AppRole[] = ["admin", "guru", "ibu_bapa"];
  const role = rolePriority.find((candidate) =>
    roles?.some((item) => item.role === candidate),
  );

  if (!profile || !role) return null;

  return {
    id: profile.id,
    nama: profile.nama,
    email: profile.email,
    phone: profile.phone,
    role,
  };
}

export async function requireRole(allowedRoles: AppRole[]) {
  const account = await getCurrentAccount();

  if (!account) redirect("/log-masuk");
  if (!allowedRoles.includes(account.role)) redirect("/akses-ditolak");

  return account;
}
