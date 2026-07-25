export interface InfaqReceiptPdfData {
  organisationName: string;
  organisationAddress?: string | null;
  organisationPhone?: string | null;
  receiptNo: string;
  referenceNo: string;
  donorName: string;
  email?: string | null;
  phone: string;
  amount: number;
  tahlilNames: string;
  paymentMethod: string;
  verifiedAt?: string | null;
}

function pdfSafe(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[–—]/g, "-")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/\s+/g, " ")
    .trim();
}

function wrap(value: string, width = 78) {
  const words = pdfSafe(value).split(" ").filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > width && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

function formatDate(value?: string | null) {
  if (!value) return new Intl.DateTimeFormat("en-MY", { dateStyle: "long", timeZone: "Asia/Kuala_Lumpur" }).format(new Date());
  return new Intl.DateTimeFormat("en-MY", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Kuala_Lumpur",
  }).format(new Date(value));
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat("en-MY", { style: "currency", currency: "MYR" }).format(amount);
}

export function createInfaqReceiptPdf(data: InfaqReceiptPdfData) {
  const commands: string[] = ["BT", "/F1 18 Tf", "50 792 Td", `(${pdfSafe(data.organisationName)}) Tj`];

  const addLine = (text: string, size = 10, gap = 16) => {
    commands.push(`/F1 ${size} Tf`, `0 -${gap} Td`, `(${pdfSafe(text)}) Tj`);
  };

  for (const line of wrap(data.organisationAddress ?? "", 82)) addLine(line, 9, 13);
  if (data.organisationPhone) addLine(`Telefon: ${data.organisationPhone}`, 9, 13);

  addLine("RESIT RASMI INFAQ", 16, 30);
  addLine(`No. Resit: ${data.receiptNo}`, 10, 22);
  addLine(`No. Rujukan: ${data.referenceNo}`, 10, 16);
  addLine(`Tarikh disahkan: ${formatDate(data.verifiedAt)}`, 10, 16);
  addLine("------------------------------------------------------------", 10, 20);
  addLine(`Nama penginfaq: ${data.donorName}`, 10, 18);
  addLine(`Telefon: ${data.phone}`, 10, 16);
  if (data.email) addLine(`E-mel: ${data.email}`, 10, 16);
  addLine(`Kaedah bayaran: ${data.paymentMethod.toUpperCase()}`, 10, 16);
  addLine(`Jumlah infaq: ${formatAmount(data.amount)}`, 13, 24);
  addLine("Nama / hajat untuk bacaan tahlil:", 10, 24);
  for (const line of wrap(data.tahlilNames, 78)) addLine(line, 10, 15);
  addLine("------------------------------------------------------------", 10, 22);
  addLine("Terima kasih atas sumbangan infaq anda.", 10, 18);
  addLine("Resit ini dijana secara elektronik dan tidak memerlukan tandatangan.", 9, 15);
  commands.push("ET");

  const stream = commands.join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${new TextEncoder().encode(stream).length} >>\nstream\n${stream}\nendstream`,
  ];

  let output = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(new TextEncoder().encode(output).length);
    output += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = new TextEncoder().encode(output).length;
  output += `xref\n0 ${objects.length + 1}\n`;
  output += "0000000000 65535 f \n";
  for (let index = 1; index <= objects.length; index += 1) {
    output += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }
  output += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new TextEncoder().encode(output);
}
