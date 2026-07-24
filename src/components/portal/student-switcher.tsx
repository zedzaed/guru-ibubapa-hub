"use client";

import { Baby, ChevronDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import type { StudentSummary } from "@/types/database";

export function StudentSwitcher({ students }: { students: StudentSummary[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selected = searchParams.get("pelajar") ?? students[0]?.id ?? "";

  if (students.length <= 1) return null;

  return (
    <label className="surface-card flex items-center gap-3 rounded-2xl border border-emerald-900/10 p-3 shadow-sm sm:max-w-xl">
      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-primary">
        <Baby className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Paparan anak</span>
        <span className="relative block">
          <select
            value={selected}
            onChange={(event) => {
              const params = new URLSearchParams(searchParams.toString());
              params.set("pelajar", event.target.value);
              router.push(`?${params.toString()}`);
            }}
            className="h-9 w-full appearance-none border-0 bg-transparent pr-9 text-sm font-bold text-forest outline-none focus:ring-0"
          >
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.nama}{student.classes?.nama_kelas ? ` — ${student.classes.nama_kelas}` : ""}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-1 top-1/2 size-4 -translate-y-1/2 text-primary" />
        </span>
      </span>
    </label>
  );
}
