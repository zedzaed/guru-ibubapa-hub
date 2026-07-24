import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { UserProfile } from "@/types/database";

export const getCurrentProfile = cache(async (): Promise<UserProfile | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: profile, error: profileError }, { data: roleRow, error: roleError }] = await Promise.all([
    supabase.from("profiles").select("id,nama,email,phone,status").eq("id", user.id).single(),
    supabase.from("user_roles").select("role").eq("user_id", user.id).limit(1).maybeSingle(),
  ]);

  if (profileError || roleError || !profile || !roleRow) return null;

  return {
    ...profile,
    role: roleRow.role,
  } as UserProfile;
});
