import { createInfaqReceiptPdf } from "@/lib/infaq/receipt-pdf";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type ReceiptRow = {
  reference_no: string;
  receipt_no: string;
  donor_name: string;
  email: string | null;
  phone: string;
  amount: number;
  tahlil_names: string;
  payment_method: string;
  verified_at: string | null;
  organisation_name: string;
  organisation_address: string | null;
  organisation_phone: string | null;
};

export async function GET(_request: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_infaq_receipt", { p_token: token });
  const receipt = (Array.isArray(data) ? data[0] : data) as ReceiptRow | undefined;

  if (error || !receipt) {
    return new Response("Resit tidak dijumpai atau bayaran belum disahkan.", { status: 404 });
  }

  const pdf = createInfaqReceiptPdf({
    organisationName: receipt.organisation_name,
    organisationAddress: receipt.organisation_address,
    organisationPhone: receipt.organisation_phone,
    receiptNo: receipt.receipt_no,
    referenceNo: receipt.reference_no,
    donorName: receipt.donor_name,
    email: receipt.email,
    phone: receipt.phone,
    amount: Number(receipt.amount),
    tahlilNames: receipt.tahlil_names,
    paymentMethod: receipt.payment_method,
    verifiedAt: receipt.verified_at,
  });

  return new Response(Buffer.from(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${receipt.receipt_no}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
