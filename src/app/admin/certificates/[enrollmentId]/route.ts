import { adminRole } from "@/constants/auth";
import { getCertificateForEnrollment } from "@/lib/certificate";
import { renderCertificatePdf } from "@/lib/certificate-pdf";
import { certificateFileName } from "@/lib/helpers/certificate";
import { getCurrentUser } from "@/lib/session";

export async function GET(_request: Request, { params }: RouteContext<"/admin/certificates/[enrollmentId]">) {
  const admin = await getCurrentUser();
  if (admin?.role !== adminRole) return new Response("Unauthorized", { status: 401 });

  const enrollmentId = Number((await params).enrollmentId);
  const certificate = Number.isInteger(enrollmentId) && enrollmentId > 0 ? await getCertificateForEnrollment(enrollmentId) : null;
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
