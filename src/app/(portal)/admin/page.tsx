import Link from "next/link";
import {
  ArrowUpRight,
  BarChart3,
  ClipboardCheck,
  MoonStar,
  School,
  UserRoundCheck,
  UsersRound,
} from "lucide-react";
import { StatCard } from "@/components/portal/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { todayISO } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

const quickActions = [
  { href: "/admin/pelajar", label: "Urus pelajar", helper: "Daftar dan kemas kini", icon: UsersRound },
  { href: "/admin/kelas", label: "Urus kelas", helper: "Kelas dan guru", icon: School },
  { href: "/admin/laporan", label: "Buka laporan", helper: "Semak prestasi", icon: BarChart3 },
];

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

  const attendanceProgress = students ? Math.min(100, Math.round(((attendance ?? 0) / students) * 100)) : 0;

  return (
    <div className="space-y-7">
      <section className="dashboard-hero islamic-pattern rounded-[1.75rem] p-5 sm:p-7">
        <div className="flex items-start justify-between gap-5">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">Portal Pentadbiran</p>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">Assalamualaikum, selamat mengurus madrasah</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-emerald-50/85 sm:text-base">
              Pantau pelajar, guru dan operasi harian melalui satu paparan yang tersusun, tenang dan mudah dicapai.
            </p>
          </div>
          <span className="hidden size-16 shrink-0 place-items-center rounded-3xl border border-white/15 bg-white/10 sm:grid">
            <MoonStar className="size-8 text-emerald-100" />
          </span>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Pelajar aktif" value={String(students ?? 0)} helper="Keseluruhan madrasah" icon={UsersRound} />
        <StatCard label="Kelas" value={String(classes ?? 0)} helper="Sesi semasa" icon={School} />
        <StatCard label="Guru aktif" value={String(teachers ?? 0)} helper="Akaun berstatus aktif" icon={UserRoundCheck} />
        <StatCard label="Direkod hari ini" value={String(attendance ?? 0)} helper={`${attendanceProgress}% daripada pelajar aktif`} icon={ClipboardCheck} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="surface-card border-emerald-900/10">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Akses utama</p>
                <CardTitle className="mt-1 text-lg text-forest">Tindakan pantas</CardTitle>
              </div>
              <span className="grid size-10 place-items-center rounded-2xl bg-emerald-50 text-primary">
                <ArrowUpRight className="size-5" />
              </span>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            {quickActions.map(({ href, label, helper, icon: Icon }) => (
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
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Hari ini</p>
            <CardTitle className="text-lg text-forest">Kemajuan kehadiran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-3xl font-extrabold tracking-tight text-forest">{attendanceProgress}%</p>
                <p className="mt-1 text-xs text-muted-foreground">Rekod diterima setakat ini</p>
              </div>
              <span className="grid size-12 place-items-center rounded-2xl bg-emerald-50 text-primary">
                <ClipboardCheck className="size-6" />
              </span>
            </div>
            <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-dove">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${attendanceProgress}%` }} />
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              {attendanceProgress === 100
                ? "Semua rekod kehadiran telah lengkap. Alhamdulillah."
                : "Pantau kelas yang belum melengkapkan rekod kehadiran hari ini."}
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
