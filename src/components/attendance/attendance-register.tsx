"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Clock3, Save, Umbrella, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AttendanceStatus } from "@/types/database";
import { saveAttendanceAction } from "@/app/(portal)/guru/kehadiran/actions";

interface StudentItem { id: string; nama: string; }
interface ExistingRecord { student_id: string; status: AttendanceStatus; sebab: string | null; }
interface RowState { status: AttendanceStatus; sebab: string; }

const statuses: { value: AttendanceStatus; label: string; icon: typeof Check; active: string }[] = [
  { value: "hadir", label: "Hadir", icon: Check, active: "border-emerald-600 bg-emerald-600 text-white" },
  { value: "lewat", label: "Lewat", icon: Clock3, active: "border-amber-500 bg-amber-500 text-white" },
  { value: "tidak_hadir", label: "Tidak hadir", icon: UserX, active: "border-red-600 bg-red-600 text-white" },
  { value: "cuti", label: "Cuti", icon: Umbrella, active: "border-blue-600 bg-blue-600 text-white" },
];

export function AttendanceRegister({ classId, date, students, existing }: { classId: string; date: string; students: StudentItem[]; existing: ExistingRecord[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const initial = useMemo(() => {
    const previous = new Map(existing.map((item) => [item.student_id, item]));
    return Object.fromEntries(students.map((student) => {
      const record = previous.get(student.id);
      return [student.id, { status: record?.status ?? "hadir", sebab: record?.sebab ?? "" } satisfies RowState];
    }));
  }, [students, existing]);
  const [rows, setRows] = useState<Record<string, RowState>>(initial);

  const totals = useMemo(() => statuses.map((item) => ({ ...item, count: Object.values(rows).filter((row) => row.status === item.value).length })), [rows]);

  function update(studentId: string, patch: Partial<RowState>) {
    setRows((current) => ({ ...current, [studentId]: { ...current[studentId], ...patch } }));
  }

  function save() {
    setMessage(null);
    startTransition(async () => {
      const result = await saveAttendanceAction({ classId, date, records: students.map((student) => ({ studentId: student.id, ...rows[student.id] })) });
      setMessage({ ok: result.success, text: result.message });
      if (result.success) router.refresh();
    });
  }

  if (!students.length) return <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">Tiada pelajar aktif dalam kelas ini.</div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{totals.map((item) => <div key={item.value} className="rounded-xl border bg-card p-3"><p className="text-xs text-muted-foreground">{item.label}</p><p className="text-xl font-bold">{item.count}</p></div>)}</div>
      <div className="flex flex-wrap gap-2"><Button type="button" variant="outline" size="sm" onClick={() => setRows(Object.fromEntries(students.map((student) => [student.id, { status: "hadir", sebab: "" }])))}><Check className="size-4" /> Tandakan semua hadir</Button></div>
      <div className="space-y-3">
        {students.map((student, index) => {
          const row = rows[student.id];
          return (
            <section key={student.id} className="rounded-2xl border bg-card p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-3"><span className="grid size-8 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">{index + 1}</span><h3 className="font-bold">{student.nama}</h3></div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{statuses.map((item) => { const Icon = item.icon; const active = row.status === item.value; return <button key={item.value} type="button" onClick={() => update(student.id, { status: item.value, sebab: item.value === "hadir" ? "" : row.sebab })} className={`flex min-h-11 items-center justify-center gap-2 rounded-xl border px-2 text-xs font-semibold transition ${active ? item.active : "bg-white hover:bg-muted"}`}><Icon className="size-4" />{item.label}</button>; })}</div>
              {(row.status === "lewat" || row.status === "tidak_hadir" || row.status === "cuti") && <Input className="mt-3" value={row.sebab} onChange={(event) => update(student.id, { sebab: event.target.value })} placeholder={row.status === "lewat" ? "Sebab lewat (pilihan)" : "Sebab / catatan"} />}
            </section>
          );
        })}
      </div>
      {message && <div className={`rounded-xl border p-3 text-sm font-medium ${message.ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"}`}>{message.text}</div>}
      <div className="sticky bottom-3 rounded-2xl border bg-white/95 p-3 shadow-lg backdrop-blur"><Button type="button" className="w-full" size="lg" disabled={pending} onClick={save}><Save className="size-4" />{pending ? "Menyimpan..." : `Simpan ${students.length} rekod`}</Button></div>
    </div>
  );
}
