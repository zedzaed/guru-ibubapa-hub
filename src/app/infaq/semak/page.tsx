import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CalendarDays, CheckCircle2, Clock3, FileSearch, ReceiptText, Search, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatMalayDate, formatMoney, type InfaqStatus } from "@/lib/infaq";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Semak Status Infaq" };

type PageProps = {
  searchParams: Promise<{ rujukan?: string; email?: string }>;
};

type LookupRow = {
  reference_no: string;
  donor_name: string;
  amount: number | string;
  status: InfaqStatus;
  tahlil_week: string | null;
  tahlil_completed_at: string | null;
  receipt_no: string | null;
  admin_note: string | null;
  created_at: string;
};

const statusMeta: Record<InfaqStatus, { label: string; detail: string; className: string; icon: typeof Clock3 }> = {
  menunggu: {
    label: "Menunggu semakan",
    detail: "Admin belum mengesahkan bukti bayaran.",
    className: "border-amber-200 bg-amber-50 text-amber-900",
    icon: Clock3,
  },
  perlu_bukti_baharu: {
    label: "Bukti baharu diperlukan",
    detail: "Sila hubungi pihak madrasah dan hantar bukti pembayaran yang lebih jelas.",
    className: "border-orange-200 bg-orange-50 text-orange-900",
    icon: FileSearch,
  },
  ditolak: {
    label: "Bayaran tidak disahkan",
    detail: "Permohonan tidak dapat disahkan oleh admin.",
    className: "border-red-200 bg-red-50 text-red-900",
    icon: XCircle,
  },
  dijadualkan: {
    label: "Disahkan & dijadualkan",
    detail: "Bayaran telah disahkan dan nama telah dimasukkan ke senarai tahlil.",
    className: "border-emerald-200 bg-emerald-50 text-emerald-900",
    icon: CalendarDays,
  },
  selesai: {
    label: "Bacaan tahlil selesai",
    detail: "Nama yang didaftarkan telah selesai dibacakan.",
    className: "border-sky-200 bg-sky-50 text-sky-900",
    icon: CheckCircle2,
  },
};

export default async function InfaqLookupPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const reference = String(params.rujukan ?? "").trim();
  const email = String(params.email ?? "").trim().toLowerCase();
  let result: LookupRow | null = null;
  let lookupError = false;

  if (reference && email) {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("lookup_infaq_status", {
      p_reference_no: reference,
      p_email: email,
    });

    lookupError = Boolean(error);
    result = ((data as LookupRow[] | null) ?? [])[0] ?? null;
  }

  const meta = result ? statusMeta[result.status] : null;
  const StatusIcon = meta?.icon ?? Clock3;

  return (
    <main className="min-h-screen bg-[#f5f7f3] px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-2xl space-y-5">
        <Button asChild variant="ghost" className="px-0 text-[#064E3B] hover:bg-transparent">
          <Link href="/infaq"><ArrowLeft className="size-4" /> Kembali ke borang infaq</Link>
        </Button>

        <Card className="border-emerald-100 bg-white shadow-xl shadow-emerald-950/5">
          <CardHeader>
            <div className="mb-3 grid size-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-800">
              <Search className="size-6" />
            </div>
            <CardTitle className="text-2xl text-[#064E3B]">Semak Status Infaq</CardTitle>
            <p className="text-sm leading-6 text-slate-600">Masukkan nombor rujukan dan e-mel yang sama seperti dalam borang infaq.</p>
          </CardHeader>
          <CardContent>
            <form method="get" className="space-y-4">
              <label className="block space-y-1.5">
                <span className="text-sm font-semibold text-slate-700">Nombor rujukan</span>
                <Input name="rujukan" defaultValue={reference} placeholder="INF-20260725-ABC123" required />
              </label>
              <label className="block space-y-1.5">
                <span className="text-sm font-semibold text-slate-700">E-mel penginfaq</span>
                <Input name="email" type="email" defaultValue={email} placeholder="nama@email.com" required />
              </label>
              <Button type="submit" className="w-full"><Search className="size-4" /> Semak Sekarang</Button>
            </form>
          </CardContent>
        </Card>

        {reference && email ? (
          lookupError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">Status tidak dapat disemak buat masa ini. Sila cuba semula.</div>
          ) : result && meta ? (
            <Card className="border-emerald-100 bg-white">
              <CardContent className="space-y-5 pt-5">
                <div className={`flex items-start gap-3 rounded-2xl border p-4 ${meta.className}`}>
                  <StatusIcon className="mt-0.5 size-6 shrink-0" />
                  <div>
                    <p className="font-bold">{meta.label}</p>
                    <p className="mt-1 text-sm leading-6">{meta.detail}</p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Info label="Nombor rujukan" value={result.reference_no} mono />
                  <Info label="Nama penginfaq" value={result.donor_name} />
                  <Info label="Jumlah infaq" value={formatMoney(result.amount)} />
                  <Info label="Tarikh dihantar" value={formatMalayDate(result.created_at)} />
                  <Info label="Tarikh tahlil" value={formatMalayDate(result.tahlil_week)} />
                  <Info label="Nombor resit" value={result.receipt_no ?? "Belum dijana"} mono />
                </div>

                {result.admin_note ? (
                  <div className="rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-900"><strong>Catatan admin:</strong> {result.admin_note}</div>
                ) : null}

                {result.receipt_no ? (
                  <p className="flex items-center gap-2 text-sm text-slate-600"><ReceiptText className="size-4 text-emerald-700" /> Resit PDF dihantar ke e-mel selepas pengesahan.</p>
                ) : null}
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">Rekod tidak ditemui. Semak semula nombor rujukan dan e-mel.</div>
          )
        ) : null}
      </div>
    </main>
  );
}

function Info({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-2xl border bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 break-words font-bold text-slate-900 ${mono ? "font-mono text-sm" : ""}`}>{value}</p>
    </div>
  );
}
