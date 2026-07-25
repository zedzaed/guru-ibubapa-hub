import Link from "next/link";
import {
  AlertCircle,
  Banknote,
  CalendarCheck2,
  CheckCircle2,
  CircleDollarSign,
  ExternalLink,
  FileCheck2,
  HeartHandshake,
  MailCheck,
  ReceiptText,
  Settings2,
  Upload,
  UserPlus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/shared/submit-button";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import type { InfaqPaymentStatus, InfaqSettings, InfaqSubmission, InfaqTahlilStatus } from "@/types/database";
import {
  createManualInfaqAction,
  resendInfaqReceiptAction,
  reviewInfaqAction,
  saveInfaqSettingsAction,
} from "./actions";

type PageProps = {
  searchParams: Promise<{ berjaya?: string; ralat?: string }>;
};

const paymentMeta: Record<InfaqPaymentStatus, { label: string; className: string }> = {
  menunggu: { label: "Menunggu", className: "bg-amber-100 text-amber-800" },
  disahkan: { label: "Disahkan", className: "bg-emerald-100 text-emerald-800" },
  ditolak: { label: "Ditolak", className: "bg-red-100 text-red-800" },
  perlu_bukti: { label: "Perlu bukti", className: "bg-sky-100 text-sky-800" },
};

const tahlilMeta: Record<InfaqTahlilStatus, string> = {
  belum_dijadual: "Belum dijadual",
  dijadualkan: "Dijadualkan",
  selesai: "Selesai",
  dibawa_ke_hadapan: "Minggu berikutnya",
};

function money(value: number) {
  return new Intl.NumberFormat("en-MY", { style: "currency", currency: "MYR" }).format(value);
}

function dateTime(value: string) {
  return new Intl.DateTimeFormat("en-MY", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kuala_Lumpur",
  }).format(new Date(value));
}

