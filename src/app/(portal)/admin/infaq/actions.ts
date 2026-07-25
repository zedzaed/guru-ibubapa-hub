"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/require-role";
import {
  buildInfaqReceiptPdf,
  sendInfaqReceiptEmail,
  type InfaqSettings,
  type InfaqSubmission,
} from "@/lib/infaq";
import { createClient } from "@/lib/supabase/server";

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const allowedProofTypes = new Set([...allowedImageTypes, "application/pdf"]);

function go(type: "berjaya" | "ralat", message: string): never {
  redirect(`/admin/infaq?${type}=${encodeURIComponent(message)}`);
}

function text(formData: FormData, key: string, label: string) {
  const value = String(formData.get(key) ?? "").trim();
  if (!value) go("ralat", `${label} diperlukan.`);
  return value;
}

function optional(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim() || null;
}

function extension(file: File) {
  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (ext) return ext;
  if (file.type === "application/pdf") return "pdf";
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}

function referenceNumber() {
  const now = new Date();
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  return `INF-${date}-${randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase()}`;
}

async function sendReceipt(submissionId: string) {
  const supabase = await createClient();
  const [{ data: submission, error: submissionError }, { data: settings, error: settingsError }] = await Promise.all([
    supabase.from("infaq_submissions").select("*").eq("id", submissionId).single(),
    supabase.from("infaq_settings").select("*").eq("id", 1).single(),
  ]);

  if (submissionError || !submission) return { ok: false as const, error: submissionError?.message ?? "Rekod infaq tidak ditemui." };
  if (settingsError || !settings) return { ok: false as const, error: settingsError?.message ?? "Tetapan infaq tidak ditemui." };
  if (!submission.receipt_no) return { ok: false as const, error: "Nombor resit belum dijana." };

  const pdf = buildInfaqReceiptPdf(submission as InfaqSubmission, settings as InfaqSettings);
  const result = await sendInfaqReceiptEmail(submission as InfaqSubmission, settings as InfaqSettings, pdf);

  if (result.ok) {
    await supabase
      .from("infaq_submissions")
      .update({ email_sent_at: new Date().toISOString(), email_error: null })
      .eq("id", submissionId);
  } else {
    await supabase.from("infaq_submissions").update({ email_error: result.error }).eq("id", submissionId);
  }

  return result;
}

export async function saveInfaqSettingsAction(formData: FormData) {
  await requireRole(["admin"]);
  const supabase = await createClient();
  const tahlilDay = Number(text(formData, "tahlil_day", "Hari tahlil"));
  const qrFile = formData.get("qr_file");

  if (!Number.isInteger(tahlilDay) || tahlilDay < 0 || tahlilDay > 6) {
    go("ralat", "Hari tahlil tidak sah.");
  }

  let qrImageUrl = optional(formData, "existing_qr_url");

  if (qrFile instanceof File && qrFile.size > 0) {
    if (!allowedImageTypes.has(qrFile.type)) go("ralat", "QR mesti dalam format JPG, PNG atau WEBP.");
    if (qrFile.size > 5 * 1024 * 1024) go("ralat", "Saiz gambar QR tidak boleh melebihi 5MB.");

    const path = `qr/qr-${Date.now()}.${extension(qrFile)}`;
    const { error: uploadError } = await supabase.storage.from("infaq-assets").upload(path, qrFile, {
      contentType: qrFile.type,
      cacheControl: "3600",
      upsert: false,
    });
    if (uploadError) go("ralat", `Gambar QR gagal dimuat naik: ${uploadError.message}`);
    qrImageUrl = supabase.storage.from("infaq-assets").getPublicUrl(path).data.publicUrl;
  }

  const payload = {
    id: 1,
    organization_name: text(formData, "organization_name", "Nama organisasi"),
    address: optional(formData, "address"),
    phone: optional(formData, "phone"),
    bank_name: optional(formData, "bank_name"),
    account_name: optional(formData, "account_name"),
    account_number: optional(formData, "account_number"),
    qr_image_url: qrImageUrl,
    payment_instructions: text(formData, "payment_instructions", "Arahan pembayaran"),
    receipt_prefix: text(formData, "receipt_prefix", "Awalan resit").toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 12),
    tahlil_day: tahlilDay,
    tahlil_time: text(formData, "tahlil_time", "Waktu tahlil"),
    form_active: formData.get("form_active") === "on",
    email_subject: text(formData, "email_subject", "Subjek e-mel"),
    email_body: text(formData, "email_body", "Teks e-mel"),
  };

  if (!payload.receipt_prefix) go("ralat", "Awalan resit tidak sah.");

  const { error } = await supabase.from("infaq_settings").upsert(payload, { onConflict: "id" });
  if (error) go("ralat", error.message);

  revalidatePath("/infaq");
  revalidatePath("/admin/infaq");
  go("berjaya", "Tetapan infaq berjaya dikemas kini.");
}

