import type { Metadata } from "next";
import { BookOpenCheck, LockKeyhole, ShieldCheck } from "lucide-react";
import { loginAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata: Metadata = { title: "Log Masuk" };

type LoginPageProps = {
  searchParams: Promise<{ ralat?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { ralat } = await searchParams;

  return (
    <main className="grid min-h-screen place-items-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-3">
          <div className="grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <BookOpenCheck className="size-6" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xl font-bold tracking-tight">Portal Madrasah</p>
            <p className="text-sm text-muted-foreground">Ilmu, akhlak dan perkembangan anak</p>
          </div>
        </div>

        <Card className="border-0 shadow-lg shadow-emerald-950/5">
          <CardHeader>
            <CardTitle>Log masuk akaun</CardTitle>
            <CardDescription>Gunakan e-mel atau nombor telefon yang berdaftar.</CardDescription>
          </CardHeader>
          <CardContent>
            {ralat ? (
              <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {ralat}
              </div>
            ) : null}

            <form action={loginAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="identifier">E-mel atau nombor telefon</Label>
                <Input id="identifier" name="identifier" placeholder="nama@email.com atau 01X..." autoComplete="username" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Kata laluan</Label>
                <Input id="password" name="password" type="password" autoComplete="current-password" required />
              </div>
              <Button type="submit" className="w-full">
                <LockKeyhole className="size-4" />
                Log Masuk
              </Button>
            </form>

            <div className="mt-5 flex items-start gap-2 rounded-xl bg-muted p-3 text-xs leading-5 text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
              Data pelajar dilindungi mengikut hubungan penjaga, kelas guru dan peranan pengguna.
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
