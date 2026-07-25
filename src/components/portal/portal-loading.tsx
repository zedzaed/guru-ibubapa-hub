import { Skeleton } from "@/components/ui/skeleton";

export function PortalLoading() {
  return (
    <div className="space-y-7" role="status" aria-label="Memuatkan halaman">
      <section className="rounded-[1.75rem] border border-emerald-900/10 bg-white p-5 sm:p-7">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="mt-4 h-8 w-full max-w-xl" />
        <Skeleton className="mt-3 h-4 w-full max-w-2xl" />
        <Skeleton className="mt-2 h-4 w-3/4 max-w-xl" />
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-3xl border border-emerald-900/10 bg-white p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="mt-4 h-8 w-16" />
                <Skeleton className="mt-3 h-3 w-28" />
              </div>
              <Skeleton className="size-11 shrink-0 rounded-2xl" />
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-emerald-900/10 bg-white p-5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-3 h-6 w-44" />
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="rounded-2xl border border-emerald-900/10 p-4">
                <Skeleton className="size-10 rounded-2xl" />
                <Skeleton className="mt-4 h-4 w-24" />
                <Skeleton className="mt-2 h-3 w-full" />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-emerald-900/10 bg-white p-5">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-3 h-6 w-40" />
          <Skeleton className="mt-6 h-10 w-24" />
          <Skeleton className="mt-5 h-3 w-full rounded-full" />
          <Skeleton className="mt-5 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-3/4" />
        </div>
      </section>

      <span className="sr-only">Halaman sedang dimuatkan…</span>
    </div>
  );
}
