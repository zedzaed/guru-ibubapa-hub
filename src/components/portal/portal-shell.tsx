import Link from "next/link";
import { BookOpenCheck, LogOut, Menu } from "lucide-react";
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
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
              <BookOpenCheck className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold">{title}</span>
              <span className="block truncate text-xs text-muted-foreground">{userName}</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Badge className="hidden sm:inline-flex">{roleLabel}</Badge>
            <details className="relative md:hidden">
              <summary className="grid size-10 cursor-pointer list-none place-items-center rounded-xl border bg-white">
                <Menu className="size-5" />
              </summary>
              <div className="absolute right-0 mt-2 w-64 rounded-2xl border bg-white p-2 shadow-xl">
                {navItems.map(({ href, label, icon: Icon }) => (
                  <Link key={href} href={href} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium hover:bg-muted">
                    <Icon className="size-4 text-primary" />{label}
                  </Link>
                ))}
                <form action={signOutAction} className="mt-1 border-t pt-2">
                  <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-600 hover:bg-red-50">
                    <LogOut className="size-4" /> Log Keluar
                  </button>
                </form>
              </div>
            </details>
            <form action={signOutAction} className="hidden md:block">
              <Button variant="ghost" size="sm"><LogOut className="size-4" />Log Keluar</Button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl md:grid-cols-[240px_1fr]">
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] border-r bg-white p-4 md:block">
          <nav className="space-y-1">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium hover:bg-muted">
                <Icon className="size-4 text-primary" />{label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="min-w-0 p-4 pb-24 sm:p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
