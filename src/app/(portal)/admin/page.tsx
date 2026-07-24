import { ClipboardCheck, School, UserRoundCheck, UsersRound } from "lucide-react";
import { StatCard } from "@/components/portal/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { todayISO } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const today = todayISO();
  const [{ count: students }, { count: classes }, { data: teacherRoles }, { count: attendance }] = await Promise.all([
    supabase.from("students").select("id", { count: "exact", head: true }).eq("status", "aktif"),
    supabase.from("classes").select("id", { count: "exact", head: true }),
    supabase.from("user_roles").select("user_id").eq("role", "guru"),
    supabase.from("attendance").select("id", { count: "exact", head: true }).eq("tarikh", today),
  ]);
  const teacherIds = (teacherRoles ?? []).map((item) => item.user_id);
  const { count: teachers } = teacherIds.length
    ? await supabase.from("profiles").select("id", { count: "exact", head: true }).in("id", teacherIds).eq("status", "aktif")
    : { count: 0 };
  return <div className="space-y-6"><div><p className="text-sm font-medium text-primary">Ringkasan madrasah</p><h1 className="text-2xl font-bold tracking-tight">Dashboard Admin</h1></div><section className="grid grid-cols-2 gap-3 lg:grid-cols-4"><StatCard label="Pelajar aktif" value={String(students ?? 0)} icon={UsersRound} /><StatCard label="Kelas" value={String(classes ?? 0)} icon={School} /><StatCard label="Guru aktif" value={String(teachers ?? 0)} icon={UserRoundCheck} /><StatCard label="Direkod hari ini" value={String(attendance ?? 0)} icon={ClipboardCheck} /></section><Card><CardHeader><CardTitle>Fasa 2 aktif</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">CRUD pelajar dan kelas, kaitan penjaga, kehadiran pukal guru serta kalendar kehadiran ibu bapa telah disambungkan kepada Supabase.</CardContent></Card></div>;
}
