"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const allowedProofTypes = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
const maxProofSize = 5 * 1024 * 1024;

function cleanFileName(name: string) {
  const extension = name.includes(".") ? `.${name.split(".").pop()?.toLowerCase()}` : "";
  return `bukti-${Date.now()}${extension.replace(/[^.a-z0-9]/g, "")}`;
}

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function fail(message: string): never {
  redirect(`/infaq?ralat=${encodeURIComponent(message)}`);
}

export async function submitPublicInfaqAction(formData: FormData) {
  const supabase = await createClient();
  const { data: settings, error: settingsError } = await supabase
    .from("infaq_settings")
    .select("enabled")
    .eq("id", 1)
    .maybeSingle();

  if (settingsError || !settings?.enabled) fail("Borang infaq sedang ditutup buat sementara waktu.");

  const donorName = text(formData, "donor_name");
  const email = text(formData, "email").toLowerCase() || null;
  const phone = text(formData, "phone");
  const address = text(formData, "address") || null;
  const tahlilNames = text(formData, "tahlil_names");
  const relationship = text(formData, "relationship") || null;
  const purposeNote = text(formData, "purpose_note") || null;
  const amount = Number(text(formData, "amount").replace(/,/g, ""));
  const displayPublicly = formData.get("display_publicly") === "on";
  const proof = formData.get("payment_proof");

  if (!donorName || !phone || !tahlilNames) fail("Sila lengkapkan nama, nombor telefon dan nama untuk bacaan tahlil.");
  if (!Number.isFinite(amount) || amount <= 0) fail("Jumlah infaq tidak sah.");
  if (!(proof instanceof File) || proof.size === 0) fail("Bukti pembayaran diperlukan.");
  if (proof.size > maxProofSize) fail("Bukti pembayaran mestilah tidak melebihi 5MB.");
  if (!allowedProofTypes.has(proof.type)) fail("Bukti pembayaran mestilah dalam format JPG, PNG, WebP atau PDF.");

  const token = crypto.randomUUID();
  const proofPath = `public/${token}/${cleanFileName(proof.name)}`;
  const { error: uploadError } = await supabase.storage
    .from("infaq-proofs")
    .upload(proofPath, proof, { contentType: proof.type, upsert: false });

  if (uploadError) fail(`Bukti pembayaran gagal dimuat naik: ${uploadError.message}`);

  const { error: insertError } = await supabase.from("infaq_submissions").insert({
    public_token: token,
    source: "public",
    donor_name: donorName,
    email,
    phone,
    address,
    amount,
    tahlil_names: tahlilNames,
    relationship,
    purpose_note: purposeNote,
    display_publicly: displayPublicly,
    payment_method: "qr",
    payment_proof_path: proofPath,
    payment_status: "menunggu",
    tahlil_status: "belum_dijadual",
  });

  if (insertError) {
    await supabase.storage.from("infaq-proofs").remove([proofPath]);
    fail(`Permohonan infaq gagal disimpan: ${insertError.message}`);
  }

  redirect(`/infaq/status/${token}?baru=1`);
}
