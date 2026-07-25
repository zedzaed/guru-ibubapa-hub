import type { InfaqSettings, InfaqSubmission } from "@/types/database";
import { createInfaqReceiptPdf } from "@/lib/infaq/receipt-pdf";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function applyTemplate(template: string, submission: InfaqSubmission) {
  return template
    .replaceAll("{{reference_no}}", submission.reference_no)
    .replaceAll("{{receipt_no}}", submission.receipt_no ?? "")
    .replaceAll("{{donor_name}}", submission.donor_name)
    .replaceAll("{{amount}}", new Intl.NumberFormat("en-MY", { style: "currency", currency: "MYR" }).format(submission.amount));
}

export async function sendInfaqReceiptEmail(settings: InfaqSettings, submission: InfaqSubmission) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { sent: false, error: "RESEND_API_KEY belum ditetapkan di Vercel." };
  if (!settings.sender_email) return { sent: false, error: "E-mel penghantar belum diisi dalam Tetapan Infaq." };
  if (!submission.email) return { sent: false, error: "Penginfaq tidak memberikan alamat e-mel." };
  if (!submission.receipt_no) return { sent: false, error: "Nombor resit belum dijana." };

  const pdf = createInfaqReceiptPdf({
    organisationName: settings.organisation_name,
    organisationAddress: settings.organisation_address,
    organisationPhone: settings.organisation_phone,
    receiptNo: submission.receipt_no,
    referenceNo: submission.reference_no,
    donorName: submission.donor_name,
    email: submission.email,
    phone: submission.phone,
    amount: submission.amount,
    tahlilNames: submission.tahlil_names,
    paymentMethod: submission.payment_method,
    verifiedAt: submission.verified_at,
  });

  const message = applyTemplate(settings.email_body, submission);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `${settings.organisation_name} <${settings.sender_email}>`,
      to: [submission.email],
      subject: applyTemplate(settings.email_subject, submission),
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937;max-width:640px;margin:auto">
          <h2 style="color:#065f46">${escapeHtml(settings.organisation_name)}</h2>
          <p>Assalamualaikum ${escapeHtml(submission.donor_name)},</p>
          <p>${escapeHtml(message).replaceAll("\n", "<br>")}</p>
          <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:12px;padding:16px;margin:20px 0">
            <strong>No. resit:</strong> ${escapeHtml(submission.receipt_no)}<br>
            <strong>No. rujukan:</strong> ${escapeHtml(submission.reference_no)}<br>
            <strong>Jumlah:</strong> ${escapeHtml(new Intl.NumberFormat("en-MY", { style: "currency", currency: "MYR" }).format(submission.amount))}
          </div>
          <p>Resit PDF rasmi dilampirkan bersama e-mel ini.</p>
        </div>
      `,
      attachments: [
        {
          filename: `${submission.receipt_no}.pdf`,
          content: Buffer.from(pdf).toString("base64"),
        },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    return { sent: false, error: `Resend gagal (${response.status}): ${body.slice(0, 300)}` };
  }

  return { sent: true, error: null };
}
