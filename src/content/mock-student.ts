import type { MockStudentScenario, StudentCertificate } from "@/types/student";

// Todo: Placeholder certificate for designing the student area; replace with the enrollment's certificate once numbering is in place
const mockScenario = "notStarted" as MockStudentScenario;

export const mockCertificate: StudentCertificate | null = mockScenario !== "passed" ? null : {
  studentName: "Jordan Tremblay",
  courseCode: "ground",
  certificateNumber: "SQMP-2026-0418",
  referenceCode: "SQMP-2020-114",
  issuedOn: "2026-11-05",
  validUntil: "2029-11-05",
  credits: 1
}
