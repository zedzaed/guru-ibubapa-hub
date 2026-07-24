import { redirect } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentAccount, portalForRole } from "@/lib/auth";

export const metadata = { title: "Log Masuk" };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const account = await getCurrentAccount();
  if (account) redirect(portalForRole(account.role));

  return (
    <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-4 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
      <section className="hidden lg:block">
        <div className="max-w-xl">
          <BrandMark />
          <p className="mt-10 text-sm font-bold uppercase tracking-[0.18em] text-primary">
            Sistem Pengurusan Madrasah
          </p>
          <h1 className="mt-4 text-5xl font-bold leading-tight tracking-tight text-foreground">
            Hubungkan pihak madrasah, guru dan ibu bapa dalam satu sistem.
          </h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            Pantau kehadiran, hafazan, keputusan, akhlak dan yuran melalui pengalaman
            yang mudah digunakan pada telefon.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-3 text-sm font-semibold">
            <div className="rounded-2xl border bg-card p-4">Admin</div>
            <div className="rounded-2xl border bg-card p-4">Guru</div>
            <div className="rounded-2xl border bg-card p-4">Ibu Bapa</div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-md">
        <div className="mb-7 lg:hidden">
          <BrandMark />
        </div>
        <Card>
          <CardContent className="p-6 sm:p-8">
            <p className="text-sm font-bold text-primary">Selamat datang</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight">Log masuk ke portal</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Gunakan e-mel atau nombor telefon yang telah didaftarkan oleh pihak madrasah.
            </p>
            <div className="mt-7">
              <LoginForm />
            </div>
          </CardContent>
        </Card>

        <div className="mt-4 rounded-2xl border bg-secondary/70 p-4 text-xs leading-5 text-secondary-foreground">
          <p className="font-bold">Akaun demo selepas seed dijalankan</p>
          <p className="mt-1">Admin: admin@demo.madrasah.my</p>
          <p>Guru: guru1@demo.madrasah.my</p>
          <p>Penjaga: penjaga1@demo.madrasah.my</p>
          <p className="mt-1">Kata laluan: MadrasahDemo#2026</p>
        </div>
      </section>
    </div>
  );
}
