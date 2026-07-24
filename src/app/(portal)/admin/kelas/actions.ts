"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/require-role";
import { optionalText, requiredInteger, requiredText } from "@/lib/forms";
import { createClient } from "@/lib/supabase/server";

export async function saveClassAction(formData: FormData) {
  await requireRole(["admin"]);
  const supabase = await createClient();
  const id = optionalText(formData, "id");
  const payload = {
    nama_kelas: requiredText(formData, "nama_kelas", "Nama kelas"),
    tingkatan: requiredText(formData, "tingkatan", "Tingkatan"),
    guru_id: optionalText(formData, "guru_id"),
    tahun: requiredInteger(formData, "tahun", "Tahun"),
  };
  const result = id
    ? await supabase.from("classes").update(payload).eq("id", id)
    : await supabase.from("classes").insert(payload);
  if (result.error) throw new Error(result.error.message);
  revalidatePath("/admin/kelas");
  redirect("/admin/kelas?berjaya=kelas-disimpan");
}

export async function deleteClassAction(formData: FormData) {
  await requireRole(["admin"]);
  const id = requiredText(formData, "id", "ID kelas");
  const supabase = await createClient();
  const { error } = await supabase.from("classes").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/kelas");
  redirect("/admin/kelas?berjaya=kelas-dipadam");
}
