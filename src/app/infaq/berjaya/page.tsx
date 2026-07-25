import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ClipboardCheck, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Permohonan Infaq Diterima" };

type PageProps = {
  searchParams: Promise<{ rujukan?: string }>;
};

export default async function InfaqSuccessPage({ searchParams }: PageProps) {
  const { rujukan } = await searchParams;

  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f7f3] px-4 py-10">
      <Card className="w-full max-w-xl border-emerald-100 bg-white text-center shadow-xl shadow-emerald-950/5">
        <CardHeader className="items-center">
          <span className="mb-3 grid size-16 place-items-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="size-9" />
          </span>
          <CardTitle className="text-2xl text-[#064E3B]">Permohonan Infaq Diterima</CardTitle>
          <p className="mt-2 text-sm leading-6 text-slate-600">Bukti bayaran akan disemak oleh admin sebelum resit PDF dihantar melalui e-mel.</p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Nombor rujukan</p>
            <p className="mt-2 break-all font-mono text-xl font-black text-[#064E3B]">{rujukan || "Tidak tersedia"}</p>
          </div>

          <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 text-left text-sm leading-6 text-slate-600">
            <ClipboardCheck className="mt-0.5 size-5 shrink-0 text-emerald-700" />
            <p>Simpan nombor rujukan ini. Untuk semakan status, masukkan nombor rujukan bersama e-mel yang digunakan dalam borang.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Button asChild>
              <Link href={`/infaq/semak${rujukan ? `?rujukan=${encodeURIComponent(rujukan)}` : ""}`}><Search className="size-4" /> Semak Status</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/infaq"><Home className="size-4" /> Kembali</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
