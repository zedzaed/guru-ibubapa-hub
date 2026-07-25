"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const allowedProofTypes = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
const maxProofSize = 10 * 1024 * 1024;

function fail(message: string): never {
  redirect(`/infaq?ralat=${encodeURIComponent(message)}`);
}

function required(formData: FormData, key: string, label: string) {
  const value = String(formData.get(key) ?? "").trim();
  if (!value) fail(`${label} diperlukan.`);
  return value;
}

function fileExtension(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (fromName) return fromName;
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

export async function submitInfaqAction(formData: FormData) {
  const supabase = await createClient();
  const { data: settings, error: settingsError } = await supabase
    .from("infaq_settings")
    .select("form_active")
    .eq("id", 1)
    .single();

  if (settingsError || !settings?.form_active) {
    fail("Borang infaq sedang ditutup. Sila hubungi pihak madrasah.");
  }

  const donorName = required(formData, "donor_name", "Nama penuh");
  const email = required(formData, "email", "E-mel").toLowerCase();
  const phone = required(formData, "phone", "Nombor telefon");
  const tahlilNames = required(formData, "tahlil_names", "Nama untuk bacaan tahlil");
  const amount = Number(required(formData, "amount", "Jumlah infaq"));
  const paymentDate = required(formData, "payment_date", "Tarikh pembayaran");
  const intention = String(formData.get("intention") ?? "").trim() || null;
  const isPrivate = formData.get("is_private") === "on";
  const proof = formData.get("proof");

  if (!/^\S+@\S+\.\S+$/.test(email)) fail("Alamat e-mel tidak sah.");
  if (!Number.isFinite(amount) || amount <= 0) fail("Jumlah infaq tidak sah.");
  if (!(proof instanceof File) || proof.size === 0) fail("Bukti pembayaran diperlukan.");
  if (!allowedProofTypes.has(proof.type)) fail("Bukti bayaran mesti dalam format JPG, PNG, WEBP atau PDF.");
  if (proof.size > maxProofSize) fail("Saiz bukti bayaran tidak boleh melebihi 10MB.");

  const referenceNo = referenceNumber();
  const proofPath = `public/${randomUUID()}/bukti.${fileExtension(proof)}`;
  const { error: uploadError } = await supabase.storage.from("infaq-proofs").upload(proofPath, proof, {
    contentType: proof.type,
    cacheControl: "3600",
    upsert: false,
  });

  if (uploadError) fail(`Bukti bayaran gagal dimuat naik: ${uploadError.message}`);

  const { error: insertError } = await supabase.from("infaq_submissions").insert({
    reference_no: referenceNo,
    source: "public",
    donor_name: donorName,
    email,
    phone,
    amount,
    tahlil_names: tahlilNames,
    intention,
    is_private: isPrivate,
    payment_date: paymentDate,
    proof_path: proofPath,
    proof_filename: proof.name,
    status: "menunggu",
  });

  if (insertError) {
    await supabase.storage.from("infaq-proofs").remove([proofPath]);
    fail(`Permohonan infaq gagal dihantar: ${insertError.message}`);
  }

  redirect(`/infaq/berjaya?rujukan=${encodeURIComponent(referenceNo)}`);
}
