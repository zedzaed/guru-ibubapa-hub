import {
  AlertCircle,
  Banknote,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  FileText,
  HeartHandshake,
  MailCheck,
  PlusCircle,
  QrCode,
  ReceiptText,
  Save,
  SearchCheck,
  Settings2,
  Upload,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { requireRole } from "@/lib/auth/require-role";
import {
  formatMalayDate,
  formatMoney,
  getNextTahlilDate,
  type InfaqSettings,
  type InfaqStatus,
  type InfaqSubmission,
} from "@/lib/infaq";
import { createClient } from "@/lib/supabase/server";
import {
  approveInfaqAction,
  completeTahlilAction,
  createManualInfaqAction,
  resendInfaqReceiptAction,
  saveInfaqSettingsAction,
  updateInfaqStatusAction,
} from "./actions";

type PageProps = {
  searchParams: Promise<{ berjaya?: string; ralat?: string; status?: string }>;
};

type SubmissionWithProof = InfaqSubmission & { proof_signed_url: string | null };

const dayOptions = [
  { value: 0, label: "Ahad" },
  { value: 1, label: "Isnin" },
  { value: 2, label: "Selasa" },
  { value: 3, label: "Rabu" },
  { value: 4, label: "Khamis" },
  { value: 5, label: "Jumaat" },
  { value: 6, label: "Sabtu" },
];

const statusMeta: Record<InfaqStatus, { label: string; className: string; icon: typeof Clock3 }> = {
  menunggu: { label: "Menunggu", className: "bg-amber-100 text-amber-900", icon: Clock3 },
  perlu_bukti_baharu: { label: "Perlu bukti", className: "bg-orange-100 text-orange-900", icon: SearchCheck },
  ditolak: { label: "Ditolak", className: "bg-red-100 text-red-800", icon: XCircle },
  dijadualkan: { label: "Dijadualkan", className: "bg-emerald-100 text-emerald-800", icon: CalendarCheck },
  selesai: { label: "Selesai", className: "bg-sky-100 text-sky-800", icon: CheckCircle2 },
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
  email_body: "Terima kasih atas sumbangan infaq anda. Resit rasmi dilampirkan bersama e-mel ini.",
};

export default async function AdminInfaqPage({ searchParams }: PageProps) {
  await requireRole(["admin"]);
  const params = await searchParams;
  const supabase = await createClient();

  const [{ data: settingsData }, { data: submissionsData, error: submissionsError }] = await Promise.all([
    supabase.from("infaq_settings").select("*").eq("id", 1).maybeSingle(),
    supabase.from("infaq_submissions").select("*").order("created_at", { ascending: false }).limit(250),
  ]);

  const settings = (settingsData ?? defaultSettings) as InfaqSettings;
  const allSubmissions = ((submissionsData ?? []) as InfaqSubmission[]);
  const selectedStatus = String(params.status ?? "semua");
  const filtered = selectedStatus === "semua" ? allSubmissions : allSubmissions.filter((item) => item.status === selectedStatus);

  const submissions: SubmissionWithProof[] = await Promise.all(
    filtered.map(async (item) => {
      if (!item.proof_path) return { ...item, proof_signed_url: null };
      const { data } = await supabase.storage.from("infaq-proofs").createSignedUrl(item.proof_path, 60 * 60);
      return { ...item, proof_signed_url: data?.signedUrl ?? null };
    }),
  );

  const waiting = allSubmissions.filter((item) => item.status === "menunggu").length;
  const scheduled = allSubmissions.filter((item) => item.status === "dijadualkan").length;
  const completed = allSubmissions.filter((item) => item.status === "selesai").length;
  const confirmedTotal = allSubmissions
    .filter((item) => ["dijadualkan", "selesai"].includes(item.status))
    .reduce((sum, item) => sum + Number(item.amount), 0);
  const defaultTahlilDate = getNextTahlilDate(settings.tahlil_day);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <section className="islamic-pattern overflow-hidden rounded-[2rem] border border-emerald-100 bg-[#064E3B] p-6 text-white shadow-xl shadow-emerald-950/10 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold">
              <HeartHandshake className="size-4" /> Fasa 3
            </div>
            <h1 className="text-2xl font-black tracking-tight sm:text-4xl">Pengurusan Infaq & Tahlil</h1>
            <p className="mt-3 text-sm leading-6 text-emerald-50 sm:text-base">Semak pembayaran, urus nama bacaan mingguan, jana resit PDF dan hantar pengesahan melalui e-mel.</p>
          </div>
          <Button asChild variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20">
            <a href="/infaq" target="_blank" rel="noreferrer"><HeartHandshake className="size-4" /> Buka Borang Awam</a>
          </Button>
        </div>
      </section>

      {params.berjaya ? (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"><CheckCircle2 className="mt-0.5 size-5 shrink-0" /><p>{params.berjaya}</p></div>
      ) : null}
      {params.ralat ? (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><AlertCircle className="mt-0.5 size-5 shrink-0" /><p>{params.ralat}</p></div>
      ) : null}
      {submissionsError ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Migration modul Infaq belum dijalankan: {submissionsError.message}</div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={Clock3} label="Menunggu semakan" value={String(waiting)} />
        <Stat icon={CalendarCheck} label="Dijadualkan" value={String(scheduled)} />
        <Stat icon={CheckCircle2} label="Tahlil selesai" value={String(completed)} />
        <Stat icon={Banknote} label="Infaq disahkan" value={formatMoney(confirmedTotal)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
        <Card className="border-emerald-100 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Settings2 className="size-5 text-emerald-700" /> Tetapan Infaq</CardTitle>
            <p className="text-sm text-slate-600">Semua maklumat pembayaran dan resit boleh diubah oleh admin.</p>
          </CardHeader>
          <CardContent>
            <form action={saveInfaqSettingsAction} className="space-y-4">
              <input type="hidden" name="existing_qr_url" value={settings.qr_image_url ?? ""} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nama madrasah / organisasi"><Input name="organization_name" defaultValue={settings.organization_name} required /></Field>
                <Field label="Nombor telefon"><Input name="phone" defaultValue={settings.phone ?? ""} /></Field>
              </div>
              <Field label="Alamat pada resit"><Textarea name="address" defaultValue={settings.address ?? ""} /></Field>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Nama bank"><Input name="bank_name" defaultValue={settings.bank_name ?? ""} /></Field>
                <Field label="Nama akaun"><Input name="account_name" defaultValue={settings.account_name ?? ""} /></Field>
                <Field label="Nombor akaun"><Input name="account_number" defaultValue={settings.account_number ?? ""} /></Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
                <div className="rounded-2xl border bg-slate-50 p-3">
                  {settings.qr_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={settings.qr_image_url} alt="QR semasa" className="aspect-square w-full object-contain" />
                  ) : (
                    <div className="grid aspect-square place-items-center text-center text-xs text-slate-500"><QrCode className="mb-2 size-8" />Belum ada QR</div>
                  )}
                </div>
                <Field label="Tukar gambar QR statik"><Input name="qr_file" type="file" accept="image/jpeg,image/png,image/webp" className="h-auto py-2.5" /><p className="text-xs text-slate-500">Biarkan kosong untuk kekalkan QR semasa.</p></Field>
              </div>

              <Field label="Arahan pembayaran"><Textarea name="payment_instructions" defaultValue={settings.payment_instructions} required /></Field>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Awalan nombor resit"><Input name="receipt_prefix" defaultValue={settings.receipt_prefix} maxLength={12} required /></Field>
                <Field label="Hari tahlil mingguan"><Select name="tahlil_day" defaultValue={String(settings.tahlil_day)}>{dayOptions.map((day) => <option key={day.value} value={day.value}>{day.label}</option>)}</Select></Field>
                <Field label="Waktu tahlil"><Input name="tahlil_time" type="time" defaultValue={settings.tahlil_time.slice(0, 5)} required /></Field>
              </div>
              <Field label="Subjek e-mel resit"><Input name="email_subject" defaultValue={settings.email_subject} required /></Field>
              <Field label="Teks e-mel resit"><Textarea name="email_body" defaultValue={settings.email_body} required /></Field>
              <label className="flex items-center gap-3 rounded-2xl border bg-slate-50 p-4 text-sm font-semibold text-slate-700"><input name="form_active" type="checkbox" defaultChecked={settings.form_active} className="size-4 accent-emerald-700" /> Borang infaq awam aktif</label>
              <Button type="submit" className="w-full sm:w-auto"><Save className="size-4" /> Simpan Tetapan</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="h-fit border-emerald-100 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><PlusCircle className="size-5 text-emerald-700" /> Tambah Infaq Manual</CardTitle>
            <p className="text-sm text-slate-600">Untuk bayaran tunai, WhatsApp atau rekod yang dimasukkan oleh admin.</p>
          </CardHeader>
          <CardContent>
            <form action={createManualInfaqAction} className="space-y-4">
              <Field label="Nama penginfaq"><Input name="donor_name" required /></Field>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                <Field label="E-mel"><Input name="email" type="email" required /></Field>
                <Field label="Telefon"><Input name="phone" required /></Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                <Field label="Jumlah (RM)"><Input name="amount" type="number" min="1" step="0.01" required /></Field>
                <Field label="Tarikh bayaran"><Input name="payment_date" type="date" defaultValue={today} /></Field>
              </div>
              <Field label="Nama untuk tahlil"><Textarea name="tahlil_names" required /></Field>
              <Field label="Hajat / catatan"><Textarea name="intention" /></Field>
              <Field label="Bukti bayaran (pilihan)"><Input name="proof" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="h-auto py-2.5" /></Field>
              <label className="flex items-center gap-3 text-sm text-slate-700"><input name="is_private" type="checkbox" className="size-4 accent-emerald-700" /> Rahsiakan nama penginfaq</label>
              <Button type="submit" className="w-full"><PlusCircle className="size-4" /> Tambah Rekod</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card className="border-emerald-100 bg-white">
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Senarai Infaq & Tahlil</CardTitle>
              <p className="mt-1 text-sm text-slate-600">{filtered.length} rekod dipaparkan daripada {allSubmissions.length} rekod.</p>
            </div>
            <form method="get" className="flex gap-2">
              <Select name="status" defaultValue={selectedStatus} className="min-w-44">
                <option value="semua">Semua status</option>
                <option value="menunggu">Menunggu</option>
                <option value="perlu_bukti_baharu">Perlu bukti baharu</option>
                <option value="ditolak">Ditolak</option>
                <option value="dijadualkan">Dijadualkan</option>
                <option value="selesai">Selesai</option>
              </Select>
              <Button type="submit" variant="outline">Tapis</Button>
            </form>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {submissions.length ? submissions.map((item) => {
              const meta = statusMeta[item.status];
              const StatusIcon = meta.icon;
              return (
                <article key={item.id} className="rounded-3xl border border-slate-100 bg-[#fbfcfa] p-4 sm:p-5">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-slate-900">{item.donor_name}</h3>
                        <Badge className={meta.className}><StatusIcon className="mr-1 size-3.5" />{meta.label}</Badge>
                        <Badge className="border bg-white text-slate-700">{item.source === "admin" ? "Manual" : "Borang awam"}</Badge>
                        {item.is_private ? <Badge className="bg-slate-200 text-slate-700">Rahsia</Badge> : null}
                      </div>
                      <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
                        <Mini label="Rujukan" value={item.reference_no} mono />
                        <Mini label="Jumlah" value={formatMoney(item.amount)} />
                        <Mini label="Dihantar" value={formatMalayDate(item.created_at)} />
                        <Mini label="Tahlil" value={formatMalayDate(item.tahlil_week)} />
                      </div>
                      <div className="rounded-2xl border bg-white p-4">
                        <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Nama bacaan tahlil</p>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-800">{item.tahlil_names}</p>
                        {item.intention ? <p className="mt-3 border-t pt-3 text-sm text-slate-600"><strong>Hajat:</strong> {item.intention}</p> : null}
                      </div>
                      <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                        <span>{item.email}</span><span>{item.phone}</span>
                        {item.receipt_no ? <span className="font-mono">Resit: {item.receipt_no}</span> : null}
                        {item.email_sent_at ? <span className="text-emerald-700">E-mel dihantar {formatMalayDate(item.email_sent_at)}</span> : null}
                      </div>
                      {item.admin_note ? <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900"><strong>Catatan admin:</strong> {item.admin_note}</p> : null}
                      {item.email_error ? <p className="rounded-xl bg-red-50 p-3 text-xs text-red-800"><strong>E-mel:</strong> {item.email_error}</p> : null}
                    </div>

                    <div className="grid shrink-0 gap-2 sm:grid-cols-2 xl:w-[330px] xl:grid-cols-1">
                      {item.proof_signed_url ? <Button asChild variant="outline"><a href={item.proof_signed_url} target="_blank" rel="noreferrer"><Upload className="size-4" /> Lihat Bukti Bayaran</a></Button> : <Button variant="outline" disabled><FileText className="size-4" /> Tiada Bukti</Button>}

                      {item.status === "menunggu" || item.status === "perlu_bukti_baharu" ? (
                        <form action={approveInfaqAction} className="space-y-2 rounded-2xl border bg-white p-3 sm:col-span-2 xl:col-span-1">
                          <input type="hidden" name="submission_id" value={item.id} />
                          <label className="block text-xs font-semibold text-slate-600">Tarikh tahlil</label>
                          <Input name="tahlil_week" type="date" defaultValue={item.tahlil_week ?? defaultTahlilDate} required />
                          <Input name="admin_note" placeholder="Catatan admin (pilihan)" />
                          <Button type="submit" className="w-full"><CheckCircle2 className="size-4" /> Sahkan & Hantar Resit</Button>
                        </form>
                      ) : null}

                      {item.status === "menunggu" ? (
                        <form action={updateInfaqStatusAction} className="space-y-2 rounded-2xl border bg-white p-3 sm:col-span-2 xl:col-span-1">
                          <input type="hidden" name="submission_id" value={item.id} />
                          <Select name="status" defaultValue="perlu_bukti_baharu"><option value="perlu_bukti_baharu">Minta bukti baharu</option><option value="ditolak">Tolak bayaran</option></Select>
                          <Input name="admin_note" placeholder="Sebab / arahan kepada penginfaq" required />
                          <Button type="submit" variant="outline" className="w-full"><AlertCircle className="size-4" /> Kemas Kini Status</Button>
                        </form>
                      ) : null}

                      {item.status === "dijadualkan" ? (
                        <form action={completeTahlilAction}><input type="hidden" name="submission_id" value={item.id} /><Button type="submit" className="w-full"><CalendarCheck className="size-4" /> Tandakan Tahlil Selesai</Button></form>
                      ) : null}

                      {item.receipt_no ? (
                        <>
                          <Button asChild variant="outline"><a href={`/api/admin/infaq/${item.id}/resit`} target="_blank" rel="noreferrer"><ReceiptText className="size-4" /> Muat Turun Resit PDF</a></Button>
                          <form action={resendInfaqReceiptAction}><input type="hidden" name="submission_id" value={item.id} /><Button type="submit" variant="outline" className="w-full"><MailCheck className="size-4" /> Hantar Semula E-mel</Button></form>
                        </>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            }) : (
              <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-slate-500">Belum ada rekod untuk status ini.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-1.5"><span className="text-sm font-semibold text-slate-700">{label}</span>{children}</label>;
}

function Stat({ icon: Icon, label, value }: { icon: typeof Clock3; label: string; value: string }) {
  return <Card className="border-emerald-100 bg-white"><CardContent className="flex items-center gap-4 pt-5"><span className="grid size-11 place-items-center rounded-2xl bg-emerald-100 text-emerald-800"><Icon className="size-5" /></span><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 text-xl font-black text-slate-900">{value}</p></div></CardContent></Card>;
}

function Mini({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return <div><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p><p className={`mt-0.5 break-words font-semibold text-slate-700 ${mono ? "font-mono text-xs" : ""}`}>{value}</p></div>;
}
