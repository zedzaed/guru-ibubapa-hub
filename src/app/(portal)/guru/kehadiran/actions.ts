"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/require-role";
import { isISODate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { AttendanceStatus } from "@/types/database";

interface AttendanceInput {
  studentId: string;
  status: AttendanceStatus;
  sebab: string;
}

export async function saveAttendanceAction(input: { classId: string; date: string; records: AttendanceInput[] }) {
  await requireRole(["guru"]);
  if (!input.classId || !isISODate(input.date)) return { success: false, message: "Kelas atau tarikh tidak sah." };
  if (!input.records.length) return { success: false, message: "Tiada pelajar untuk disimpan." };
  const validStatuses = new Set<AttendanceStatus>(["hadir", "lewat", "tidak_hadir", "cuti"]);
  if (input.records.some((record) => !record.studentId || !validStatuses.has(record.status))) return { success: false, message: "Rekod kehadiran tidak sah." };

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return { success: false, message: "Sesi pengguna tidak sah." };

  const payload = input.records.map((record) => ({
    student_id: record.studentId,
    tarikh: input.date,
    status: record.status,
    sebab: record.sebab || null,
    direkod_oleh: authData.user.id,
  }));

  const { error } = await supabase
    .from("attendance")
    .upsert(payload, { onConflict: "student_id,tarikh" });

  if (error) return { success: false, message: error.message };
  revalidatePath("/guru/kehadiran");
  revalidatePath("/ibu-bapa/kehadiran");
  return { success: true, message: `${payload.length} rekod berjaya disimpan.` };
}
