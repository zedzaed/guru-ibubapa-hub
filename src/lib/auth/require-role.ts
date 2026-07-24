import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/profile";
import type { UserRole } from "@/types/database";

export async function requireRole(allowedRoles: UserRole[]) {
  const profile = await getCurrentProfile();

  if (!profile) redirect("/login");
  if (profile.status !== "aktif") redirect("/tidak-dibenarkan?sebab=status");
  if (!allowedRoles.includes(profile.role)) redirect("/tidak-dibenarkan?sebab=role");

  return profile;
}

export function portalPathForRole(role: UserRole) {
  if (role === "admin") return "/admin";
  if (role === "guru") return "/guru";
  return "/ibu-bapa";
}
