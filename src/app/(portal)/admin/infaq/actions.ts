"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/require-role";
import { sendInfaqReceiptEmail } from "@/lib/infaq/email";
import { createClient } from "@/lib/supabase/server";
import type { InfaqPaymentStatus, InfaqSettings, InfaqSubmission, InfaqTahlilStatus } from "@/types/database";

const imageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const proofTypes = new Set([...imageTypes, "application/pdf"]);
const maxFileSize = 5 * 1024 * 1024;

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function optional(formData: FormData, key: string) {
  return text(formData, key) || null;
}

function adminRedirect(type: "berjaya" | "ralat", message: string): never {
  redirect(`/admin/infaq?${type}=${encodeURIComponent(message)}`);
}

function safeFileName(name: string, prefix: string) {
  const extension = name.includes(".") ? `.${name.split(".").pop()?.toLowerCase()}` : "";
  return `${prefix}-${Date.now()}${extension.replace(/[^.a-z0-9]/g, "")}`;
}

async function deliverReceipt(supabase: Awaited<ReturnType<typeof createClient>>, settings: InfaqSettings, record: InfaqSubmission) {
  const result = await sendInfaqReceiptEmail(settings, record);
  await supabase
    .from("infaq_submissions")
    .update({
      email_status: result.sent ? "dihantar" : "gagal",
      email_sent_at: result.sent ? new Date().toISOString() : null,
      email_error: result.error,
    })
    .eq("id", record.id);
  return result;
}

export async function saveInfaqSettingsAction(formData: FormData) {
  await requireRole(["admin"]);
  const supabase = await createClient();
  const { data: existing } = await supabase.from("infaq_settings").select("qr_path").eq("id", 1).maybeSingle();
  let qrPath = existing?.qr_path ?? null;
  const qrFile = formData.get("qr_file");

  if (qrFile instanceof File && qrFile.size > 0) {
    if (qrFile.size > maxFileSize) adminRedirect("ralat", "Fail QR mestilah tidak melebihi 5MB.");
    if (!imageTypes.has(qrFile.type)) adminRedirect("ralat", "Fail QR mestilah dalam format JPG, PNG atau WebP.");

    const newPath = `qr/${safeFileName(qrFile.name, "infaq-qr")}`;
    const { error: uploadError } = await supabase.storage
      .from("infaq-assets")
      .upload(newPath, qrFile, { contentType: qrFile.type, upsert: false });
    if (uploadError) adminRedirect("ralat", `QR gagal dimuat naik: ${uploadError.message}`);
    qrPath = newPath;
  }

  const suggestedAmounts = text(formData, "suggested_amounts")
    .split(",")
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isFinite(value) && value > 0);

  const payload = {
    enabled: formData.get("enabled") === "on",
    campaign_title: text(formData, "campaign_title") || "Infaq & Tahlil Mingguan",
    campaign_description: optional(formData, "campaign_description"),
    bank_name: optional(formData, "bank_name"),
    account_name: optional(formData, "account_name"),
    account_number: optional(formData, "account_number"),
    qr_path: qrPath,
    payment_instructions: optional(formData, "payment_instructions"),
    suggested_amounts: suggestedAmounts.length ? suggestedAmounts : [10, 20, 50, 100],
    tahlil_day: Math.min(6, Math.max(0, Number(text(formData, "tahlil_day") || 5))),
    receipt_prefix: text(formData, "receipt_prefix") || "INF",
    organisation_name: text(formData, "organisation_name") || "Madrasah Hub",
    organisation_address: optional(formData, "organisation_address"),
    organisation_phone: optional(formData, "organisation_phone"),
    sender_email: optional(formData, "sender_email"),
    email_subject: text(formData, "email_subject") || "Resit Infaq {{reference_no}}",
    email_body: text(formData, "email_body") || "Terima kasih atas infaq anda. Resit rasmi dilampirkan bersama e-mel ini.",
  };

  const { error } = await supabase.from("infaq_settings").upsert({ id: 1, ...payload }, { onConflict: "id" });
  if (error) adminRedirect("ralat", error.message);

  if (existing?.qr_path && qrPath !== existing.qr_path) {
    await supabase.storage.from("infaq-assets").remove([existing.qr_path]);
  }

  revalidatePath("/admin/infaq");
  revalidatePath("/infaq");
  adminRedirect("berjaya", "Tetapan Infaq & Tahlil berjaya disimpan.");
}

