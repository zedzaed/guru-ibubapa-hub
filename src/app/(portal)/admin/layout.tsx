import { BarChart3, CalendarDays, LayoutDashboard, Megaphone, School, Users, WalletCards } from "lucide-react";
import { PortalShell } from "@/components/portal/portal-shell";
import { requireRole } from "@/lib/auth/require-role";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireRole(["admin"]);
  return (
    <PortalShell
      title="Pentadbiran Madrasah"
      roleLabel="Admin"
      userName={profile.nama}
      navItems={[
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/pelajar", label: "Pelajar & Penjaga", icon: Users },
        { href: "/admin/kelas", label: "Kelas & Guru", icon: School },
        { href: "/admin/yuran", label: "Yuran & Invois", icon: WalletCards },
        { href: "/admin/pengumuman", label: "Pengumuman", icon: Megaphone },
        { href: "/admin/kalendar", label: "Kalendar", icon: CalendarDays },
        { href: "/admin/laporan", label: "Laporan", icon: BarChart3 },
      ]}
    >
      {children}
    </PortalShell>
  );
}
