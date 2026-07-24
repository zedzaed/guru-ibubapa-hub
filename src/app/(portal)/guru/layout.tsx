import { BookOpenCheck, ClipboardCheck, GraduationCap, LayoutDashboard, MessageSquare, Star } from "lucide-react";
import { PortalShell } from "@/components/portal/portal-shell";
import { requireRole } from "@/lib/auth/require-role";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireRole(["guru"]);
  return (
    <PortalShell
      title="Portal Guru"
      roleLabel="Guru / Ustaz-Ustazah"
      userName={profile.nama}
      navItems={[
        { href: "/guru", label: "Dashboard", icon: LayoutDashboard },
        { href: "/guru/kehadiran", label: "Ambil Kehadiran", icon: ClipboardCheck },
        { href: "/guru/hafazan", label: "Hafazan & Tilawah", icon: BookOpenCheck },
        { href: "/guru/keputusan", label: "Markah Peperiksaan", icon: GraduationCap },
        { href: "/guru/akhlak", label: "Merit / Demerit", icon: Star },
        { href: "/guru/mesej", label: "Mesej Penjaga", icon: MessageSquare },
      ]}
    >
      {children}
    </PortalShell>
  );
}
