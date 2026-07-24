import { BookMarked, CalendarCheck2, Megaphone, ReceiptText } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { StudentSwitcher } from "@/components/student-switcher";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { StudentOption } from "@/lib/types";

export const metadata = { title: "Portal Ibu Bapa" };
export const dynamic = "force-dynamic";

type ParentStudentRow = {
  hubungan: string;
  students: {
    id: string;
    nama: string;
    gambar_url: string | null;
    classes: { nama_kelas: string } | null;
  } | null;
};

export default async function ParentDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ student?: string }>;
}) {
  const account = await requireRole(["ibu_bapa"]);
  const supabase = await createClient();
  const { data } = await supabase
    .from("parents_students")
    .select("hubungan,students(id,nama,gambar_url,classes(nama_kelas))")
    .eq("parent_id", account.id);

  const rows = (data ?? []) as unknown as ParentStudentRow[];
  const students: StudentOption[] = rows
    .filter((row) => row.students)
    .map((row) => ({
      id: row.students!.id,
      nama: row.students!.nama,
      kelas: row.students!.classes?.nama_kelas ?? null,
      gambarUrl: row.students!.gambar_url,
    }));

  const query = await searchParams;
  const selected = students.find((student) => student.id === query.student) ?? students[0];

  if (!selected) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={`Assalamualaikum, ${account.nama}`}
          description="Portal ibu bapa dan penjaga."
        />
        <Card>
          <CardContent className="p-8 text-center text-sm leading-6 text-muted-foreground">
            Akaun ini belum dikaitkan dengan mana-mana pelajar. Hubungi pihak admin madrasah.
          </CardContent>
        </Card>
      </div>
    );
  }

  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
    .toISOString()
    .slice(0, 10);
  const nextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1))
    .toISOString()
    .slice(0, 10);

  const [attendance, hafazan, invoices, announcements] = await Promise.all([
    supabase
      .from("attendance")
      .select("status,tarikh")
      .eq("student_id", selected.id)
      .gte("tarikh", monthStart)
      .lt("tarikh", nextMonth),
    supabase
      .from("hafazan")
      .select("surah,ayat_mula,ayat_akhir,gred,tarikh")
      .eq("student_id", selected.id)
      .order("tarikh", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("invoices")
      .select("amaun,status")
      .eq("student_id", selected.id)
      .in("status", ["belum_bayar", "tertunggak"]),
    supabase
      .from("announcements")
      .select("tajuk,tarikh")
      .order("tarikh", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const attendanceRows = attendance.data ?? [];
  const present = attendanceRows.filter((item) =>
    ["hadir", "lewat"].includes(item.status),
  ).length;
  const attendanceRate = attendanceRows.length
    ? Math.round((present / attendanceRows.length) * 100)
    : 0;
  const outstanding = (invoices.data ?? []).reduce(
    (total, item) => total + Number(item.amaun ?? 0),
    0,
  );

  return (
    <div className="space-y-7">
      <PageHeader
        title={`Assalamualaikum, ${account.nama}`}
        description="Pantau perkembangan anak melalui ringkasan yang dikemas kini oleh pihak madrasah."
        action={
          students.length > 1 ? (
            <div className="w-full sm:w-80">
              <StudentSwitcher students={students} selectedId={selected.id} />
            </div>
          ) : undefined
        }
      />

      <section className="rounded-2xl border bg-secondary p-5">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-secondary-foreground/70">
          Pelajar dipilih
        </p>
        <p className="mt-1 text-xl font-bold text-secondary-foreground">{selected.nama}</p>
        <p className="mt-1 text-sm text-secondary-foreground/75">
          {selected.kelas ?? "Kelas belum ditetapkan"}
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Kehadiran Bulan Ini"
          value={`${attendanceRate}%`}
          description={`${present} daripada ${attendanceRows.length} rekod hadir/lewat`}
          icon={CalendarCheck2}
        />
        <StatCard
          title="Hafazan Terkini"
          value={
            hafazan.data
              ? `${hafazan.data.surah} ${hafazan.data.ayat_mula}–${hafazan.data.ayat_akhir}`
              : "Belum ada"
          }
          description={hafazan.data ? formatDate(hafazan.data.tarikh) : undefined}
          icon={BookMarked}
        />
        <StatCard
          title="Bil Tertunggak"
          value={formatCurrency(outstanding)}
          description={`${invoices.data?.length ?? 0} invois belum selesai`}
          icon={ReceiptText}
        />
        <StatCard
          title="Pengumuman Terbaru"
          value={announcements.data?.tajuk ?? "Tiada pengumuman"}
          description={announcements.data ? formatDate(announcements.data.tarikh) : undefined}
          icon={Megaphone}
        />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Ringkasan portal</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Kehadiran", "Kalendar dan ringkasan bulanan", "Fasa 2"],
            ["Hafazan & Tilawah", "Timeline dan graf perkembangan", "Fasa 3"],
            ["Keputusan", "Markah, gred dan purata", "Fasa 3"],
            ["Yuran", "Bil, resit dan pembayaran", "Fasa 4"],
          ].map(([title, description, phase]) => (
            <div key={title} className="rounded-2xl border bg-background p-4">
              <p className="font-bold">{title}</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
              <p className="mt-3 text-xs font-bold text-primary">{phase}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
