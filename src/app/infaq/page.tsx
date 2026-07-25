import type { Metadata } from "next";
import Link from "next/link";
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  CheckCircle2,
  HeartHandshake,
  Mail,
  QrCode,
  ReceiptText,
  Search,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/server";
import type { InfaqSettings } from "@/lib/infaq";
import { submitInfaqAction } from "./actions";

export const metadata: Metadata = {
  title: "Infaq & Tahlil",
  description: "Borang infaq dan pendaftaran nama untuk bacaan tahlil mingguan.",
};

type PageProps = {
  searchParams: Promise<{ ralat?: string }>;
};

const defaultSettings: InfaqSettings = {
  id: 1,
  organization_name: "Madrasah Hub",
  address: null,
  phone: null,
  bank_name: null,
  account_name: null,
  account_number: null,
  qr_image_url: null,
  payment_instructions: "Sila imbas QR atau buat pindahan bank, kemudian muat naik bukti bayaran.",
  receipt_prefix: "INF",
  tahlil_day: 5,
  tahlil_time: "20:30",
  form_active: true,
  email_subject: "Pengesahan Infaq dan Resit Rasmi",
  email_body: "Terima kasih atas sumbangan infaq anda.",
};

export default async function InfaqPage({ searchParams }: PageProps) {
  const { ralat } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.from("infaq_settings").select("*").eq("id", 1).maybeSingle();
  const settings = (data ?? defaultSettings) as InfaqSettings;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <main className="min-h-screen bg-[#f5f7f3]">
      <header className="border-b border-emerald-900/10 bg-[#064E3B] text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/infaq" className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/20">
              <HeartHandshake className="size-6" />
            </span>
            <span>
              <span className="block font-black tracking-wide">{settings.organization_name}</span>
              <span className="block text-xs text-emerald-100">Infaq & Tahlil Mingguan</span>
            </span>
          </Link>
          <Button asChild variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
            <Link href="/infaq/semak"><Search className="size-4" /> Semak Status</Link>
          </Button>
        </div>
      </header>

      <section className="islamic-pattern bg-[#064E3B] px-4 pb-20 pt-10 text-white sm:px-6 sm:pt-14">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold">
            <CalendarDays className="size-4" /> Nama dimasukkan dalam bacaan tahlil mingguan
          </div>
          <h1 className="text-3xl font-black tracking-tight sm:text-5xl">Sampaikan Infaq, Titipkan Nama & Doa</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-emerald-50 sm:text-base">
            Isi maklumat, buat bayaran melalui QR atau pindahan bank dan hantar bukti pembayaran. Pihak madrasah akan menyemak sebelum mengeluarkan resit rasmi.
          </p>
          <div className="mx-auto mt-7 grid max-w-3xl gap-3 text-left sm:grid-cols-3">
            <Step icon={QrCode} title="1. Buat bayaran" text="Imbas QR atau pindahan bank." />
            <Step icon={Upload} title="2. Hantar bukti" text="Lengkapkan borang di bawah." />
            <Step icon={ReceiptText} title="3. Terima resit" text="PDF dihantar selepas disahkan." />
          </div>
        </div>
      </section>

      <div className="mx-auto -mt-10 grid max-w-6xl gap-6 px-4 pb-16 sm:px-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="space-y-5">
          <Card className="overflow-hidden border-emerald-100 bg-white shadow-xl shadow-emerald-950/5">
            <CardHeader className="bg-emerald-50/70">
              <CardTitle className="flex items-center gap-2 text-[#064E3B]"><QrCode className="size-5" /> Maklumat Pembayaran</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
              {settings.qr_image_url ? (
                <div className="mx-auto overflow-hidden rounded-2xl border bg-white p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={settings.qr_image_url} alt="QR pembayaran infaq" className="mx-auto aspect-square w-full max-w-[260px] object-contain" />
                </div>
              ) : (
                <div className="grid aspect-square place-items-center rounded-2xl border border-dashed bg-slate-50 text-center text-sm text-slate-500">
                  <div><QrCode className="mx-auto mb-2 size-10" />QR akan dimasukkan oleh admin.</div>
                </div>
              )}

              <PaymentRow label="Bank" value={settings.bank_name} />
              <PaymentRow label="Nama akaun" value={settings.account_name} />
              <PaymentRow label="Nombor akaun" value={settings.account_number} mono />

              <p className="rounded-2xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">{settings.payment_instructions}</p>
            </CardContent>
          </Card>

          <Card className="border-emerald-100 bg-white">
            <CardContent className="space-y-3 pt-5 text-sm text-slate-600">
              <p className="flex gap-2"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-700" /> Bukti bayaran hanya boleh dilihat oleh admin.</p>
              <p className="flex gap-2"><Mail className="mt-0.5 size-4 shrink-0 text-emerald-700" /> Resit PDF dihantar ke e-mel selepas bayaran disahkan.</p>
              <p className="flex gap-2"><BadgeCheck className="mt-0.5 size-4 shrink-0 text-emerald-700" /> Setiap permohonan menerima nombor rujukan unik.</p>
            </CardContent>
          </Card>
        </aside>

        <Card className="border-emerald-100 bg-white shadow-xl shadow-emerald-950/5">
          <CardHeader className="border-b border-emerald-900/10">
            <CardTitle className="text-xl text-slate-900 sm:text-2xl">Borang Infaq & Nama Tahlil</CardTitle>
            <p className="text-sm leading-6 text-slate-600">Pastikan e-mel betul kerana resit rasmi akan dihantar ke alamat tersebut.</p>
          </CardHeader>
          <CardContent className="pt-6">
            {!settings.form_active ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center text-amber-900">
                Borang infaq sedang ditutup sementara. Sila hubungi pihak madrasah.
              </div>
            ) : (
              <>
                {ralat ? (
                  <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{ralat}</div>
                ) : null}
                <form action={submitInfaqAction} className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Nama penuh">
                      <Input name="donor_name" autoComplete="name" placeholder="Nama penginfaq" required />
                    </Field>
                    <Field label="Nombor telefon">
                      <Input name="phone" inputMode="tel" autoComplete="tel" placeholder="01X-XXXXXXX" required />
                    </Field>
                  </div>

                  <Field label="E-mel untuk menerima resit PDF">
                    <Input name="email" type="email" autoComplete="email" placeholder="nama@email.com" required />
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Jumlah infaq (RM)">
                      <Input name="amount" type="number" inputMode="decimal" min="1" step="0.01" placeholder="50.00" required />
                    </Field>
                    <Field label="Tarikh pembayaran">
                      <Input name="payment_date" type="date" defaultValue={today} required />
                    </Field>
                  </div>

                  <Field label="Nama untuk bacaan tahlil">
                    <Textarea name="tahlil_names" placeholder="Contoh: Allahyarham Ahmad bin Ali, keluarga Haji Abdullah..." className="min-h-28" required />
                    <p className="text-xs text-slate-500">Boleh masukkan lebih daripada satu nama. Pisahkan dengan koma atau baris baharu.</p>
                  </Field>

                  <Field label="Hajat atau catatan (pilihan)">
                    <Textarea name="intention" placeholder="Contoh: Mohon kesihatan, dipermudahkan urusan atau catatan kepada pihak madrasah." />
                  </Field>

                  <Field label="Bukti pembayaran">
                    <Input name="proof" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" required className="h-auto py-2.5" />
                    <p className="text-xs text-slate-500">JPG, PNG, WEBP atau PDF. Maksimum 10MB.</p>
                  </Field>

                  <label className="flex items-start gap-3 rounded-2xl border bg-slate-50 p-4 text-sm text-slate-700">
                    <input name="is_private" type="checkbox" className="mt-1 size-4 accent-emerald-700" />
                    <span><strong>Rahsiakan nama penginfaq.</strong> Nama tahlil masih diberikan kepada petugas, tetapi nama penyumbang tidak dipaparkan kepada umum.</span>
                  </label>

                  <Button type="submit" size="lg" className="w-full">
                    <CheckCircle2 className="size-5" /> Hantar Untuk Semakan Admin
                  </Button>
                </form>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <footer className="border-t bg-white px-4 py-8 text-center text-xs text-slate-500">
        <Building2 className="mx-auto mb-2 size-5 text-emerald-700" />
        {settings.organization_name}{settings.phone ? ` • ${settings.phone}` : ""}
      </footer>
    </main>
  );
}

function Step({ icon: Icon, title, text }: { icon: typeof QrCode; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
      <Icon className="mb-3 size-5 text-emerald-100" />
      <p className="font-bold">{title}</p>
      <p className="mt-1 text-xs text-emerald-100">{text}</p>
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

function PaymentRow({ label, value, mono = false }: { label: string; value: string | null; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b pb-3 last:border-0 last:pb-0">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      <span className={`text-right text-sm font-bold text-slate-900 ${mono ? "font-mono" : ""}`}>{value || "Belum ditetapkan"}</span>
    </div>
  );
}
