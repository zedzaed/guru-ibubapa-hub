import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  ClipboardCheck,
  MoonStar,
  School,
  UsersRound,
} from "lucide-react";
import { StatCard } from "@/components/portal/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/require-role";
import { todayISO } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

const teacherActions = [
  { href: "/guru/kehadiran", label: "Ambil kehadiran", helper: "Tanda satu kelas", icon: ClipboardCheck },
  { href: "/guru/hafazan", label: "Rekod hafazan", helper: "Catat bacaan pelajar", icon: BookOpenCheck },
  { href: "/guru/keputusan", label: "Masuk markah", helper: "Kemaskini keputusan", icon: CheckCircle2 },
];

export default async function TeacherDashboard() {
  const profile = await requireRole(["guru"]);
  const supabase = await createClient();
  const { data: classes } = await supabase.from("classes").select("id,nama_kelas").eq("guru_id", profile.id);
  const classIds = (classes ?? []).map((item) => item.id);
  const { data: students } = classIds.length
    ? await supabase.from("students").select("id").in("kelas_id", classIds).eq("status", "aktif")
    : { data: [] };
  const studentIds = (students ?? []).map((item) => item.id);
  const { count: recordedToday } = studentIds.length
    ? await supabase.from("attendance").select("id", { count: "exact", head: true }).eq("tarikh", todayISO()).in("student_id", studentIds)
    : { count: 0 };
  const complete = studentIds.length > 0 && (recordedToday ?? 0) >= studentIds.length;
  const progress = studentIds.length ? Math.min(100, Math.round(((recordedToday ?? 0) / studentIds.length) * 100)) : 0;

  return (
    <div className="space-y-7">
      <section className="dashboard-hero islamic-pattern rounded-[1.75rem] p-5 sm:p-7">
        <div className="flex items-start justify-between gap-5">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">Portal Guru</p>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">Assalamualaikum, {profile.nama}</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-emerald-50/85 sm:text-base">
              Teruskan amanah mendidik dengan rekod kelas yang mudah, tersusun dan cepat dikemas kini.
            </p>
          </div>
          <span className="hidden size-16 shrink-0 place-items-center rounded-3xl border border-white/15 bg-white/10 sm:grid">
            <MoonStar className="size-8 text-emerald-100" />
          </span>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Kelas saya" value={String(classes?.length ?? 0)} helper="Kelas di bawah jagaan" icon={School} />
        <StatCard label="Jumlah pelajar" value={String(studentIds.length)} helper="Pelajar aktif" icon={UsersRound} />
        <StatCard label="Direkod hari ini" value={String(recordedToday ?? 0)} helper={`${progress}% selesai`} icon={ClipboardCheck} />
        <StatCard label="Status kehadiran" value={complete ? "Selesai" : "Belum lengkap"} helper={complete ? "Semua pelajar direkod" : "Perlu tindakan"} icon={CheckCircle2} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="surface-card border-emerald-900/10">
          <CardHeader className="pb-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Kerja utama</p>
            <CardTitle className="text-lg text-forest">Tindakan pantas guru</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            {teacherActions.map(({ href, label, helper, icon: Icon }) => (
              <Link key={href} href={href} className="group rounded-2xl border border-emerald-900/10 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md hover:shadow-emerald-950/5">
                <span className="grid size-10 place-items-center rounded-2xl bg-dove text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <Icon className="size-5" />
                </span>
                <p className="mt-3 text-sm font-bold text-forest">{label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="surface-card border-emerald-900/10">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Hari ini</p>
                <CardTitle className="mt-1 text-lg text-forest">Kehadiran kelas</CardTitle>
              </div>
              <span className={`grid size-11 place-items-center rounded-2xl ${complete ? "bg-emerald-100 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                {complete ? <CheckCircle2 className="size-5" /> : <ClipboardCheck className="size-5" />}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-2.5 overflow-hidden rounded-full bg-dove">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-4 flex items-center justify-between gap-3 text-sm">
              <span className="text-muted-foreground">Kemajuan rekod</span>
              <span className="font-extrabold text-forest">{progress}%</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {complete ? "Rekod kehadiran hari ini telah lengkap. Alhamdulillah." : "Lengkapkan kehadiran supaya pihak madrasah dan ibu bapa menerima data terkini."}
            </p>
            <Button asChild className="mt-5 w-full sm:w-auto">
              <Link href="/guru/kehadiran">Buka daftar kehadiran <ArrowRight className="size-4" /></Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
