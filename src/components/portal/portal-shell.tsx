import Link from "next/link";
import { BookOpenCheck, LogOut, Menu, MoonStar } from "lucide-react";
import { signOutAction } from "@/app/(auth)/login/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { LucideIcon } from "lucide-react";

export interface PortalNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface PortalShellProps {
  title: string;
  roleLabel: string;
  userName: string;
  navItems: PortalNavItem[];
  children: React.ReactNode;
}

export function PortalShell({ title, roleLabel, userName, navItems, children }: PortalShellProps) {
  return (
    <div className="min-h-screen bg-transparent">
      <header className="sticky top-0 z-40 border-b border-emerald-900/10 bg-white/90 shadow-[0_8px_30px_-28px_rgba(20,83,61,0.55)] backdrop-blur-xl">
        <div className="mx-auto flex h-[4.5rem] max-w-[1440px] items-center justify-between px-4 sm:px-6">
          <Link href="/" className="group flex min-w-0 items-center gap-3">
            <span className="relative grid size-11 shrink-0 place-items-center rounded-2xl bg-forest text-primary-foreground shadow-sm ring-4 ring-emerald-100/80 transition-transform group-hover:-translate-y-0.5">
              <BookOpenCheck className="size-5" />
              <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full border-2 border-white bg-emerald-500">
                <MoonStar className="size-2.5 text-white" />
              </span>
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-extrabold tracking-tight text-forest sm:text-base">{title}</span>
              <span className="block truncate text-xs text-muted-foreground">{userName}</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Badge className="hidden border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-800 shadow-none sm:inline-flex">
              {roleLabel}
            </Badge>
            <details className="relative md:hidden">
              <summary className="grid size-10 cursor-pointer list-none place-items-center rounded-xl border border-emerald-900/10 bg-white text-forest shadow-sm transition-colors hover:bg-emerald-50">
                <Menu className="size-5" />
              </summary>
              <div className="absolute right-0 mt-2 w-72 rounded-3xl border border-emerald-900/10 bg-white/95 p-2 shadow-2xl shadow-emerald-950/10 backdrop-blur-xl">
                <div className="mb-2 rounded-2xl bg-dove px-3 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">{roleLabel}</p>
                  <p className="mt-0.5 truncate text-sm font-bold text-forest">{userName}</p>
                </div>
                {navItems.map(({ href, label, icon: Icon }) => (
                  <Link key={href} href={href} className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-emerald-50 hover:text-primary">
                    <span className="grid size-8 place-items-center rounded-xl bg-emerald-50 text-primary"><Icon className="size-4" /></span>
                    {label}
                  </Link>
                ))}
                <form action={signOutAction} className="mt-1 border-t border-emerald-900/10 pt-2">
                  <button className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50">
                    <span className="grid size-8 place-items-center rounded-xl bg-red-50"><LogOut className="size-4" /></span>
                    Log Keluar
                  </button>
                </form>
              </div>
            </details>
            <form action={signOutAction} className="hidden md:block">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:bg-emerald-50 hover:text-primary">
                <LogOut className="size-4" /> Log Keluar
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1440px] md:grid-cols-[264px_minmax(0,1fr)]">
        <aside className="sticky top-[4.5rem] hidden h-[calc(100vh-4.5rem)] p-4 pr-0 md:block">
          <div className="flex h-full flex-col rounded-3xl border border-emerald-900/10 bg-white/82 p-3 shadow-[0_18px_55px_-42px_rgba(20,83,61,0.55)] backdrop-blur-xl">
            <div className="islamic-pattern mb-3 rounded-2xl bg-forest px-4 py-4 text-center text-white">
              <p lang="ar" dir="rtl" className="text-sm font-semibold leading-7">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
              <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-100">Ilmu • Amanah • Akhlak</p>
            </div>
            <nav className="space-y-1">
              {navItems.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} className="group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-muted-foreground transition-all hover:bg-emerald-50 hover:text-primary">
                  <span className="grid size-9 place-items-center rounded-xl bg-dove text-primary transition-colors group-hover:bg-white group-hover:shadow-sm">
                    <Icon className="size-4" />
                  </span>
                  <span className="truncate">{label}</span>
                </Link>
              ))}
            </nav>
            <div className="mt-auto rounded-2xl border border-emerald-900/10 bg-dove p-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">Akaun aktif</p>
              <p className="mt-1 truncate text-sm font-bold text-forest">{userName}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{roleLabel}</p>
            </div>
          </div>
        </aside>

        <main className="min-w-0 p-4 pb-28 sm:p-6 sm:pb-28 md:p-8 md:pb-10">{children}</main>
      </div>

      <nav className="fixed inset-x-3 bottom-3 z-40 flex gap-1 overflow-x-auto rounded-2xl border border-emerald-900/10 bg-white/94 p-1.5 shadow-2xl shadow-emerald-950/15 backdrop-blur-xl md:hidden">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className="flex min-w-[72px] flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[10px] font-semibold text-muted-foreground transition-colors hover:bg-emerald-50 hover:text-primary">
            <Icon className="size-4" />
            <span className="max-w-[76px] truncate">{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
