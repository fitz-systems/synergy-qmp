import { getCertificateForUser } from "@/lib/certificate";
import { renderCertificatePdf } from "@/lib/certificate-pdf";
import { certificateFileName } from "@/lib/helpers/certificate";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const certificate = await getCertificateForUser(user);
  if (!certificate) return new Response("No certificate", { status: 404 });

  const pdf = await renderCertificatePdf(certificate);
  return new Response(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${certificateFileName(certificate)}"`,
      "Cache-Control": "private, no-store"
    }
  });
}
