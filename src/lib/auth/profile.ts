import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { UserProfile } from "@/types/database";

export const getCurrentProfile = cache(async (): Promise<UserProfile | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("users")
    .select("id,nama,email,phone,role,status")
    .eq("id", user.id)
    .single();

  if (error || !data) return null;
  return data as UserProfile;
});
