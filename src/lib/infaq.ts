export type InfaqStatus =
  | "menunggu"
  | "perlu_bukti_baharu"
  | "ditolak"
  | "dijadualkan"
  | "selesai";

export interface InfaqSettings {
  id: number;
  organization_name: string;
  address: string | null;
  phone: string | null;
  bank_name: string | null;
  account_name: string | null;
  account_number: string | null;
  qr_image_url: string | null;
  payment_instructions: string;
  receipt_prefix: string;
  tahlil_day: number;
  tahlil_time: string;
  form_active: boolean;
  email_subject: string;
  email_body: string;
}

export interface InfaqSubmission {
  id: string;
  reference_no: string;
  source: "public" | "admin";
  donor_name: string;
  email: string;
  phone: string;
  amount: number | string;
  tahlil_names: string;
  intention: string | null;
  is_private: boolean;
  payment_date: string | null;
  proof_path: string | null;
  proof_filename: string | null;
  status: InfaqStatus;
  admin_note: string | null;
  verified_at: string | null;
  tahlil_week: string | null;
  tahlil_completed_at: string | null;
  receipt_no: string | null;
  receipt_issued_at: string | null;
  email_sent_at: string | null;
  email_error: string | null;
  created_at: string;
}

const moneyFormatter = new Intl.NumberFormat("en-MY", {
  style: "currency",
  currency: "MYR",
});

export function formatMoney(value: number | string) {
  return moneyFormatter.format(Number(value));
}

export function formatMalayDate(value: string | Date | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("ms-MY", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function getNextTahlilDate(dayOfWeek: number, from = new Date()) {
  const date = new Date(from);
  date.setHours(12, 0, 0, 0);
  const daysAhead = (dayOfWeek - date.getDay() + 7) % 7;
  date.setDate(date.getDate() + daysAhead);
  return date.toISOString().slice(0, 10);
}

function pdfSafe(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function wrapText(value: string, maxLength = 72) {
  const words = value.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxLength && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }

  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

export function buildInfaqReceiptPdf(submission: InfaqSubmission, settings: InfaqSettings) {
  const lines = [
    settings.organization_name,
    "RESIT RASMI INFAQ",
    "",
    `No. resit: ${submission.receipt_no ?? "Belum dijana"}`,
    `No. rujukan: ${submission.reference_no}`,
    `Tarikh: ${formatMalayDate(submission.receipt_issued_at ?? submission.created_at)}`,
    "",
    `Nama penginfaq: ${submission.donor_name}`,
    `E-mel: ${submission.email}`,
    `Telefon: ${submission.phone}`,
    `Jumlah infaq: ${formatMoney(submission.amount)}`,
    "",
    "Nama untuk bacaan tahlil:",
    ...wrapText(submission.tahlil_names),
    ...(submission.intention ? ["", "Hajat / catatan:", ...wrapText(submission.intention)] : []),
    "",
    `Tarikh tahlil: ${formatMalayDate(submission.tahlil_week)}`,
    "Status bayaran: Disahkan",
    "",
    "Terima kasih atas sumbangan infaq anda.",
    "Resit ini dijana secara elektronik dan tidak memerlukan tandatangan.",
    ...(settings.address ? ["", ...wrapText(settings.address)] : []),
    ...(settings.phone ? [`Tel: ${settings.phone}`] : []),
  ];

  const streamLines = lines
    .slice(0, 38)
    .map((line) => `(${pdfSafe(line)}) Tj\n0 -18 Td`)
    .join("\n");
  const stream = `BT\n/F1 12 Tf\n50 790 Td\n${streamLines}\nET`;

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(stream, "utf8")} >>\nstream\n${stream}\nendstream`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  pdf += offsets
    .slice(1)
    .map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`)
    .join("");
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, "utf8");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function sendInfaqReceiptEmail(
  submission: InfaqSubmission,
  settings: InfaqSettings,
  pdf: Buffer,
) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.INFAQ_FROM_EMAIL;

  if (!apiKey || !from) {
    return {
      ok: false as const,
      error: "RESEND_API_KEY atau INFAQ_FROM_EMAIL belum ditetapkan di Vercel.",
    };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `infaq-${submission.id}-${submission.receipt_no ?? "receipt"}`,
    },
    body: JSON.stringify({
      from,
      to: [submission.email],
      subject: settings.email_subject,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937">
          <h2 style="color:#064e3b">${escapeHtml(settings.organization_name)}</h2>
          <p>${escapeHtml(settings.email_body).replace(/\n/g, "<br>")}</p>
          <p><strong>No. resit:</strong> ${escapeHtml(submission.receipt_no ?? "-")}</p>
          <p><strong>Jumlah:</strong> ${escapeHtml(formatMoney(submission.amount))}</p>
          <p><strong>Tarikh tahlil:</strong> ${escapeHtml(formatMalayDate(submission.tahlil_week))}</p>
          <p>Resit PDF rasmi dilampirkan bersama e-mel ini.</p>
        </div>
      `,
      attachments: [
        {
          filename: `${submission.receipt_no ?? submission.reference_no}.pdf`,
          content: pdf.toString("base64"),
        },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    return { ok: false as const, error: `E-mel gagal dihantar: ${body.slice(0, 300)}` };
  }

  const data = (await response.json()) as { id?: string };
  return { ok: true as const, id: data.id ?? null };
}
