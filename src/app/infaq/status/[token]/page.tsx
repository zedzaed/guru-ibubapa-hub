import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock3, Download, HeartHandshake, ReceiptText, RotateCcw, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import type { InfaqPaymentStatus, InfaqTahlilStatus } from "@/types/database";

type PageProps = {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ baru?: string }>;
};

type StatusRow = {
  reference_no: string;
  donor_name: string;
  amount: number;
  tahlil_names: string;
  payment_status: InfaqPaymentStatus;
  tahlil_status: InfaqTahlilStatus;
  scheduled_week: string | null;
  receipt_no: string | null;
  created_at: string;
};

const paymentMeta: Record<InfaqPaymentStatus, { label: string; className: string; icon: typeof Clock3 }> = {
  menunggu: { label: "Menunggu semakan", className: "bg-amber-100 text-amber-800", icon: Clock3 },
  disahkan: { label: "Bayaran disahkan", className: "bg-emerald-100 text-emerald-800", icon: CheckCircle2 },
  ditolak: { label: "Bayaran ditolak", className: "bg-red-100 text-red-800", icon: XCircle },
  perlu_bukti: { label: "Perlu bukti baharu", className: "bg-sky-100 text-sky-800", icon: RotateCcw },
};

const tahlilLabel: Record<InfaqTahlilStatus, string> = {
  belum_dijadual: "Belum dijadualkan",
  dijadualkan: "Dijadualkan",
  selesai: "Bacaan selesai",
  dibawa_ke_hadapan: "Dibawa ke minggu berikutnya",
};

function money(value: number) {
  return new Intl.NumberFormat("en-MY", { style: "currency", currency: "MYR" }).format(value);
}

function date(value: string) {
  return new Intl.DateTimeFormat("en-MY", { dateStyle: "long", timeZone: "Asia/Kuala_Lumpur" }).format(new Date(value));
}

export default async function InfaqStatusPage({ params, searchParams }: PageProps) {
  const { token } = await params;
  const { baru } = await searchParams;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_infaq_status", { p_token: token });
  const record = (Array.isArray(data) ? data[0] : data) as StatusRow | undefined;

  if (error || !record) notFound();

  const meta = paymentMeta[record.payment_status];
  const StatusIcon = meta.icon;

  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f7f3] px-4 py-10">
      <div className="w-full max-w-2xl space-y-5">
        {baru ? (
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
            <p>Permohonan infaq dan bukti bayaran berjaya dihantar. Simpan pautan halaman ini untuk semakan status.</p>
          </div>
        ) : null}

        <Card className="overflow-hidden border-emerald-100 bg-white/95 shadow-xl shadow-emerald-950/5">
          <div className="islamic-pattern bg-[#064E3B] p-6 text-white sm:p-8">
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-2xl bg-white/10"><HeartHandshake className="size-6" /></span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-100">Madrasah Hub</p>
                <h1 className="text-2xl font-black">Status Infaq & Tahlil</h1>
              </div>
            </div>
          </div>
          <CardHeader className="border-b border-slate-100">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">No. rujukan</p>
                <CardTitle className="mt-1 font-mono text-xl">{record.reference_no}</CardTitle>
              </div>
              <Badge className={meta.className}><StatusIcon className="mr-1 size-4" />{meta.label}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 p-6 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <Info label="Nama penginfaq" value={record.donor_name} />
              <Info label="Jumlah infaq" value={money(record.amount)} />
              <Info label="Tarikh dihantar" value={date(record.created_at)} />
              <Info label="Status tahlil" value={tahlilLabel[record.tahlil_status]} />
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-800">Nama / hajat bacaan tahlil</p>
              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">{record.tahlil_names}</p>
            </div>

            {record.scheduled_week ? (
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                Bacaan dijadualkan pada minggu bermula <strong>{date(record.scheduled_week)}</strong>.
              </div>
            ) : null}

            {record.receipt_no ? (
              <div className="flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-emerald-100 text-emerald-800"><ReceiptText className="size-5" /></span>
                  <div><p className="font-bold text-slate-900">Resit {record.receipt_no}</p><p className="text-xs text-muted-foreground">Bayaran telah disahkan oleh admin.</p></div>
                </div>
                <Button asChild size="sm"><a href={`/api/infaq/resit/${token}`} target="_blank" rel="noreferrer"><Download className="size-4" /> Muat turun PDF</a></Button>
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="outline" className="flex-1"><Link href="/infaq">Daftar infaq baharu</Link></Button>
              <Button asChild className="flex-1"><Link href="/login">Log masuk portal</Link></Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p><p className="mt-1 font-bold text-slate-900">{value}</p></div>;
}
