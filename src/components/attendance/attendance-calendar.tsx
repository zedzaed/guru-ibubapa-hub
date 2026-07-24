import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { AttendanceStatus } from "@/types/database";

interface CalendarRecord { tarikh: string; status: AttendanceStatus; sebab: string | null; }

const statusStyles: Record<AttendanceStatus, string> = {
  hadir: "bg-emerald-100 text-emerald-800 ring-emerald-300",
  lewat: "bg-amber-100 text-amber-800 ring-amber-300",
  tidak_hadir: "bg-red-100 text-red-800 ring-red-300",
  cuti: "bg-blue-100 text-blue-800 ring-blue-300",
};

const statusLabels: Record<AttendanceStatus, string> = { hadir: "Hadir", lewat: "Lewat", tidak_hadir: "Tidak hadir", cuti: "Cuti" };

function shiftMonth(month: string, amount: number) {
  const [year, monthNumber] = month.split("-").map(Number);
  const date = new Date(Date.UTC(year, monthNumber - 1 + amount, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function AttendanceCalendar({ month, records, studentId, basePath = "/ibu-bapa/kehadiran" }: { month: string; records: CalendarRecord[]; studentId: string; basePath?: string }) {
  const [year, monthNumber] = month.split("-").map(Number);
  const days = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  const firstDay = (new Date(Date.UTC(year, monthNumber - 1, 1)).getUTCDay() + 6) % 7;
  const recordMap = new Map(records.map((record) => [Number(record.tarikh.slice(8, 10)), record]));
  const title = new Intl.DateTimeFormat("ms-MY", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(year, monthNumber - 1, 1)));
  const hrefFor = (target: string) => `${basePath}?pelajar=${studentId}&bulan=${target}`;

  return (
    <div className="rounded-2xl border bg-card p-3 shadow-sm sm:p-5">
      <div className="mb-4 flex items-center justify-between"><Link href={hrefFor(shiftMonth(month, -1))} className="grid size-10 place-items-center rounded-xl border hover:bg-muted" aria-label="Bulan sebelumnya"><ChevronLeft className="size-4" /></Link><h2 className="font-bold capitalize">{title}</h2><Link href={hrefFor(shiftMonth(month, 1))} className="grid size-10 place-items-center rounded-xl border hover:bg-muted" aria-label="Bulan seterusnya"><ChevronRight className="size-4" /></Link></div>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-muted-foreground sm:text-xs">{["Isn", "Sel", "Rab", "Kha", "Jum", "Sab", "Ahd"].map((day) => <div key={day} className="py-2">{day}</div>)}</div>
      <div className="grid grid-cols-7 gap-1">{Array.from({ length: firstDay }).map((_, index) => <div key={`empty-${index}`} />)}{Array.from({ length: days }, (_, index) => index + 1).map((day) => { const record = recordMap.get(day); return <div key={day} title={record ? `${statusLabels[record.status]}${record.sebab ? `: ${record.sebab}` : ""}` : "Tiada rekod"} className={`aspect-square rounded-xl p-1 text-center ring-1 ring-inset ${record ? statusStyles[record.status] : "bg-muted/40 text-muted-foreground ring-border"}`}><span className="text-xs font-bold sm:text-sm">{day}</span>{record && <span className="mt-0.5 hidden truncate text-[9px] sm:block">{statusLabels[record.status]}</span>}</div>; })}</div>
      <div className="mt-4 flex flex-wrap gap-2 text-xs">{(Object.keys(statusLabels) as AttendanceStatus[]).map((status) => <span key={status} className={`rounded-full px-2 py-1 ring-1 ring-inset ${statusStyles[status]}`}>{statusLabels[status]}</span>)}</div>
    </div>
  );
}