export async function createManualInfaqAction(formData: FormData) {
  await requireRole(["admin"]);
  const supabase = await createClient();
  const amount = Number(text(formData, "amount", "Jumlah infaq"));
  const proof = formData.get("proof");

  if (!Number.isFinite(amount) || amount <= 0) go("ralat", "Jumlah infaq tidak sah.");

  let proofPath: string | null = null;
  let proofFilename: string | null = null;

  if (proof instanceof File && proof.size > 0) {
    if (!allowedProofTypes.has(proof.type)) go("ralat", "Bukti bayaran mesti JPG, PNG, WEBP atau PDF.");
    if (proof.size > 10 * 1024 * 1024) go("ralat", "Saiz bukti bayaran tidak boleh melebihi 10MB.");
    proofPath = `admin/${randomUUID()}/bukti.${extension(proof)}`;
    proofFilename = proof.name;
    const { error: uploadError } = await supabase.storage.from("infaq-proofs").upload(proofPath, proof, {
      contentType: proof.type,
      cacheControl: "3600",
      upsert: false,
    });
    if (uploadError) go("ralat", `Bukti bayaran gagal dimuat naik: ${uploadError.message}`);
  }

  const { error } = await supabase.from("infaq_submissions").insert({
    reference_no: referenceNumber(),
    source: "admin",
    donor_name: text(formData, "donor_name", "Nama penginfaq"),
    email: text(formData, "email", "E-mel").toLowerCase(),
    phone: text(formData, "phone", "Nombor telefon"),
    amount,
    tahlil_names: text(formData, "tahlil_names", "Nama tahlil"),
    intention: optional(formData, "intention"),
    is_private: formData.get("is_private") === "on",
    payment_date: optional(formData, "payment_date"),
    proof_path: proofPath,
    proof_filename: proofFilename,
    status: "menunggu",
  });

  if (error) {
    if (proofPath) await supabase.storage.from("infaq-proofs").remove([proofPath]);
    go("ralat", error.message);
  }

  revalidatePath("/admin/infaq");
  go("berjaya", "Rekod infaq manual berjaya ditambah.");
}

export async function approveInfaqAction(formData: FormData) {
  await requireRole(["admin"]);
  const submissionId = text(formData, "submission_id", "ID infaq");
  const tahlilWeek = text(formData, "tahlil_week", "Tarikh tahlil");
  const adminNote = optional(formData, "admin_note");
  const supabase = await createClient();

  const { error } = await supabase.rpc("approve_infaq", {
    p_submission_id: submissionId,
    p_tahlil_week: tahlilWeek,
    p_admin_note: adminNote,
  });

  if (error) go("ralat", `Bayaran gagal disahkan: ${error.message}`);

  const emailResult = await sendReceipt(submissionId);
  revalidatePath("/admin/infaq");

  if (!emailResult.ok) {
    go("berjaya", `Bayaran disahkan dan resit dijana. E-mel belum dihantar: ${emailResult.error}`);
  }

  go("berjaya", "Bayaran disahkan, nama dijadualkan dan resit PDF dihantar melalui e-mel.");
}

export async function updateInfaqStatusAction(formData: FormData) {
  await requireRole(["admin"]);
  const submissionId = text(formData, "submission_id", "ID infaq");
  const status = text(formData, "status", "Status");
  const adminNote = optional(formData, "admin_note");

  if (!["menunggu", "perlu_bukti_baharu", "ditolak"].includes(status)) {
    go("ralat", "Status tidak sah.");
  }
  if (["perlu_bukti_baharu", "ditolak"].includes(status) && !adminNote) {
    go("ralat", "Catatan admin diperlukan untuk status ini.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("infaq_submissions")
    .update({ status, admin_note: adminNote })
    .eq("id", submissionId);
  if (error) go("ralat", error.message);

  revalidatePath("/admin/infaq");
  go("berjaya", "Status infaq berjaya dikemas kini.");
}

export async function completeTahlilAction(formData: FormData) {
  await requireRole(["admin"]);
  const submissionId = text(formData, "submission_id", "ID infaq");
  const supabase = await createClient();
  const { error } = await supabase
    .from("infaq_submissions")
    .update({ status: "selesai", tahlil_completed_at: new Date().toISOString() })
    .eq("id", submissionId);
  if (error) go("ralat", error.message);

  revalidatePath("/admin/infaq");
  go("berjaya", "Bacaan tahlil ditandakan selesai.");
}

export async function resendInfaqReceiptAction(formData: FormData) {
  await requireRole(["admin"]);
  const submissionId = text(formData, "submission_id", "ID infaq");
  const result = await sendReceipt(submissionId);
  revalidatePath("/admin/infaq");

  if (!result.ok) go("ralat", result.error);
  go("berjaya", "Resit PDF berjaya dihantar semula melalui e-mel.");
}
