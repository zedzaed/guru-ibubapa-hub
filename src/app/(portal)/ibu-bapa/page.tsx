import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  BookOpenCheck,
  CalendarCheck2,
  ClipboardCheck,
  HeartHandshake,
  Megaphone,
  MoonStar,
  ShieldCheck,
} from "lucide-react";
import { StudentSwitcher } from "@/components/portal/student-switcher";
import { StatCard } from "@/components/portal/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { currentMonthISO } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/require-role";
import type { StudentSummary } from "@/types/database";

type ParentDashboardProps = { searchParams: Promise<{ pelajar?: string }> };

const parentActions = [
  { href: "/ibu-bapa/kehadiran", label: "Kehadiran", icon: CalendarCheck2 },
  { href: "/ibu-bapa/hafazan", label: "Hafazan", icon: BookOpenCheck },
  { href: "/ibu-bapa/yuran", label: "Yuran", icon: Banknote },
  { href: "/ibu-bapa/pengumuman", label: "Pengumuman", icon: Megaphone },
];

export default async function ParentDashboard({ searchParams }: ParentDashboardProps) {
  const profile = await requireRole(["ibu_bapa"]);
  const { pelajar } = await searchParams;
  const supabase = await createClient();
  const { data: links } = await supabase
    .from("parents_students")
    .select("students(id,nama,gambar_url,classes(nama_kelas))")
    .eq("parent_id", profile.id);
  const students = (links ?? []).flatMap((link) => (link.students ? [link.students] : [])) as unknown as StudentSummary[];
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
    if (attendance?.length) {
      attendanceRate = Math.round((attendance.filter((item) => item.status === "hadir" || item.status === "lewat").length / attendance.length) * 100);
    }
  }

  return (
    <div className="space-y-7">
      <section className="dashboard-hero islamic-pattern rounded-[1.75rem] p-5 sm:p-7">
        <div className="flex items-start justify-between gap-5">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">Portal Ibu Bapa</p>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">Assalamualaikum, {profile.nama}</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-emerald-50/85 sm:text-base">
              Ikuti perkembangan ilmu, kehadiran dan kebajikan anak dengan paparan yang mudah dan menenangkan.
            </p>
          </div>
          <span className="hidden size-16 shrink-0 place-items-center rounded-3xl border border-white/15 bg-white/10 sm:grid">
            <MoonStar className="size-8 text-emerald-100" />
          </span>
        </div>
      </section>

      <StudentSwitcher students={students} />

      {selectedStudent ? (
        <>
          <Card className="surface-card border-emerald-900/10">
            <CardContent className="flex items-center gap-4 p-4 sm:p-5">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary text-white shadow-sm">
                <HeartHandshake className="size-6" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Paparan semasa</p>
                <p className="mt-1 truncate text-lg font-extrabold text-forest">{selectedStudent.nama}</p>
                <p className="text-sm text-muted-foreground">{selectedStudent.classes?.nama_kelas ?? "Kelas belum ditetapkan"}</p>
              </div>
              <Button asChild variant="ghost" size="sm" className="hidden text-primary sm:inline-flex">
                <Link href="/ibu-bapa/kehadiran">Lihat butiran <ArrowRight className="size-4" /></Link>
              </Button>
            </CardContent>
          </Card>

          <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard label="Kehadiran bulan ini" value={`${attendanceRate}%`} helper="Hadir termasuk lewat" icon={ClipboardCheck} />
            <StatCard label="Hafazan terkini" value="—" helper="Rekod akan dipaparkan" icon={BookOpenCheck} />
            <StatCard label="Bil belum selesai" value={String(arrears)} helper={arrears ? "Perlu perhatian" : "Tiada tunggakan"} icon={Banknote} />
            <StatCard label="Pengumuman baharu" value="—" helper="Makluman madrasah" icon={Megaphone} />
          </section>

          <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <Card className="surface-card border-emerald-900/10">
              <CardHeader className="pb-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Akses pantas</p>
                <CardTitle className="text-lg text-forest">Perkembangan anak</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {parentActions.map(({ href, label, icon: Icon }) => (
                  <Link key={href} href={href} className="group rounded-2xl border border-emerald-900/10 bg-white p-4 text-center transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md hover:shadow-emerald-950/5">
                    <span className="mx-auto grid size-10 place-items-center rounded-2xl bg-dove text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                      <Icon className="size-5" />
                    </span>
                    <p className="mt-3 text-xs font-bold text-forest sm:text-sm">{label}</p>
                  </Link>
                ))}
              </CardContent>
            </Card>

            <Card className="surface-card border-emerald-900/10">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-2xl bg-emerald-50 text-primary">
                    <ShieldCheck className="size-5" />
                  </span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Dilindungi</p>
                    <CardTitle className="mt-1 text-lg text-forest">Data anak selamat</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">
                  Maklumat pelajar hanya boleh dilihat oleh penjaga yang dipautkan, guru kelas dan pihak pentadbiran yang dibenarkan.
                </p>
              </CardContent>
            </Card>
          </section>
        </>
      ) : (
        <Card className="surface-card border-emerald-900/10">
          <CardContent className="flex flex-col items-center p-8 text-center">
            <span className="grid size-14 place-items-center rounded-3xl bg-emerald-50 text-primary">
              <HeartHandshake className="size-7" />
            </span>
            <p className="mt-4 font-bold text-forest">Belum ada pelajar dipautkan</p>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">Hubungi pihak pentadbiran untuk mengaitkan akaun penjaga dengan pelajar.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
