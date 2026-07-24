import Image from "next/image";
import Link from "next/link";
import { LogOut, Menu } from "lucide-react";
import { signOutAction } from "@/app/(auth)/login/actions";
import { InstallAppButton } from "@/components/pwa/install-app-button";
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

export function PortalShell({ roleLabel, userName, navItems, children }: PortalShellProps) {
  return (
    <div className="min-h-screen bg-transparent">
      <header className="sticky top-0 z-40 border-b border-emerald-900/10 bg-[#064E3B] text-white shadow-lg shadow-emerald-950/10">
        <div className="mx-auto flex h-[4.75rem] max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/" className="group flex min-w-0 items-center gap-3">
            <Image
              src="/madrasah-hub-logo.svg"
              alt="Madrasah Hub"
              width={52}
              height={52}
              priority
              className="size-12 shrink-0 rounded-2xl shadow-sm ring-2 ring-white/20 transition-transform group-hover:-translate-y-0.5"
            />
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-base font-black tracking-[0.08em] text-white sm:text-lg">MADRASAH HUB</span>
              <span className="block truncate text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-100">Ilmu • Amal • Akhlak</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="hidden sm:block"><InstallAppButton /></div>
            <Badge className="hidden border border-white/15 bg-white/10 px-3 py-1 text-white shadow-none lg:inline-flex">
              {roleLabel}
            </Badge>
            <details className="relative md:hidden">
              <summary className="grid size-10 cursor-pointer list-none place-items-center rounded-xl border border-white/15 bg-white/10 text-white transition-colors hover:bg-white/20">
                <Menu className="size-5" />
              </summary>
              <div className="absolute right-0 mt-2 w-72 rounded-3xl border border-emerald-900/10 bg-white/98 p-2 text-slate-800 shadow-2xl shadow-emerald-950/20 backdrop-blur-xl">
                <div className="mb-2 rounded-2xl bg-[#F4F7F2] px-3 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0B7A53]">{roleLabel}</p>
                  <p className="mt-0.5 truncate text-sm font-bold text-[#064E3B]">{userName}</p>
                </div>
                <div className="mb-2 px-1 sm:hidden"><InstallAppButton /></div>
                {navItems.map(({ href, label, icon: Icon }) => (
                  <Link key={href} href={href} className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition-colors hover:bg-emerald-50 hover:text-[#0B7A53]">
                    <span className="grid size-8 place-items-center rounded-xl bg-emerald-50 text-[#0B7A53]"><Icon className="size-4" /></span>
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
              <Button variant="ghost" size="sm" className="text-emerald-50 hover:bg-white/10 hover:text-white">
                <LogOut className="size-4" /> Log Keluar
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1440px] md:grid-cols-[264px_minmax(0,1fr)]">
        <aside className="sticky top-[4.75rem] hidden h-[calc(100vh-4.75rem)] p-4 pr-0 md:block">
          <div className="flex h-full flex-col rounded-3xl border border-emerald-900/10 bg-white/88 p-3 shadow-[0_18px_55px_-42px_rgba(20,83,61,0.55)] backdrop-blur-xl">
            <div className="islamic-pattern mb-3 rounded-2xl bg-[#064E3B] px-4 py-4 text-center text-white">
              <p lang="ar" dir="rtl" className="text-sm font-semibold leading-7">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
              <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-100">Ilmu • Amal • Akhlak</p>
            </div>
            <nav className="space-y-1">
              {navItems.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} className="group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-muted-foreground transition-all hover:bg-emerald-50 hover:text-[#0B7A53]">
                  <span className="grid size-9 place-items-center rounded-xl bg-[#F4F7F2] text-[#0B7A53] transition-colors group-hover:bg-white group-hover:shadow-sm">
                    <Icon className="size-4" />
                  </span>
                  <span className="truncate">{label}</span>
                </Link>
              ))}
            </nav>
            <div className="mt-auto rounded-2xl border border-emerald-900/10 bg-[#F4F7F2] p-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#0B7A53]">Akaun aktif</p>
              <p className="mt-1 truncate text-sm font-bold text-[#064E3B]">{userName}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{roleLabel}</p>
            </div>
          </div>
        </aside>

        <main className="min-w-0 p-4 pb-28 sm:p-6 sm:pb-28 md:p-8 md:pb-10">{children}</main>
      </div>

      <nav className="fixed inset-x-3 bottom-3 z-40 flex gap-1 overflow-x-auto rounded-2xl border border-emerald-900/10 bg-white/96 p-1.5 shadow-2xl shadow-emerald-950/15 backdrop-blur-xl md:hidden">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className="flex min-w-[72px] flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[10px] font-semibold text-muted-foreground transition-colors hover:bg-emerald-50 hover:text-[#0B7A53]">
            <Icon className="size-4" />
            <span className="max-w-[76px] truncate">{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
