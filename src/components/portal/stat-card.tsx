import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: string;
  helper?: string;
  icon: LucideIcon;
}

export function StatCard({ label, value, helper, icon: Icon }: StatCardProps) {
  return (
    <Card className="surface-card group relative overflow-hidden border-emerald-900/10 transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-950/5">
      <span className="absolute inset-x-0 top-0 h-1 bg-primary/85" aria-hidden="true" />
      <CardContent className="flex min-h-[132px] items-start justify-between gap-3 p-4 pt-5 sm:p-5 sm:pt-6">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground sm:text-xs">{label}</p>
          <p className="mt-2 text-2xl font-extrabold tracking-tight text-forest sm:text-3xl">{value}</p>
          {helper ? <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-muted-foreground">{helper}</p> : null}
        </div>
        <div className="grid size-11 shrink-0 place-items-center rounded-2xl border border-emerald-200 bg-emerald-50 text-primary shadow-sm transition-colors group-hover:bg-primary group-hover:text-white">
          <Icon className="size-5" aria-hidden="true" />
        </div>
      </CardContent>
    </Card>
  );
}
