import { CalendarCheck2, MessageCircle, School, UsersRound } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Dashboard Guru" };
export const dynamic = "force-dynamic";

export default async function TeacherDashboardPage() {
  const account = await requireRole(["guru"]);
  const supabase = await createClient();
  const { data: classes } = await supabase
    .from("classes")
    .select("id,nama_kelas,tingkatan,tahun")
    .eq("guru_id", account.id)
    .order("nama_kelas");

  const classIds = classes?.map((item) => item.id) ?? [];
  const { data: students } = classIds.length
    ? await supabase.from("students").select("id,nama,kelas_id").in("kelas_id", classIds)
    : { data: [] as { id: string; nama: string; kelas_id: string | null }[] };

  const studentIds = students?.map((item) => item.id) ?? [];
  const today = new Date().toISOString().slice(0, 10);
  const [{ count: attendanceCount }, { count: unreadMessages }] = await Promise.all([
    studentIds.length
      ? supabase
          .from("attendance")
          .select("id", { count: "exact", head: true })
          .in("student_id", studentIds)
          .eq("tarikh", today)
      : Promise.resolve({ count: 0 }),
    supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("receiver_id", account.id)
      .eq("dibaca", false),
  ]);

  return (
    <div className="space-y-7">
      <PageHeader
        title={`Assalamualaikum, ${account.nama}`}
        description="Ringkasan kelas dan tugasan guru untuk hari ini."
        action={<Badge variant="success">Akaun Guru</Badge>}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Kelas Saya" value={String(classIds.length)} icon={School} />
        <StatCard title="Jumlah Pelajar" value={String(studentIds.length)} icon={UsersRound} />
        <StatCard
          title="Kehadiran Direkod"
          value={`${attendanceCount ?? 0}/${studentIds.length}`}
          description="Rekod pada hari ini"
          icon={CalendarCheck2}
        />
        <StatCard
          title="Mesej Belum Dibaca"
          value={String(unreadMessages ?? 0)}
          icon={MessageCircle}
        />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Kelas di bawah jagaan</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {classes?.length ? (
            classes.map((item) => {
              const total = students?.filter((student) => student.kelas_id === item.id).length ?? 0;
              return (
                <div key={item.id} className="rounded-2xl border bg-background p-4">
                  <p className="font-bold">{item.nama_kelas}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.tingkatan} · {item.tahun}
                  </p>
                  <p className="mt-4 text-sm font-semibold text-primary">{total} pelajar</p>
                </div>
              );
            })
          ) : (
            <p className="text-sm leading-6 text-muted-foreground">
              Tiada kelas ditetapkan kepada akaun ini. Hubungi admin madrasah.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
