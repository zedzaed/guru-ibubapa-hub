import {
  AlertCircle,
  CheckCircle2,
  GraduationCap,
  HeartHandshake,
  ShieldCheck,
  UserPlus,
  UsersRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/database";
import { createUserAction, updateUserStatusAction } from "./actions";

type PageProps = {
  searchParams: Promise<{ berjaya?: string; ralat?: string }>;
};

type ProfileRow = {
  id: string;
  nama: string;
  email: string | null;
  phone: string | null;
  status: string;
};

const roleMeta: Record<UserRole, { label: string; className: string }> = {
  admin: { label: "Admin", className: "bg-emerald-100 text-emerald-800" },
  guru: { label: "Guru", className: "bg-sky-100 text-sky-800" },
  ibu_bapa: { label: "Ibu Bapa", className: "bg-amber-100 text-amber-800" },
};

export default async function UserManagementPage({ searchParams }: PageProps) {
  const currentAdmin = await requireRole(["admin"]);
  const { berjaya, ralat } = await searchParams;
  const supabase = await createClient();

  const [{ data: profiles }, { data: roles }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id,nama,email,phone,status")
      .order("nama", { ascending: true }),
    supabase.from("user_roles").select("user_id,role"),
  ]);

  const roleByUser = new Map<string, UserRole>();
  for (const role of roles ?? []) {
    if (!roleByUser.has(role.user_id)) roleByUser.set(role.user_id, role.role as UserRole);
  }

  const users = (profiles ?? []) as ProfileRow[];
  const activeUsers = users.filter((user) => user.status === "aktif").length;
  const admins = users.filter((user) => roleByUser.get(user.id) === "admin").length;
  const teachers = users.filter((user) => roleByUser.get(user.id) === "guru").length;
  const parents = users.filter((user) => roleByUser.get(user.id) === "ibu_bapa").length;

  return (
    <div className="space-y-6">
      <section className="islamic-pattern relative overflow-hidden rounded-[2rem] border border-emerald-100 bg-white p-5 shadow-[0_20px_60px_-36px_rgba(20,83,45,0.35)] sm:p-7">
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
              <ShieldCheck className="size-3.5" /> Kawalan akses pengguna
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Pengurusan Pengguna
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
              Cipta akaun Admin, Guru dan Ibu Bapa. Setiap pengguna akan dibawa ke portal yang betul mengikut peranan mereka.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:min-w-[430px]">
            <MiniStat label="Aktif" value={activeUsers} icon={UsersRound} />
            <MiniStat label="Admin" value={admins} icon={ShieldCheck} />
            <MiniStat label="Guru" value={teachers} icon={GraduationCap} />
            <MiniStat label="Ibu Bapa" value={parents} icon={HeartHandshake} />
          </div>
        </div>
      </section>

      {berjaya ? (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
          <p>{berjaya}</p>
        </div>
      ) : null}

      {ralat ? (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle className="mt-0.5 size-5 shrink-0" />
          <p>{ralat}</p>
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[390px_1fr]">
        <Card className="h-fit border-emerald-100 bg-white/95">
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-emerald-100 text-emerald-800">
                <UserPlus className="size-5" />
              </span>
              <div>
                <CardTitle>Cipta akaun baharu</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">Admin tetapkan butiran dan kata laluan sementara.</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form action={createUserAction} className="space-y-4">
              <Field label="Nama penuh">
                <Input name="nama" placeholder="Contoh: Ustaz Ahmad" required />
              </Field>
              <Field label="E-mel login">
                <Input name="email" type="email" placeholder="nama@email.com" autoComplete="off" required />
              </Field>
              <Field label="Nombor telefon">
                <Input name="phone" inputMode="tel" placeholder="01X-XXXXXXX" autoComplete="off" />
              </Field>
              <Field label="Peranan">
                <Select name="role" defaultValue="guru" required>
                  <option value="admin">Admin</option>
                  <option value="guru">Guru / Ustaz-Ustazah</option>
                  <option value="ibu_bapa">Ibu Bapa / Penjaga</option>
                </Select>
              </Field>
              <Field label="Kata laluan sementara">
                <Input name="password" type="password" minLength={8} autoComplete="new-password" placeholder="Minimum 8 aksara" required />
              </Field>
              <p className="rounded-xl bg-[#f5f7f3] p-3 text-xs leading-5 text-slate-600">
                Berikan e-mel dan kata laluan sementara kepada pengguna. Mereka boleh terus log masuk selepas akaun disahkan oleh Supabase.
              </p>
              <Button type="submit" className="w-full">
                <UserPlus className="size-4" /> Cipta Pengguna
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-emerald-100 bg-white/95">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle>Senarai pengguna</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">{users.length} akaun dalam sistem</p>
              </div>
              <Badge className="bg-emerald-100 text-emerald-800">Supabase Auth</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {users.length ? (
                users.map((user) => {
                  const role = roleByUser.get(user.id) ?? "ibu_bapa";
                  const meta = roleMeta[role];
                  const isActive = user.status === "aktif";
                  const isCurrent = user.id === currentAdmin.id;

                  return (
                    <div key={user.id} className="rounded-2xl border border-slate-100 bg-[#fbfcfa] p-4 transition hover:border-emerald-100 hover:bg-white">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate font-bold text-slate-900">{user.nama}</p>
                            <Badge className={meta.className}>{meta.label}</Badge>
                            {isCurrent ? <Badge variant="outline">Anda</Badge> : null}
                          </div>
                          <p className="mt-1 truncate text-sm text-slate-600">{user.email ?? "Tiada e-mel"}</p>
                          {user.phone ? <p className="mt-0.5 text-xs text-slate-500">{user.phone}</p> : null}
                        </div>

                        <div className="flex items-center justify-between gap-3 sm:justify-end">
                          <span className={isActive ? "text-xs font-bold text-emerald-700" : "text-xs font-bold text-slate-500"}>
                            {isActive ? "Aktif" : "Tidak aktif"}
                          </span>
                          <form action={updateUserStatusAction}>
                            <input type="hidden" name="user_id" value={user.id} />
                            <input type="hidden" name="status" value={isActive ? "tidak_aktif" : "aktif"} />
                            <Button type="submit" size="sm" variant={isActive ? "outline" : "default"} disabled={isCurrent && isActive}>
                              {isActive ? "Nyahaktif" : "Aktifkan"}
                            </Button>
                          </form>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                  Belum ada pengguna untuk dipaparkan.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function MiniStat({ label, value, icon: Icon }: { label: string; value: number; icon: typeof UsersRound }) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-[#fbfcfa]/95 p-3">
      <div className="flex items-center gap-2 text-emerald-800">
        <Icon className="size-4" />
        <span className="text-[11px] font-bold uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-2 text-xl font-extrabold text-slate-900">{value}</p>
    </div>
  );
}
