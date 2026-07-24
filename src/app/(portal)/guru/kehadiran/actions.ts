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
  const { data, error } = await supabase.rpc("save_class_attendance", {
    p_class_id: input.classId,
    p_tarikh: input.date,
    p_records: input.records.map((record) => ({ student_id: record.studentId, status: record.status, sebab: record.sebab || null })),
  });
  if (error) return { success: false, message: error.message };
  revalidatePath("/guru/kehadiran");
  revalidatePath("/ibu-bapa/kehadiran");
  return { success: true, message: `${Number(data ?? input.records.length)} rekod berjaya disimpan.` };
}
