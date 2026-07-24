import { Banknote, BookOpenCheck, ClipboardCheck, Megaphone } from "lucide-react";
import { StudentSwitcher } from "@/components/portal/student-switcher";
import { StatCard } from "@/components/portal/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { currentMonthISO } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/require-role";
import type { StudentSummary } from "@/types/database";

type ParentDashboardProps = { searchParams: Promise<{ pelajar?: string }> };

export default async function ParentDashboard({ searchParams }: ParentDashboardProps) {
  const profile = await requireRole(["ibu_bapa"]);
  const { pelajar } = await searchParams;
  const supabase = await createClient();
  const { data: links } = await supabase.from("parents_students").select("students(id,nama,gambar_url,classes(nama_kelas))").eq("parent_id", profile.id);
  const students = (links ?? []).flatMap((link) => link.students ? [link.students] : []) as unknown as StudentSummary[];
  const selectedStudent = students.find((student) => student.id === pelajar) ?? students[0];
  let arrears = 0;
  let attendanceRate = 0;
  if (selectedStudent) {
    const month = currentMonthISO();
    const [year, monthNumber] = month.split("-").map(Number);
    const endDay = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
    const [{ count }, { data: attendance }] = await Promise.all([
      supabase.from("invoices").select("id", { count: "exact", head: true }).eq("student_id", selectedStudent.id).in("status", ["belum_bayar", "tertunggak"]),
      supabase.from("attendance").select("status").eq("student_id", selectedStudent.id).gte("tarikh", `${month}-01`).lte("tarikh", `${month}-${String(endDay).padStart(2, "0")}`),
    ]);
    arrears = count ?? 0;
    if (attendance?.length) attendanceRate = Math.round((attendance.filter((item) => item.status === "hadir" || item.status === "lewat").length / attendance.length) * 100);
  }
  return (
    <div className="space-y-6">
      <div><p className="text-sm font-medium text-primary">Assalamualaikum, {profile.nama}</p><h1 className="text-2xl font-bold tracking-tight">Perkembangan Anak</h1></div>
      <StudentSwitcher students={students} />
      {selectedStudent ? <><Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Paparan semasa</p><p className="mt-1 font-bold">{selectedStudent.nama}</p><p className="text-sm text-muted-foreground">{selectedStudent.classes?.nama_kelas ?? "Kelas belum ditetapkan"}</p></CardContent></Card><section className="grid grid-cols-2 gap-3 lg:grid-cols-4"><StatCard label="Kehadiran bulan ini" value={`${attendanceRate}%`} helper="Hadir termasuk lewat" icon={ClipboardCheck} /><StatCard label="Hafazan terkini" value="—" helper="Data Fasa 3" icon={BookOpenCheck} /><StatCard label="Bil belum selesai" value={String(arrears)} icon={Banknote} /><StatCard label="Pengumuman baharu" value="—" helper="Data Fasa 5" icon={Megaphone} /></section><Card><CardHeader><CardTitle>Keselamatan data anak</CardTitle></CardHeader><CardContent className="text-sm leading-6 text-muted-foreground">Semua bacaan pelajar, termasuk kehadiran, disemak oleh polisi RLS berdasarkan hubungan penjaga dan pelajar.</CardContent></Card></> : <Card><CardContent className="p-6 text-sm text-muted-foreground">Belum ada pelajar dipautkan kepada akaun penjaga ini. Hubungi pihak pentadbiran.</CardContent></Card>}
    </div>
  );
}
