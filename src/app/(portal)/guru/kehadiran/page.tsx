import { CalendarCheck2 } from "lucide-react";
import { AttendanceRegister } from "@/components/attendance/attendance-register";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { requireRole } from "@/lib/auth/require-role";
import { formatDateMY, isISODate, todayISO } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { AttendanceStatus } from "@/types/database";

type Params = Promise<{ kelas?: string; tarikh?: string }>;

export default async function TeacherAttendancePage({ searchParams }: { searchParams: Params }) {
  const profile = await requireRole(["guru"]);
  const params = await searchParams;
  const date = params.tarikh && isISODate(params.tarikh) ? params.tarikh : todayISO();
  const supabase = await createClient();
  const { data: classes, error: classError } = await supabase.from("classes").select("id,nama_kelas,tingkatan,tahun").eq("guru_id", profile.id).order("nama_kelas");
  if (classError) throw new Error(classError.message);
  const selectedClass = classes?.find((item) => item.id === params.kelas) ?? classes?.[0] ?? null;

  let students: { id: string; nama: string }[] = [];
  let attendance: { student_id: string; status: AttendanceStatus; sebab: string | null }[] = [];
  if (selectedClass) {
    const { data: studentData, error: studentError } = await supabase.from("students").select("id,nama").eq("kelas_id", selectedClass.id).eq("status", "aktif").order("nama");
    if (studentError) throw new Error(studentError.message);
    students = studentData ?? [];
    if (students.length) {
      const { data: attendanceData, error: attendanceError } = await supabase.from("attendance").select("student_id,status,sebab").eq("tarikh", date).in("student_id", students.map((item) => item.id));
      if (attendanceError) throw new Error(attendanceError.message);
      attendance = (attendanceData ?? []) as typeof attendance;
    }
  }

  return (
    <div className="space-y-5">
      <div><p className="text-sm font-medium text-primary">Rekod harian</p><h1 className="text-2xl font-bold tracking-tight">Ambil Kehadiran</h1><p className="mt-1 text-sm text-muted-foreground">Tap status setiap pelajar dan simpan satu kelas sekali gus.</p></div>
      <Card><CardContent className="p-4"><form method="get" className="grid gap-3 sm:grid-cols-[1fr_190px_auto]">
        <Select name="kelas" defaultValue={selectedClass?.id ?? ""} required>{classes?.length ? classes.map((item) => <option key={item.id} value={item.id}>{item.nama_kelas} — {item.tingkatan}</option>) : <option value="">Tiada kelas ditetapkan</option>}</Select>
        <Input name="tarikh" type="date" defaultValue={date} required />
        <Button type="submit" variant="outline"><CalendarCheck2 className="size-4" /> Papar</Button>
      </form></CardContent></Card>
      {selectedClass ? <><div className="rounded-2xl bg-primary p-4 text-primary-foreground"><p className="text-sm opacity-80">{formatDateMY(date)}</p><h2 className="text-xl font-bold">{selectedClass.nama_kelas}</h2><p className="text-sm opacity-80">{students.length} pelajar aktif</p></div><AttendanceRegister key={`${selectedClass.id}-${date}`} classId={selectedClass.id} date={date} students={students} existing={attendance} /></> : <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">Admin belum menetapkan kelas kepada akaun guru ini.</CardContent></Card>}
    </div>
  );
}
