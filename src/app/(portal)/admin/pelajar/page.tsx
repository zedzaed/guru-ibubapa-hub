import Link from "next/link";
import { Plus, Search, Trash2, UserRound } from "lucide-react";
import { GuardianLinkForm } from "@/components/admin/guardian-link-form";
import { StudentForm } from "@/components/admin/student-form";
import { ConfirmSubmitButton } from "@/components/shared/confirm-submit-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatDateMY } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { ClassSummary, StudentRecord } from "@/types/database";
import { deleteStudentAction, linkGuardianAction, saveStudentAction, unlinkGuardianAction } from "./actions";

type Params = Promise<{ q?: string; kelas?: string; pelajar?: string; baru?: string; berjaya?: string }>;

type GuardianLink = {
  parent_id: string;
  hubungan: string;
  users: { id: string; nama: string; email: string | null; phone: string | null } | null;
};

type StudentRow = StudentRecord & {
  classes: { id: string; nama_kelas: string; tingkatan: string; tahun: number } | null;
  parents_students: GuardianLink[];
};

export default async function StudentsPage({ searchParams }: { searchParams: Params }) {
  const params = await searchParams;
  const supabase = await createClient();

  const [{ data: classesData }, { data: parentsData }] = await Promise.all([
    supabase.from("classes").select("id,nama_kelas,tingkatan,tahun,guru_id").order("tahun", { ascending: false }).order("nama_kelas"),
    supabase.from("users").select("id,nama,email,phone").eq("role", "ibu_bapa").eq("status", "aktif").order("nama"),
  ]);

  let query = supabase
    .from("students")
    .select("id,nama,no_kp,tarikh_lahir,jantina,kelas_id,tahun_masuk,status,gambar_url,classes(id,nama_kelas,tingkatan,tahun),parents_students(parent_id,hubungan,users(id,nama,email,phone))")
    .order("nama");
  if (params.q?.trim()) query = query.ilike("nama", `%${params.q.trim()}%`);
  if (params.kelas) query = query.eq("kelas_id", params.kelas);
  const { data: studentsData, error } = await query;
  if (error) throw new Error(error.message);

  const students = (studentsData ?? []) as unknown as StudentRow[];
  const classes = (classesData ?? []) as ClassSummary[];
  const selected = students.find((item) => item.id === params.pelajar) ?? students[0] ?? null;
  const formStudent = params.baru === "1" ? null : selected;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><p className="text-sm font-medium text-primary">Fasa 2</p><h1 className="text-2xl font-bold tracking-tight">Pelajar & Penjaga</h1><p className="mt-1 text-sm text-muted-foreground">Urus profil pelajar, kelas dan hubungan penjaga.</p></div>
        <Button asChild><Link href="/admin/pelajar?baru=1"><Plus className="size-4" /> Pelajar baharu</Link></Button>
      </div>

      {params.berjaya && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-800">Perubahan berjaya disimpan.</div>}

      <Card>
        <CardContent className="p-4">
          <form method="get" className="grid gap-3 sm:grid-cols-[1fr_220px_auto]">
            <div className="relative"><Search className="absolute left-3 top-3 size-4 text-muted-foreground" /><Input name="q" defaultValue={params.q ?? ""} className="pl-9" placeholder="Cari nama pelajar" /></div>
            <Select name="kelas" defaultValue={params.kelas ?? ""}><option value="">Semua kelas</option>{classes.map((item) => <option key={item.id} value={item.id}>{item.nama_kelas}</option>)}</Select>
            <Button type="submit" variant="outline">Tapis</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
        <Card className="h-fit">
          <CardHeader><CardTitle>Senarai pelajar ({students.length})</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {students.length ? students.map((student) => (
              <Link
                key={student.id}
                href={`/admin/pelajar?pelajar=${student.id}${params.q ? `&q=${encodeURIComponent(params.q)}` : ""}`}
                className={`flex items-center gap-3 rounded-2xl border p-3 transition-colors hover:bg-muted ${selected?.id === student.id && params.baru !== "1" ? "border-primary bg-muted" : "bg-card"}`}
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><UserRound className="size-5" /></span>
                <span className="min-w-0 flex-1"><span className="block truncate font-semibold">{student.nama}</span><span className="block truncate text-xs text-muted-foreground">{student.classes?.nama_kelas ?? "Kelas belum ditetapkan"}</span></span>
                <Badge>{student.status.replace("_", " ")}</Badge>
              </Link>
            )) : <p className="py-8 text-center text-sm text-muted-foreground">Tiada pelajar ditemui.</p>}
          </CardContent>
        </Card>

        <div className="space-y-5">
          <StudentForm student={formStudent} classes={classes} action={saveStudentAction} />

          {selected && params.baru !== "1" && (
            <Card>
              <CardHeader><CardTitle>Maklumat & penjaga</CardTitle></CardHeader>
              <CardContent className="space-y-5">
                <dl className="grid gap-3 rounded-2xl bg-muted p-4 text-sm sm:grid-cols-2">
                  <div><dt className="text-muted-foreground">Tarikh lahir</dt><dd className="font-semibold">{formatDateMY(selected.tarikh_lahir)}</dd></div>
                  <div><dt className="text-muted-foreground">No. KP / MyKid</dt><dd className="font-semibold">{selected.no_kp ?? "—"}</dd></div>
                  <div><dt className="text-muted-foreground">Tahun masuk</dt><dd className="font-semibold">{selected.tahun_masuk}</dd></div>
                  <div><dt className="text-muted-foreground">Kelas</dt><dd className="font-semibold">{selected.classes?.nama_kelas ?? "—"}</dd></div>
                </dl>

                <div className="space-y-2">
                  <h2 className="font-bold">Penjaga dipautkan</h2>
                  {selected.parents_students?.length ? selected.parents_students.map((link) => (
                    <div key={link.parent_id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3">
                      <div><p className="font-semibold">{link.users?.nama ?? "Akaun penjaga"}</p><p className="text-xs text-muted-foreground">{link.hubungan} · {link.users?.phone ?? link.users?.email ?? "Tiada kontak"}</p></div>
                      <form action={unlinkGuardianAction}><input type="hidden" name="student_id" value={selected.id} /><input type="hidden" name="parent_id" value={link.parent_id} /><ConfirmSubmitButton type="submit" variant="ghost" size="sm" message="Buang kaitan penjaga ini?"><Trash2 className="size-4" /> Buang</ConfirmSubmitButton></form>
                    </div>
                  )) : <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">Belum ada penjaga dipautkan.</p>}
                </div>

                <GuardianLinkForm studentId={selected.id} parents={parentsData ?? []} action={linkGuardianAction} />

                <form action={deleteStudentAction} className="border-t pt-4"><input type="hidden" name="id" value={selected.id} /><ConfirmSubmitButton type="submit" variant="destructive" message={`Padam ${selected.nama}? Semua rekod berkaitan juga akan terjejas.`}><Trash2 className="size-4" /> Padam pelajar</ConfirmSubmitButton></form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
