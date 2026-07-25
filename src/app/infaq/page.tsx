import type { Metadata } from "next";
import Link from "next/link";
import { Banknote, CheckCircle2, FileUp, HeartHandshake, Landmark, LockKeyhole, Mail, QrCode } from "lucide-react";
import { submitPublicInfaqAction } from "./actions";
import { SubmitButton } from "@/components/shared/submit-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/server";
import type { InfaqSettings } from "@/types/database";

export const metadata: Metadata = {
  title: "Infaq & Tahlil | Madrasah Hub",
  description: "Daftar infaq dan nama untuk bacaan tahlil mingguan madrasah.",
};

type PageProps = {
  searchParams: Promise<{ ralat?: string }>;
};

function money(value: number) {
  return new Intl.NumberFormat("en-MY", { style: "currency", currency: "MYR", maximumFractionDigits: 0 }).format(value);
}

export default async function PublicInfaqPage({ searchParams }: PageProps) {
  const { ralat } = await searchParams;
  const supabase = await createClient();
  const { data, error } = await supabase.from("infaq_settings").select("*").eq("id", 1).maybeSingle();
  const settings = data as InfaqSettings | null;
  const qrUrl = settings?.qr_path
    ? supabase.storage.from("infaq-assets").getPublicUrl(settings.qr_path).data.publicUrl
    : null;
  const amounts = (settings?.suggested_amounts ?? [10, 20, 50, 100]).map(Number).filter((value) => value > 0);

  if (error || !settings) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f5f7f3] px-4 py-10">
        <Card className="w-full max-w-lg border-amber-200">
          <CardHeader><CardTitle>Modul Infaq sedang disediakan</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
            <p>Tetapan dan pangkalan data modul Infaq & Tahlil belum tersedia sepenuhnya.</p>
            <Link href="/login" className="font-semibold text-emerald-700 underline">Log masuk ke portal</Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f7f3] px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="islamic-pattern overflow-hidden rounded-[2rem] bg-[#064E3B] p-6 text-white shadow-2xl shadow-emerald-950/15 sm:p-9">
          <div className="grid gap-7 lg:grid-cols-[1fr_340px] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold text-emerald-50">
                <HeartHandshake className="size-4" /> Infaq & Tahlil Mingguan
              </div>
              <h1 className="mt-4 max-w-2xl text-3xl font-black tracking-tight sm:text-5xl">{settings.campaign_title}</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-emerald-50/90 sm:text-base">
                {settings.campaign_description ?? "Salurkan infaq kepada madrasah dan daftarkan nama untuk dimasukkan dalam bacaan tahlil mingguan."}
              </p>
              <div className="mt-6 flex flex-wrap gap-3 text-xs font-semibold text-emerald-50">
                <span className="rounded-full bg-white/10 px-3 py-2"><CheckCircle2 className="mr-1 inline size-4" /> Semakan manual admin</span>
                <span className="rounded-full bg-white/10 px-3 py-2"><Mail className="mr-1 inline size-4" /> Resit PDF melalui e-mel</span>
                <span className="rounded-full bg-white/10 px-3 py-2"><LockKeyhole className="mr-1 inline size-4" /> Bukti bayaran dilindungi</span>
              </div>
            </div>

            <div className="rounded-3xl border border-white/15 bg-white p-5 text-slate-800 shadow-xl">
              <div className="mb-4 flex items-center gap-2 font-bold text-emerald-900"><QrCode className="size-5" /> Bayaran QR statik</div>
              {qrUrl ? (
                <img src={qrUrl} alt="Kod QR pembayaran infaq" className="mx-auto aspect-square w-full max-w-[250px] rounded-2xl border object-contain" />
              ) : (
                <div className="grid aspect-square place-items-center rounded-2xl border border-dashed bg-slate-50 text-center text-sm text-slate-500">
                  Admin belum memuat naik QR pembayaran.
                </div>
              )}
              <div className="mt-4 space-y-1 text-sm">
                <p className="font-bold">{settings.bank_name || "Nama bank belum diisi"}</p>
                <p>{settings.account_name || "Nama akaun belum diisi"}</p>
                <p className="font-mono text-base font-bold text-emerald-800">{settings.account_number || "Nombor akaun belum diisi"}</p>
              </div>
            </div>
          </div>
        </section>

        {!settings.enabled ? (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-6 text-center">
              <p className="font-bold text-amber-900">Borang infaq sedang ditutup buat sementara waktu.</p>
              <p className="mt-2 text-sm text-amber-800">Sila hubungi pihak madrasah untuk maklumat lanjut.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
            <Card className="h-fit border-emerald-100 bg-white/95">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Landmark className="size-5 text-emerald-700" /> Cara membuat infaq</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 text-sm leading-6 text-slate-600">
                <Step number="1" title="Buat pembayaran" text="Imbas QR atau pindahkan bayaran ke akaun yang dipaparkan." />
                <Step number="2" title="Isi maklumat" text="Masukkan maklumat penginfaq dan nama untuk bacaan tahlil." />
                <Step number="3" title="Muat naik bukti" text="Hantar resit atau tangkap layar pembayaran untuk semakan admin." />
                <Step number="4" title="Terima pengesahan" text="Selepas admin sahkan, resit PDF dihantar ke e-mel dan nama dijadualkan untuk tahlil." />
                {settings.payment_instructions ? (
                  <div className="rounded-2xl bg-emerald-50 p-4 text-emerald-900 whitespace-pre-line">{settings.payment_instructions}</div>
                ) : null}
                <div>
                  <p className="mb-2 font-semibold text-slate-800">Cadangan jumlah</p>
                  <div className="flex flex-wrap gap-2">
                    {amounts.map((amount) => <span key={amount} className="rounded-full border border-emerald-100 bg-white px-3 py-1 font-bold text-emerald-800">{money(amount)}</span>)}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-emerald-100 bg-white/95">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Banknote className="size-5 text-emerald-700" /> Borang Infaq & Tahlil</CardTitle>
                <p className="text-sm text-muted-foreground">Medan bertanda * wajib diisi.</p>
              </CardHeader>
              <CardContent>
                {ralat ? <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{ralat}</div> : null}
                <form action={submitPublicInfaqAction} className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Nama penuh *"><Input name="donor_name" required /></Field>
                    <Field label="Nombor telefon *"><Input name="phone" inputMode="tel" required /></Field>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="E-mel untuk resit PDF"><Input name="email" type="email" /></Field>
                    <Field label="Jumlah infaq (RM) *"><Input name="amount" type="number" min="1" step="0.01" inputMode="decimal" required /></Field>
                  </div>
                  <Field label="Alamat"><Textarea name="address" className="min-h-20" /></Field>
                  <Field label="Nama arwah / nama untuk bacaan tahlil *">
                    <Textarea name="tahlil_names" placeholder="Satu nama bagi setiap baris. Boleh juga masukkan hajat kesihatan atau kesejahteraan keluarga." required />
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Hubungan dengan penginfaq"><Input name="relationship" placeholder="Contoh: Ibu, ayah, keluarga" /></Field>
                    <Field label="Catatan / hajat ringkas"><Input name="purpose_note" /></Field>
                  </div>
                  <Field label="Bukti pembayaran *">
                    <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/50 p-4">
                      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-900"><FileUp className="size-4" /> JPG, PNG, WebP atau PDF — maksimum 5MB</div>
                      <Input name="payment_proof" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" required className="bg-white" />
                    </div>
                  </Field>
                  <label className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                    <input name="display_publicly" type="checkbox" className="mt-1 size-4 accent-emerald-700" />
                    <span>Benarkan nama penginfaq dipaparkan dalam senarai penghargaan umum. Nama untuk tahlil kekal untuk kegunaan madrasah.</span>
                  </label>
                  <SubmitButton className="w-full" pendingLabel="Menghantar permohonan…">
                    <HeartHandshake className="size-4" /> Hantar Infaq & Bukti Bayaran
                  </SubmitButton>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="text-center text-xs text-slate-500">
          <Link href="/login" className="font-semibold text-emerald-700 hover:underline">Log masuk portal madrasah</Link>
        </div>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-1.5"><span className="text-sm font-semibold text-slate-700">{label}</span>{children}</label>;
}

function Step({ number, title, text }: { number: string; title: string; text: string }) {
  return (
    <div className="flex gap-3">
      <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-emerald-100 font-black text-emerald-800">{number}</span>
      <div><p className="font-bold text-slate-900">{title}</p><p>{text}</p></div>
    </div>
  );
}
