"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookMarked,
  CalendarCheck2,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  ReceiptText,
  School,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { BrandMark } from "@/components/brand-mark";
import { getInitials } from "@/lib/format";
import type { AppRole, CurrentAccount } from "@/lib/types";
import { cn } from "@/lib/utils";

type NavItem = { label: string; href: string; icon: LucideIcon };

const navByRole: Record<AppRole, NavItem[]> = {
  admin: [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Pelajar", href: "/admin/pelajar", icon: GraduationCap },
    { label: "Kelas", href: "/admin/kelas", icon: School },
    { label: "Pengguna", href: "/admin/pengguna", icon: UsersRound },
    { label: "Laporan", href: "/admin/laporan", icon: ClipboardList },
  ],
  guru: [
    { label: "Dashboard", href: "/guru", icon: LayoutDashboard },
    { label: "Kehadiran", href: "/guru/kehadiran", icon: CalendarCheck2 },
    { label: "Hafazan", href: "/guru/hafazan", icon: BookMarked },
    { label: "Keputusan", href: "/guru/keputusan", icon: ClipboardList },
    { label: "Mesej", href: "/guru/mesej", icon: MessageCircle },
  ],
  ibu_bapa: [
    { label: "Dashboard", href: "/ibu-bapa", icon: LayoutDashboard },
    { label: "Kehadiran", href: "/ibu-bapa/kehadiran", icon: CalendarCheck2 },
    { label: "Hafazan", href: "/ibu-bapa/hafazan", icon: BookMarked },
    { label: "Yuran", href: "/ibu-bapa/yuran", icon: ReceiptText },
    { label: "Mesej", href: "/ibu-bapa/mesej", icon: MessageCircle },
  ],
};

const portalName: Record<AppRole, string> = {
  admin: "Portal Admin",
  guru: "Portal Guru",
  ibu_bapa: "Portal Ibu Bapa",
};

function isActive(pathname: string, href: string) {
  if (href.split("/").length === 2) return pathname === href;
  return pathname.startsWith(href);
}

export function AppShell({
  account,
  children,
}: {
  account: CurrentAccount;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const navigation = navByRole[account.role];

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r bg-card p-5 md:flex md:flex-col">
        <BrandMark />
        <div className="mt-7 rounded-2xl bg-secondary p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary-foreground/70">
            {portalName[account.role]}
          </p>
          <p className="mt-1 truncate text-sm font-bold text-secondary-foreground">
            {account.nama}
          </p>
        </div>

        <nav className="mt-6 flex-1 space-y-1.5" aria-label="Navigasi utama">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-semibold transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-5" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <form action="/auth/keluar" method="post" className="border-t pt-4">
          <button className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3.5 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground">
            <LogOut className="size-5" aria-hidden="true" />
            Log keluar
          </button>
        </form>
      </aside>

      <div className="md:pl-72">
        <header className="sticky top-0 z-20 border-b bg-card/95 px-4 py-3 backdrop-blur md:px-8">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <div className="md:hidden">
              <BrandMark compact />
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {portalName[account.role]}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="max-w-52 truncate text-sm font-bold">{account.nama}</p>
                <p className="max-w-52 truncate text-xs text-muted-foreground">
                  {account.email ?? account.phone ?? "Pengguna"}
                </p>
              </div>
              <div className="grid size-10 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {getInitials(account.nama) || "MC"}
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6 pb-28 md:px-8 md:py-8 md:pb-10">
          {children}
        </main>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t bg-card px-1 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1.5 md:hidden"
        aria-label="Navigasi mudah alih"
      >
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[11px] font-semibold",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="size-5" aria-hidden="true" />
              <span className="max-w-full truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
