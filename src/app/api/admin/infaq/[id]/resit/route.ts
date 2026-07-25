import { requireRole } from "@/lib/auth/require-role";
import { buildInfaqReceiptPdf, type InfaqSettings, type InfaqSubmission } from "@/lib/infaq";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  await requireRole(["admin"]);
  const { id } = await context.params;
  const supabase = await createClient();

  const [{ data: submission, error: submissionError }, { data: settings, error: settingsError }] = await Promise.all([
    supabase.from("infaq_submissions").select("*").eq("id", id).single(),
    supabase.from("infaq_settings").select("*").eq("id", 1).single(),
  ]);

  if (submissionError || !submission) {
    return Response.json({ error: "Rekod infaq tidak ditemui." }, { status: 404 });
  }
  if (settingsError || !settings) {
    return Response.json({ error: "Tetapan infaq tidak ditemui." }, { status: 404 });
  }
  if (!submission.receipt_no) {
    return Response.json({ error: "Resit belum dijana." }, { status: 409 });
  }

  const pdf = buildInfaqReceiptPdf(submission as InfaqSubmission, settings as InfaqSettings);
  const filename = `${submission.receipt_no.replace(/[^A-Za-z0-9_-]/g, "-")}.pdf`;

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
