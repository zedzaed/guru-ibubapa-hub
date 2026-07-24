"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { StudentSummary } from "@/types/database";

export function StudentSwitcher({ students }: { students: StudentSummary[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selected = searchParams.get("pelajar") ?? students[0]?.id ?? "";

  if (students.length <= 1) return null;

  return (
    <label className="block rounded-2xl border bg-card p-3 shadow-sm">
      <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Pilih anak</span>
      <select
        value={selected}
        onChange={(event) => {
          const params = new URLSearchParams(searchParams.toString());
          params.set("pelajar", event.target.value);
          router.push(`?${params.toString()}`);
        }}
        className="h-11 w-full rounded-xl border bg-white px-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-ring"
      >
        {students.map((student) => (
          <option key={student.id} value={student.id}>
            {student.nama}{student.classes?.nama_kelas ? ` — ${student.classes.nama_kelas}` : ""}
          </option>
        ))}
      </select>
    </label>
  );
}