export default async function AdminInfaqPage({ searchParams }: PageProps) {
  await requireRole(["admin"]);
  const { berjaya, ralat } = await searchParams;
  const supabase = await createClient();
  const [{ data: settingsData }, { data: recordsData, error: recordsError }] = await Promise.all([
    supabase.from("infaq_settings").select("*").eq("id", 1).maybeSingle(),
    supabase.from("infaq_submissions").select("*").order("created_at", { ascending: false }).limit(100),
  ]);

  const settings = settingsData as InfaqSettings | null;
  const records = (recordsData ?? []) as InfaqSubmission[];
  const proofUrls = new Map<string, string>();

  await Promise.all(records.map(async (record) => {
    if (!record.payment_proof_path) return;
    const { data } = await supabase.storage.from("infaq-proofs").createSignedUrl(record.payment_proof_path, 3600);
    if (data?.signedUrl) proofUrls.set(record.id, data.signedUrl);
  }));

  const qrUrl = settings?.qr_path
    ? supabase.storage.from("infaq-assets").getPublicUrl(settings.qr_path).data.publicUrl
    : null;
  const totalConfirmed = records
    .filter((record) => record.payment_status === "disahkan")
    .reduce((sum, record) => sum + Number(record.amount), 0);
  const pending = records.filter((record) => record.payment_status === "menunggu").length;
  const thisWeek = records.filter((record) => record.payment_status === "disahkan" && record.tahlil_status !== "selesai");
  const emailConfigured = Boolean(process.env.RESEND_API_KEY);

  return (
    <div className="space-y-6">
      <section className="islamic-pattern relative overflow-hidden rounded-[2rem] border border-emerald-100 bg-white p-5 shadow-[0_20px_60px_-36px_rgba(20,83,45,0.35)] sm:p-7">
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
              <HeartHandshake className="size-4" /> Fasa 3
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Pengurusan Infaq & Tahlil</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">Urus borang awam, bukti bayaran, resit PDF, e-mel dan senarai bacaan tahlil mingguan.</p>
          </div>
          <Button asChild><Link href="/infaq" target="_blank"><ExternalLink className="size-4" /> Buka Borang Awam</Link></Button>
        </div>
      </section>

      {berjaya ? <Notice success text={berjaya} /> : null}
      {ralat ? <Notice text={ralat} /> : null}
      {recordsError ? <Notice text={`Database belum bersedia: ${recordsError.message}`} /> : null}
      {!emailConfigured ? <Notice text="RESEND_API_KEY belum ditetapkan di Vercel. Pengesahan bayaran tetap boleh dibuat, tetapi e-mel resit belum akan dihantar." /> : null}

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Jumlah disahkan" value={money(totalConfirmed)} icon={CircleDollarSign} />
        <Stat label="Menunggu semakan" value={String(pending)} icon={FileCheck2} />
        <Stat label="Dalam senarai tahlil" value={String(thisWeek.length)} icon={CalendarCheck2} />
        <Stat label="Jumlah rekod" value={String(records.length)} icon={ReceiptText} />
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-emerald-100 bg-white/95">
          <CardHeader><CardTitle className="flex items-center gap-2"><Settings2 className="size-5 text-emerald-700" /> Tetapan Infaq</CardTitle></CardHeader>
          <CardContent>
            <form action={saveInfaqSettingsAction} className="space-y-4">
              <label className="flex items-start gap-3 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900">
                <input name="enabled" type="checkbox" defaultChecked={settings?.enabled} className="mt-1 size-4 accent-emerald-700" />
                <span><strong>Aktifkan borang awam</strong><br />Borang tidak menerima permohonan apabila pilihan ini ditutup.</span>
              </label>
              <Field label="Tajuk kempen"><Input name="campaign_title" defaultValue={settings?.campaign_title ?? "Infaq & Tahlil Mingguan"} required /></Field>
              <Field label="Penerangan"><Textarea name="campaign_description" defaultValue={settings?.campaign_description ?? ""} /></Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nama bank"><Input name="bank_name" defaultValue={settings?.bank_name ?? ""} /></Field>
                <Field label="Nama pemilik akaun"><Input name="account_name" defaultValue={settings?.account_name ?? ""} /></Field>
              </div>
              <Field label="Nombor akaun"><Input name="account_number" defaultValue={settings?.account_number ?? ""} /></Field>
              <Field label="QR pembayaran">
                <div className="rounded-2xl border border-dashed border-emerald-200 p-4">
                  {qrUrl ? <img src={qrUrl} alt="QR infaq semasa" className="mb-3 size-32 rounded-xl border object-contain" /> : null}
                  <Input name="qr_file" type="file" accept="image/jpeg,image/png,image/webp" />
                </div>
              </Field>
              <Field label="Arahan bayaran"><Textarea name="payment_instructions" defaultValue={settings?.payment_instructions ?? ""} /></Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Cadangan jumlah — pisahkan koma"><Input name="suggested_amounts" defaultValue={(settings?.suggested_amounts ?? [10, 20, 50, 100]).join(", ")} /></Field>
                <Field label="Hari tahlil mingguan">
                  <Select name="tahlil_day" defaultValue={String(settings?.tahlil_day ?? 5)}>
                    <option value="0">Ahad</option><option value="1">Isnin</option><option value="2">Selasa</option><option value="3">Rabu</option><option value="4">Khamis</option><option value="5">Jumaat</option><option value="6">Sabtu</option>
                  </Select>
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Prefix resit"><Input name="receipt_prefix" defaultValue={settings?.receipt_prefix ?? "INF"} /></Field>
                <Field label="Nama organisasi"><Input name="organisation_name" defaultValue={settings?.organisation_name ?? "Madrasah Hub"} /></Field>
              </div>
              <Field label="Alamat pada resit"><Textarea name="organisation_address" defaultValue={settings?.organisation_address ?? ""} className="min-h-20" /></Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Telefon organisasi"><Input name="organisation_phone" defaultValue={settings?.organisation_phone ?? ""} /></Field>
                <Field label="E-mel penghantar yang disahkan Resend"><Input name="sender_email" type="email" defaultValue={settings?.sender_email ?? ""} /></Field>
              </div>
              <Field label="Subjek e-mel"><Input name="email_subject" defaultValue={settings?.email_subject ?? "Resit Infaq {{reference_no}}"} /></Field>
              <Field label="Teks e-mel"><Textarea name="email_body" defaultValue={settings?.email_body ?? "Terima kasih atas infaq anda. Resit rasmi dilampirkan bersama e-mel ini."} /></Field>
              <SubmitButton className="w-full" pendingLabel="Menyimpan tetapan…"><Settings2 className="size-4" /> Simpan Tetapan</SubmitButton>
            </form>
          </CardContent>
        </Card>

        <Card className="h-fit border-emerald-100 bg-white/95">
          <CardHeader><CardTitle className="flex items-center gap-2"><UserPlus className="size-5 text-emerald-700" /> Tambah Infaq Manual</CardTitle></CardHeader>
          <CardContent>
            <form action={createManualInfaqAction} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nama penginfaq"><Input name="donor_name" required /></Field>
                <Field label="Telefon"><Input name="phone" inputMode="tel" required /></Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="E-mel resit"><Input name="email" type="email" /></Field>
                <Field label="Jumlah (RM)"><Input name="amount" type="number" min="1" step="0.01" required /></Field>
              </div>
              <Field label="Alamat"><Textarea name="address" className="min-h-20" /></Field>
              <Field label="Nama / hajat bacaan tahlil"><Textarea name="tahlil_names" required /></Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Hubungan"><Input name="relationship" /></Field>
                <Field label="Kaedah bayaran">
                  <Select name="payment_method" defaultValue="tunai"><option value="tunai">Tunai</option><option value="qr">QR</option><option value="bank">Pindahan bank</option><option value="lain">Lain-lain</option></Select>
                </Field>
              </div>
              <Field label="Catatan / hajat"><Input name="purpose_note" /></Field>
              <Field label="Bukti bayaran — pilihan"><Input name="payment_proof" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" /></Field>
              <label className="flex items-center gap-2 text-sm text-slate-600"><input name="display_publicly" type="checkbox" className="size-4 accent-emerald-700" /> Benarkan nama penginfaq dipaparkan umum</label>
              <SubmitButton className="w-full" pendingLabel="Menambah rekod…"><UserPlus className="size-4" /> Tambah Rekod Manual</SubmitButton>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card className="border-emerald-100 bg-white/95">
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div><CardTitle>Senarai Permohonan & Bayaran</CardTitle><p className="mt-1 text-xs text-muted-foreground">100 rekod terkini — bukti bayaran hanya boleh dilihat oleh admin.</p></div>
            <Badge className="bg-emerald-100 text-emerald-800">{records.length} rekod</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {records.length ? records.map((record) => {
              const meta = paymentMeta[record.payment_status];
              const proofUrl = proofUrls.get(record.id);
              return (
                <article key={record.id} className="rounded-3xl border border-slate-100 bg-[#fbfcfa] p-4 sm:p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-mono text-xs font-bold text-emerald-800">{record.reference_no}</p>
                        <Badge className={meta.className}>{meta.label}</Badge>
                        <Badge className="border border-slate-200 bg-white text-slate-700">{record.source === "admin" ? "Manual" : "Borang awam"}</Badge>
                      </div>
                      <h3 className="mt-2 text-lg font-extrabold text-slate-900">{record.donor_name}</h3>
                      <p className="text-sm text-slate-600">{record.phone}{record.email ? ` • ${record.email}` : ""}</p>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <Info label="Jumlah" value={money(Number(record.amount))} />
                        <Info label="Dihantar" value={dateTime(record.created_at)} />
                      </div>
                      <div className="mt-3 rounded-2xl bg-emerald-50/60 p-4">
                        <p className="text-xs font-bold uppercase tracking-wide text-emerald-800">Nama / hajat tahlil</p>
                        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">{record.tahlil_names}</p>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {proofUrl ? <Button asChild size="sm" variant="outline"><a href={proofUrl} target="_blank" rel="noreferrer"><Upload className="size-4" /> Lihat bukti</a></Button> : <Badge className="bg-slate-100 text-slate-600">Tiada bukti</Badge>}
                        <Button asChild size="sm" variant="outline"><Link href={`/infaq/status/${record.public_token}`} target="_blank"><ExternalLink className="size-4" /> Status awam</Link></Button>
                        {record.receipt_no ? <Button asChild size="sm" variant="outline"><a href={`/api/infaq/resit/${record.public_token}`} target="_blank" rel="noreferrer"><ReceiptText className="size-4" /> {record.receipt_no}</a></Button> : null}
                      </div>
                    </div>

                    <form action={reviewInfaqAction} className="w-full space-y-3 rounded-2xl border border-slate-100 bg-white p-4 lg:max-w-sm">
                      <input type="hidden" name="id" value={record.id} />
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Status bayaran"><Select name="payment_status" defaultValue={record.payment_status}><option value="menunggu">Menunggu</option><option value="disahkan">Disahkan</option><option value="perlu_bukti">Perlu bukti</option><option value="ditolak">Ditolak</option></Select></Field>
                        <Field label="Status tahlil"><Select name="tahlil_status" defaultValue={record.tahlil_status}><option value="belum_dijadual">Belum dijadual</option><option value="dijadualkan">Dijadualkan</option><option value="dibawa_ke_hadapan">Minggu berikutnya</option><option value="selesai">Selesai</option></Select></Field>
                      </div>
                      <Field label="Tarikh / minggu bacaan"><Input name="scheduled_week" type="date" defaultValue={record.scheduled_week ?? ""} /></Field>
                      <Field label="Catatan admin"><Textarea name="admin_note" defaultValue={record.admin_note ?? ""} className="min-h-20" /></Field>
                      <SubmitButton className="w-full" size="sm" pendingLabel="Mengemas kini…"><CheckCircle2 className="size-4" /> Simpan & Proses</SubmitButton>
                      {record.receipt_no && record.email ? (
                        <div className="border-t pt-3">
                          <p className="mb-2 text-xs text-muted-foreground">E-mel: {record.email_status === "dihantar" ? "Sudah dihantar" : record.email_error ?? "Belum dihantar"}</p>
                          <SubmitButton formAction={resendInfaqReceiptAction} size="sm" variant="outline" className="w-full" pendingLabel="Menghantar…"><MailCheck className="size-4" /> Hantar Semula Resit</SubmitButton>
                        </div>
                      ) : null}
                    </form>
                  </div>
                </article>
              );
            }) : <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">Belum ada rekod infaq.</div>}
          </div>
        </CardContent>
      </Card>

      <Card className="border-emerald-100 bg-white/95">
        <CardHeader><CardTitle className="flex items-center gap-2"><CalendarCheck2 className="size-5 text-emerald-700" /> Senarai Tahlil Aktif</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {thisWeek.length ? thisWeek.map((record) => (
              <div key={record.id} className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
                <div className="flex items-center justify-between gap-2"><p className="font-bold text-slate-900">{record.donor_name}</p><Badge className="bg-white text-emerald-800">{tahlilMeta[record.tahlil_status]}</Badge></div>
                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">{record.tahlil_names}</p>
                {record.scheduled_week ? <p className="mt-3 text-xs font-semibold text-emerald-800">Minggu: {record.scheduled_week}</p> : null}
              </div>
            )) : <p className="text-sm text-muted-foreground">Tiada nama dalam senarai aktif.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-1.5"><span className="text-xs font-semibold text-slate-700">{label}</span>{children}</label>;
}

function Notice({ text, success = false }: { text: string; success?: boolean }) {
  return <div className={`flex items-start gap-3 rounded-2xl border p-4 text-sm ${success ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-amber-200 bg-amber-50 text-amber-900"}`}>{success ? <CheckCircle2 className="mt-0.5 size-5 shrink-0" /> : <AlertCircle className="mt-0.5 size-5 shrink-0" />}<p>{text}</p></div>;
}

function Stat({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Banknote }) {
  return <div className="rounded-3xl border border-emerald-100 bg-white p-4 sm:p-5"><div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p><span className="grid size-9 place-items-center rounded-xl bg-emerald-100 text-emerald-800"><Icon className="size-4" /></span></div><p className="mt-3 text-xl font-black text-slate-900 sm:text-2xl">{value}</p></div>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-white p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 text-sm font-bold text-slate-800">{value}</p></div>;
}
