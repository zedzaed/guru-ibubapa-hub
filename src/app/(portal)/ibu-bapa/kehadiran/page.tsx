import { AttendanceCalendar } from "@/components/attendance/attendance-calendar";
import { StudentSwitcher } from "@/components/portal/student-switcher";
import { StatCard } from "@/components/portal/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/require-role";
import { currentMonthISO, isISOMonth } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { AttendanceRecord, StudentSummary } from "@/types/database";
import { CheckCircle2, Clock3, Umbrella, UserX } from "lucide-react";

type Params = Promise<{ pelajar?: string; bulan?: string }>;

export default async function ParentAttendancePage({ searchParams }: { searchParams: Params }) {
  const profile = await requireRole(["ibu_bapa"]);
  const params = await searchParams;
  const month = params.bulan && isISOMonth(params.bulan) ? params.bulan : currentMonthISO();
  const supabase = await createClient();
  const { data: links, error: linksError } = await supabase.from("parents_students").select("students(id,nama,gambar_url,classes(nama_kelas))").eq("parent_id", profile.id);
  if (linksError) throw new Error(linksError.message);
  const students = (links ?? []).flatMap((link) => link.students ? [link.students] : []) as unknown as StudentSummary[];
  const selected = students.find((item) => item.id === params.pelajar) ?? students[0] ?? null;
  let records: AttendanceRecord[] = [];
  if (selected) {
    const [year, monthNumber] = month.split("-").map(Number);
    const endDay = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
    const { data, error } = await supabase.from("attendance").select("student_id,tarikh,status,sebab").eq("student_id", selected.id).gte("tarikh", `${month}-01`).lte("tarikh", `${month}-${String(endDay).padStart(2, "0")}`).order("tarikh");
    if (error) throw new Error(error.message);
    records = (data ?? []) as AttendanceRecord[];
  }
  const count = (status: AttendanceRecord["status"]) => records.filter((item) => item.status === status).length;
  const recorded = records.length;
  const attendanceRate = recorded ? Math.round(((count("hadir") + count("lewat")) / recorded) * 100) : 0;

  return (
    <div className="space-y-5">
      <div><p className="text-sm font-medium text-primary">Rekod bulanan</p><h1 className="text-2xl font-bold tracking-tight">Kehadiran</h1><p className="mt-1 text-sm text-muted-foreground">Lihat status kehadiran anak mengikut hari.</p></div>
      <StudentSwitcher students={students} />
      {selected ? <><Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Pelajar dipilih</p><p className="font-bold">{selected.nama}</p><p className="text-sm text-muted-foreground">{selected.classes?.nama_kelas ?? "Kelas belum ditetapkan"}</p></CardContent></Card><section className="grid grid-cols-2 gap-3 lg:grid-cols-5"><StatCard label="Kadar hadir" value={`${attendanceRate}%`} icon={CheckCircle2} /><StatCard label="Hadir" value={String(count("hadir"))} icon={CheckCircle2} /><StatCard label="Lewat" value={String(count("lewat"))} icon={Clock3} /><StatCard label="Tidak hadir" value={String(count("tidak_hadir"))} icon={UserX} /><StatCard label="Cuti" value={String(count("cuti"))} icon={Umbrella} /></section><AttendanceCalendar month={month} records={records} studentId={selected.id} /></> : <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">Belum ada pelajar dipautkan kepada akaun ini.</CardContent></Card>}
    </div>
  );
}
