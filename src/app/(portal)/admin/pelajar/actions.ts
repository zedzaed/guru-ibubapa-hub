"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/require-role";
import { optionalText, requiredInteger, requiredText } from "@/lib/forms";
import { createClient } from "@/lib/supabase/server";
import type { GenderType, StudentStatus } from "@/types/database";

function fail(error: { message?: string } | null) {
  if (error) throw new Error(error.message ?? "Operasi gagal.");
}

export async function saveStudentAction(formData: FormData) {
  await requireRole(["admin"]);
  const supabase = await createClient();
  const id = optionalText(formData, "id");
  const jantina = requiredText(formData, "jantina", "Jantina") as GenderType;
  const status = requiredText(formData, "status", "Status") as StudentStatus;

  if (!["lelaki", "perempuan"].includes(jantina)) throw new Error("Jantina tidak sah.");
  if (!["aktif", "tidak_aktif", "tamat", "berhenti"].includes(status)) throw new Error("Status tidak sah.");

  const payload = {
    nama: requiredText(formData, "nama", "Nama"),
    no_kp: optionalText(formData, "no_kp"),
    tarikh_lahir: requiredText(formData, "tarikh_lahir", "Tarikh lahir"),
    jantina,
    kelas_id: optionalText(formData, "kelas_id"),
    tahun_masuk: requiredInteger(formData, "tahun_masuk", "Tahun masuk"),
    status,
  };

  if (id) {
    const { error } = await supabase.from("students").update(payload).eq("id", id);
    fail(error);
  } else {
    const { error } = await supabase.from("students").insert(payload);
    fail(error);
  }

  revalidatePath("/admin/pelajar");
  redirect("/admin/pelajar?berjaya=pelajar-disimpan");
}

export async function deleteStudentAction(formData: FormData) {
  await requireRole(["admin"]);
  const id = requiredText(formData, "id", "ID pelajar");
  const supabase = await createClient();
  const { error } = await supabase.from("students").delete().eq("id", id);
  fail(error);
  revalidatePath("/admin/pelajar");
  redirect("/admin/pelajar?berjaya=pelajar-dipadam");
}

export async function linkGuardianAction(formData: FormData) {
  await requireRole(["admin"]);
  const studentId = requiredText(formData, "student_id", "Pelajar");
  const parentId = requiredText(formData, "parent_id", "Penjaga");
  const hubungan = requiredText(formData, "hubungan", "Hubungan");
  const supabase = await createClient();
  const { error } = await supabase.from("parents_students").upsert(
    { student_id: studentId, parent_id: parentId, hubungan },
    { onConflict: "parent_id,student_id" },
  );
  fail(error);
  revalidatePath("/admin/pelajar");
  redirect(`/admin/pelajar?pelajar=${studentId}&berjaya=penjaga-dikaitkan`);
}

export async function unlinkGuardianAction(formData: FormData) {
  await requireRole(["admin"]);
  const studentId = requiredText(formData, "student_id", "Pelajar");
  const parentId = requiredText(formData, "parent_id", "Penjaga");
  const supabase = await createClient();
  const { error } = await supabase
    .from("parents_students")
    .delete()
    .eq("student_id", studentId)
    .eq("parent_id", parentId);
  fail(error);
  revalidatePath("/admin/pelajar");
  redirect(`/admin/pelajar?pelajar=${studentId}&berjaya=penjaga-dibuang`);
}
