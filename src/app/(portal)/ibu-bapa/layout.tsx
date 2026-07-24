import { BookOpenCheck, CalendarDays, ClipboardCheck, GraduationCap, LayoutDashboard, Megaphone, MessageSquare, Star, WalletCards } from "lucide-react";
import { PortalShell } from "@/components/portal/portal-shell";
import { requireRole } from "@/lib/auth/require-role";

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireRole(["ibu_bapa"]);
  return (
    <PortalShell
      title="Portal Ibu Bapa"
      roleLabel="Ibu Bapa / Penjaga"
      userName={profile.nama}
      navItems={[
        { href: "/ibu-bapa", label: "Dashboard", icon: LayoutDashboard },
        { href: "/ibu-bapa/kehadiran", label: "Kehadiran", icon: ClipboardCheck },
        { href: "/ibu-bapa/hafazan", label: "Hafazan & Tilawah", icon: BookOpenCheck },
        { href: "/ibu-bapa/keputusan", label: "Keputusan", icon: GraduationCap },
        { href: "/ibu-bapa/akhlak", label: "Akhlak", icon: Star },
        { href: "/ibu-bapa/yuran", label: "Yuran", icon: WalletCards },
        { href: "/ibu-bapa/pengumuman", label: "Pengumuman", icon: Megaphone },
        { href: "/ibu-bapa/kalendar", label: "Kalendar", icon: CalendarDays },
        { href: "/ibu-bapa/mesej", label: "Mesej Guru", icon: MessageSquare },
      ]}
    >
      {children}
    </PortalShell>
  );
}
