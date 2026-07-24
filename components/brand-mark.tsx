import { BookOpenCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
        <BookOpenCheck className="size-6" aria-hidden="true" />
      </div>
      {!compact && (
        <div className="leading-tight">
          <p className={cn("font-bold tracking-tight text-foreground")}>Madrasah Connect</p>
          <p className="text-xs text-muted-foreground">Guru &amp; Ibu Bapa</p>
        </div>
      )}
    </div>
  );
}
