import Link from "next/link";
import { Plus, Trash2, UsersRound } from "lucide-react";
import { ClassForm } from "@/components/admin/class-form";
import { ConfirmSubmitButton } from "@/components/shared/confirm-submit-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { deleteClassAction, saveClassAction } from "./actions";

type Params = Promise<{ kelas?: string; baru?: string; berjaya?: string }>;
type ClassRow = { id: string; nama_kelas: string; tingkatan: string; guru_id: string | null; tahun: number; guru: { id: string; nama: string } | null };

export default async function ClassesPage({ searchParams }: { searchParams: Params }) {
  const params = await searchParams;
  const supabase = await createClient();
  const [{ data: classesData, error }, { data: teacherRoles }, { data: students }] = await Promise.all([
    supabase.from("classes").select("id,nama_kelas,tingkatan,guru_id,tahun,guru:profiles!classes_guru_id_fkey(id,nama)").order("tahun", { ascending: false }).order("nama_kelas"),
    supabase.from("user_roles").select("user_id").eq("role", "guru"),
    supabase.from("students").select("id,kelas_id").eq("status", "aktif"),
  ]);
  const teacherIds = (teacherRoles ?? []).map((item) => item.user_id);
  const { data: teachers } = teacherIds.length
    ? await supabase.from("profiles").select("id,nama").in("id", teacherIds).eq("status", "aktif").order("nama")
    : { data: [] };
  if (error) throw new Error(error.message);
  const classes = (classesData ?? []) as unknown as ClassRow[];
  const counts = new Map<string, number>();
  for (const student of students ?? []) if (student.kelas_id) counts.set(student.kelas_id, (counts.get(student.kelas_id) ?? 0) + 1);
  const selected = classes.find((item) => item.id === params.kelas) ?? classes[0] ?? null;
  const formValue = params.baru === "1" ? null : selected;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-sm font-medium text-primary">Fasa 2</p><h1 className="text-2xl font-bold tracking-tight">Kelas & Guru</h1><p className="mt-1 text-sm text-muted-foreground">Tetapkan kelas, tahun pengajian dan guru kelas.</p></div><Button asChild><Link href="/admin/kelas?baru=1"><Plus className="size-4" /> Kelas baharu</Link></Button></div>
      {params.berjaya && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-800">Perubahan berjaya disimpan.</div>}
      <div className="grid gap-5 lg:grid-cols-[1fr_420px]">
        <div className="grid gap-3 sm:grid-cols-2">
          {classes.map((item) => (
            <Link key={item.id} href={`/admin/kelas?kelas=${item.id}`} className={`rounded-2xl border bg-card p-4 shadow-sm transition hover:bg-muted ${selected?.id === item.id && params.baru !== "1" ? "border-primary" : ""}`}>
              <div className="flex items-start justify-between gap-3"><div><h2 className="font-bold">{item.nama_kelas}</h2><p className="text-sm text-muted-foreground">{item.tingkatan} · {item.tahun}</p></div><Badge>{counts.get(item.id) ?? 0} pelajar</Badge></div>
              <div className="mt-4 flex items-center gap-2 text-sm"><UsersRound className="size-4 text-primary" /><span>{item.guru?.nama ?? "Guru belum ditetapkan"}</span></div>
            </Link>
          ))}
          {!classes.length && <Card className="sm:col-span-2"><CardContent className="p-8 text-center text-sm text-muted-foreground">Belum ada kelas.</CardContent></Card>}
        </div>
        <div className="space-y-5">
          <ClassForm value={formValue} teachers={teachers ?? []} action={saveClassAction} />
          {selected && params.baru !== "1" && <Card><CardHeader><CardTitle>Tindakan kelas</CardTitle></CardHeader><CardContent><p className="mb-4 text-sm text-muted-foreground">Memadam kelas tidak memadam pelajar. Pelajar dalam kelas ini akan menjadi “kelas belum ditetapkan”.</p><form action={deleteClassAction}><input type="hidden" name="id" value={selected.id} /><ConfirmSubmitButton type="submit" variant="destructive" message={`Padam kelas ${selected.nama_kelas}?`}><Trash2 className="size-4" /> Padam kelas</ConfirmSubmitButton></form></CardContent></Card>}
        </div>
      </div>
    </div>
  );
}
