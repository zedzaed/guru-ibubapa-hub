import Link from "next/link";
import { CheckCircle2, ClipboardCheck, School, UsersRound } from "lucide-react";
import { StatCard } from "@/components/portal/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/require-role";
import { todayISO } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export default async function TeacherDashboard() {
  const profile = await requireRole(["guru"]);
  const supabase = await createClient();
  const { data: classes } = await supabase.from("classes").select("id,nama_kelas").eq("guru_id", profile.id);
  const classIds = (classes ?? []).map((item) => item.id);
  const { data: students } = classIds.length ? await supabase.from("students").select("id").in("kelas_id", classIds).eq("status", "aktif") : { data: [] };
  const studentIds = (students ?? []).map((item) => item.id);
  const { count: recordedToday } = studentIds.length ? await supabase.from("attendance").select("id", { count: "exact", head: true }).eq("tarikh", todayISO()).in("student_id", studentIds) : { count: 0 };
  const complete = studentIds.length > 0 && (recordedToday ?? 0) >= studentIds.length;
  return <div className="space-y-6"><div><p className="text-sm font-medium text-primary">Assalamualaikum, {profile.nama}</p><h1 className="text-2xl font-bold tracking-tight">Dashboard Guru</h1></div><section className="grid grid-cols-2 gap-3 lg:grid-cols-4"><StatCard label="Kelas saya" value={String(classes?.length ?? 0)} icon={School} /><StatCard label="Jumlah pelajar" value={String(studentIds.length)} icon={UsersRound} /><StatCard label="Direkod hari ini" value={String(recordedToday ?? 0)} icon={ClipboardCheck} /><StatCard label="Status kehadiran" value={complete ? "Selesai" : "Belum lengkap"} icon={CheckCircle2} /></section><Card><CardHeader><CardTitle>Kehadiran hari ini</CardTitle></CardHeader><CardContent className="space-y-4"><p className="text-sm text-muted-foreground">Tandakan semua pelajar pada satu skrin dan simpan sekali gus.</p><Button asChild><Link href="/guru/kehadiran">Buka daftar kehadiran</Link></Button></CardContent></Card></div>;
}
