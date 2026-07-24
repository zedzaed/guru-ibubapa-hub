"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { portalPathForRole } from "@/lib/auth/require-role";
import type { UserRole } from "@/types/database";

function normalisePhone(value: string) {
  const cleaned = value.replace(/[\s()-]/g, "");
  if (cleaned.startsWith("+")) return cleaned;
  if (cleaned.startsWith("60")) return `+${cleaned}`;
  if (cleaned.startsWith("0")) return `+6${cleaned}`;
  return cleaned;
}

export async function loginAction(formData: FormData) {
  const identifier = String(formData.get("identifier") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!identifier || !password) {
    redirect("/login?ralat=Sila+isi+e-mel%2Ftelefon+dan+kata+laluan");
  }

  const supabase = await createClient();
  const credentials = identifier.includes("@")
    ? { email: identifier.toLowerCase(), password }
    : { phone: normalisePhone(identifier), password };

  const { error } = await supabase.auth.signInWithPassword(credentials);
  if (error) {
    redirect(`/login?ralat=${encodeURIComponent("Maklumat log masuk tidak sah")}`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?ralat=Sesi+tidak+dapat+disahkan");

  const [{ data: profile }, { data: roleRow }] = await Promise.all([
    supabase.from("profiles").select("status").eq("id", user.id).single(),
    supabase.from("user_roles").select("role").eq("user_id", user.id).limit(1).maybeSingle(),
  ]);

  if (!profile || profile.status !== "aktif" || !roleRow) {
    await supabase.auth.signOut();
    redirect("/login?ralat=Akaun+belum+aktif+atau+telah+digantung");
  }

  redirect(portalPathForRole(roleRow.role as UserRole));
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
