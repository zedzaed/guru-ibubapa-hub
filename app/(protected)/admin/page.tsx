import {
  CalendarDays,
  GraduationCap,
  School,
  UsersRound,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Dashboard Admin" };
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const [students, classes, teachers, parents, announcements] = await Promise.all([
    supabase.from("students").select("id", { count: "exact", head: true }),
    supabase.from("classes").select("id", { count: "exact", head: true }),
    supabase
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "guru"),
    supabase
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "ibu_bapa"),
    supabase
      .from("announcements")
      .select("id,tajuk,tarikh")
      .order("tarikh", { ascending: false })
      .limit(3),
  ]);

  return (
    <div className="space-y-7">
      <PageHeader
        title="Dashboard Admin"
        description="Ringkasan operasi madrasah dan status data utama."
        action={<Badge variant="success">Fasa 1 aktif</Badge>}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Jumlah Pelajar"
          value={String(students.count ?? 0)}
          description="Semua status pelajar"
          icon={GraduationCap}
        />
        <StatCard
          title="Kelas"
          value={String(classes.count ?? 0)}
          description="Struktur tahun semasa"
          icon={School}
        />
        <StatCard
          title="Guru"
          value={String(teachers.count ?? 0)}
          description="Akaun berperanan guru"
          icon={UsersRound}
        />
        <StatCard
          title="Penjaga"
          value={String(parents.count ?? 0)}
          description="Akaun portal ibu bapa"
          icon={UsersRound}
        />
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <Card>
          <CardHeader>
            <CardTitle>Status pembinaan sistem</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              ["Auth, peranan dan route dilindungi", "Siap"],
              ["Skema database dan RLS", "Siap"],
              ["Pelajar, kelas dan kehadiran", "Fasa 2"],
              ["Hafazan, tilawah dan keputusan", "Fasa 3"],
              ["Yuran, mesej dan laporan", "Fasa 4–5"],
            ].map(([label, status]) => (
              <div key={label} className="flex items-center justify-between gap-4 border-b pb-3 last:border-0 last:pb-0">
                <p className="text-sm font-medium">{label}</p>
                <Badge variant={status === "Siap" ? "success" : "outline"}>{status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="size-5 text-primary" />
              Pengumuman terkini
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {announcements.data?.length ? (
              announcements.data.map((item) => (
                <div key={item.id} className="rounded-xl bg-muted p-3">
                  <p className="text-sm font-semibold">{item.tajuk}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.tarikh}</p>
                </div>
              ))
            ) : (
              <p className="text-sm leading-6 text-muted-foreground">
                Belum ada pengumuman. Modul pengurusan pengumuman akan disiapkan dalam Fasa 5.
              </p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
