"use client";

import { usePathname, useRouter } from "next/navigation";
import { UsersRound } from "lucide-react";
import type { StudentOption } from "@/lib/types";

export function StudentSwitcher({
  students,
  selectedId,
}: {
  students: StudentOption[];
  selectedId: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <label className="flex min-h-14 items-center gap-3 rounded-2xl border bg-card px-4 shadow-sm">
      <UsersRound className="size-5 shrink-0 text-primary" aria-hidden="true" />
      <span className="sr-only">Pilih anak</span>
      <select
        value={selectedId}
        onChange={(event) => {
          const query = new URLSearchParams(window.location.search);
          query.set("student", event.target.value);
          router.replace(`${pathname}?${query.toString()}`);
        }}
        className="min-w-0 flex-1 bg-transparent py-3 text-sm font-semibold outline-none"
      >
        {students.map((student) => (
          <option key={student.id} value={student.id}>
            {student.nama}{student.kelas ? ` · ${student.kelas}` : ""}
          </option>
        ))}
      </select>
    </label>
  );
}
