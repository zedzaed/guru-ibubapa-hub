"use server";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/require-role";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/database";

const allowedRoles: UserRole[] = ["admin", "guru", "ibu_bapa"];

function messageRedirect(type: "berjaya" | "ralat", message: string): never {
  redirect(`/admin/pengguna?${type}=${encodeURIComponent(message)}`);
}

function normalizePhone(value: string) {
  const cleaned = value.replace(/[\s()-]/g, "");
  if (!cleaned) return null;
  if (cleaned.startsWith("+")) return cleaned;
  if (cleaned.startsWith("60")) return `+${cleaned}`;
  if (cleaned.startsWith("0")) return `+6${cleaned}`;
  return cleaned;
}

export async function createUserAction(formData: FormData) {
  await requireRole(["admin"]);

  const nama = String(formData.get("nama") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = normalizePhone(String(formData.get("phone") ?? "").trim());
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "") as UserRole;

  if (!nama || !email || !password || !allowedRoles.includes(role)) {
    messageRedirect("ralat", "Sila lengkapkan nama, e-mel, kata laluan dan peranan.");
  }

  if (password.length < 8) {
    messageRedirect("ralat", "Kata laluan sementara mesti sekurang-kurangnya 8 aksara.");
  }

  const { url, key } = getSupabaseEnv();
  if (!url || !key) {
    messageRedirect("ralat", "Konfigurasi Supabase tidak lengkap.");
  }

  const signupClient = createSupabaseClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  const { data: signupData, error: signupError } = await signupClient.auth.signUp({
    email,
    password,
    options: {
      data: { nama, phone, role },
    },
  });

  if (signupError || !signupData.user) {
    messageRedirect("ralat", signupError?.message ?? "Akaun Auth tidak berjaya diwujudkan.");
  }

  const supabase = await createClient();
  const userId = signupData.user.id;

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: userId,
      nama,
      email,
      phone,
      status: "aktif",
    },
    { onConflict: "id" },
  );

  if (profileError) {
    messageRedirect("ralat", `Akaun Auth dicipta tetapi profil gagal disimpan: ${profileError.message}`);
  }

  const { error: roleError } = await supabase.from("user_roles").upsert(
    {
      user_id: userId,
      role,
    },
    { onConflict: "user_id,role" },
  );

  if (roleError) {
    messageRedirect("ralat", `Profil dicipta tetapi peranan gagal ditetapkan: ${roleError.message}`);
  }

  revalidatePath("/admin/pengguna");
  messageRedirect("berjaya", `Akaun ${nama} berjaya dicipta.`);
}

export async function updateUserStatusAction(formData: FormData) {
  const currentAdmin = await requireRole(["admin"]);
  const userId = String(formData.get("user_id") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!userId || !["aktif", "tidak_aktif"].includes(status)) {
    messageRedirect("ralat", "Maklumat pengguna tidak sah.");
  }

  if (userId === currentAdmin.id && status !== "aktif") {
    messageRedirect("ralat", "Akaun admin yang sedang digunakan tidak boleh dinyahaktifkan.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ status }).eq("id", userId);

  if (error) messageRedirect("ralat", error.message);

  revalidatePath("/admin/pengguna");
  messageRedirect("berjaya", "Status pengguna berjaya dikemas kini.");
}