export async function createManualInfaqAction(formData: FormData) {
  const admin = await requireRole(["admin"]);
  const supabase = await createClient();
  const donorName = text(formData, "donor_name");
  const phone = text(formData, "phone");
  const tahlilNames = text(formData, "tahlil_names");
  const amount = Number(text(formData, "amount").replace(/,/g, ""));

  if (!donorName || !phone || !tahlilNames) adminRedirect("ralat", "Nama, telefon dan nama tahlil diperlukan.");
  if (!Number.isFinite(amount) || amount <= 0) adminRedirect("ralat", "Jumlah infaq tidak sah.");

  const token = crypto.randomUUID();
  const proof = formData.get("payment_proof");
  let proofPath: string | null = null;

  if (proof instanceof File && proof.size > 0) {
    if (proof.size > maxFileSize) adminRedirect("ralat", "Bukti bayaran mestilah tidak melebihi 5MB.");
    if (!proofTypes.has(proof.type)) adminRedirect("ralat", "Format bukti bayaran tidak disokong.");
    proofPath = `admin/${token}/${safeFileName(proof.name, "bukti")}`;
    const { error: uploadError } = await supabase.storage
      .from("infaq-proofs")
      .upload(proofPath, proof, { contentType: proof.type, upsert: false });
    if (uploadError) adminRedirect("ralat", uploadError.message);
  }

  const { error } = await supabase.from("infaq_submissions").insert({
    public_token: token,
    source: "admin",
    donor_name: donorName,
    email: optional(formData, "email")?.toLowerCase() ?? null,
    phone,
    address: optional(formData, "address"),
    amount,
    tahlil_names: tahlilNames,
    relationship: optional(formData, "relationship"),
    purpose_note: optional(formData, "purpose_note"),
    display_publicly: formData.get("display_publicly") === "on",
    payment_method: text(formData, "payment_method") || "tunai",
    payment_proof_path: proofPath,
    payment_status: "menunggu",
    tahlil_status: "belum_dijadual",
    created_by: admin.id,
  });

  if (error) {
    if (proofPath) await supabase.storage.from("infaq-proofs").remove([proofPath]);
    adminRedirect("ralat", error.message);
  }

  revalidatePath("/admin/infaq");
  adminRedirect("berjaya", "Rekod infaq manual berjaya ditambah. Sila semak dan sahkan bayaran.");
}

export async function reviewInfaqAction(formData: FormData) {
  const admin = await requireRole(["admin"]);
  const id = text(formData, "id");
  const paymentStatus = text(formData, "payment_status") as InfaqPaymentStatus;
  const tahlilStatus = text(formData, "tahlil_status") as InfaqTahlilStatus;
  const allowedPayment: InfaqPaymentStatus[] = ["menunggu", "disahkan", "ditolak", "perlu_bukti"];
  const allowedTahlil: InfaqTahlilStatus[] = ["belum_dijadual", "dijadualkan", "selesai", "dibawa_ke_hadapan"];

  if (!id || !allowedPayment.includes(paymentStatus) || !allowedTahlil.includes(tahlilStatus)) {
    adminRedirect("ralat", "Status yang dipilih tidak sah.");
  }

  const supabase = await createClient();
  const [{ data: recordData, error: recordError }, { data: settingsData, error: settingsError }] = await Promise.all([
    supabase.from("infaq_submissions").select("*").eq("id", id).single(),
    supabase.from("infaq_settings").select("*").eq("id", 1).single(),
  ]);

  if (recordError || !recordData) adminRedirect("ralat", recordError?.message ?? "Rekod tidak ditemui.");
  if (settingsError || !settingsData) adminRedirect("ralat", settingsError?.message ?? "Tetapan infaq tidak ditemui.");

  const record = recordData as InfaqSubmission;
  const settings = settingsData as InfaqSettings;
  let receiptNo = record.receipt_no;
  const now = new Date().toISOString();

  if (paymentStatus === "disahkan" && !receiptNo) {
    const { data: generated, error: receiptError } = await supabase.rpc("next_infaq_receipt_no", {
      p_prefix: settings.receipt_prefix,
    });
    if (receiptError || !generated) adminRedirect("ralat", receiptError?.message ?? "Nombor resit gagal dijana.");
    receiptNo = String(generated);
  }

  const { data: updatedData, error: updateError } = await supabase
    .from("infaq_submissions")
    .update({
      payment_status: paymentStatus,
      tahlil_status: tahlilStatus,
      scheduled_week: optional(formData, "scheduled_week"),
      admin_note: optional(formData, "admin_note"),
      receipt_no: receiptNo,
      receipt_issued_at: paymentStatus === "disahkan" ? record.receipt_issued_at ?? now : record.receipt_issued_at,
      verified_by: paymentStatus === "disahkan" ? admin.id : record.verified_by,
      verified_at: paymentStatus === "disahkan" ? record.verified_at ?? now : record.verified_at,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (updateError || !updatedData) adminRedirect("ralat", updateError?.message ?? "Rekod gagal dikemas kini.");

  let message = "Rekod infaq berjaya dikemas kini.";
  const updated = updatedData as InfaqSubmission;
  if (paymentStatus === "disahkan" && updated.email) {
    const delivery = await deliverReceipt(supabase, settings, updated);
    message = delivery.sent
      ? "Bayaran disahkan dan resit PDF telah dihantar melalui e-mel."
      : `Bayaran disahkan, tetapi e-mel belum dihantar: ${delivery.error}`;
  }

  revalidatePath("/admin/infaq");
  revalidatePath(`/infaq/status/${updated.public_token}`);
  adminRedirect("berjaya", message);
}

export async function resendInfaqReceiptAction(formData: FormData) {
  await requireRole(["admin"]);
  const id = text(formData, "id");
  const supabase = await createClient();
  const [{ data: recordData, error: recordError }, { data: settingsData, error: settingsError }] = await Promise.all([
    supabase.from("infaq_submissions").select("*").eq("id", id).single(),
    supabase.from("infaq_settings").select("*").eq("id", 1).single(),
  ]);

  if (recordError || !recordData) adminRedirect("ralat", recordError?.message ?? "Rekod tidak ditemui.");
  if (settingsError || !settingsData) adminRedirect("ralat", settingsError?.message ?? "Tetapan tidak ditemui.");

  const result = await deliverReceipt(supabase, settingsData as InfaqSettings, recordData as InfaqSubmission);
  revalidatePath("/admin/infaq");
  adminRedirect(result.sent ? "berjaya" : "ralat", result.sent ? "Resit PDF berjaya dihantar semula." : result.error ?? "E-mel gagal dihantar.");
}
