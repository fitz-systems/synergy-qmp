import type { ImportKind, ImportPreviewRow, AdminReview } from "@/types/admin";

// Todo: Placeholder data for designing the admin; replace with database queries once the migration has run

export const mockAdminReviews: AdminReview[] = [
  { id: 1, author: "Sample reviewer A", roleCompany: "Field service representative", locale: "en", body: "Placeholder review. Real, approved reviews from certified students will replace this text.", rating: 5, published: true, sortOrder: 1 },
  { id: 2, author: "Sample reviewer B", roleCompany: "SPECT lab technician", locale: "en", body: "Placeholder review. Real, approved reviews from certified students will replace this text.", rating: 4, published: false, sortOrder: 2 },
  { id: 3, author: "Exemple d'avis C", roleCompany: "Technologue en électronique", locale: "fr", body: "Avis provisoire. De vrais avis approuvés d'étudiants certifiés remplaceront ce texte.", rating: 5, published: true, sortOrder: 1 }
];

export const mockImportPreview: Record<ImportKind, ImportPreviewRow[]> = {
  users: [
    { line: 2, values: ["Alex", "Morin", "alex.morin@example.com", "Northview Health", "ground", "en"] },
    { line: 3, values: ["Julie", "Ouellet", "julie.ouellet@example.com", "Centre hospitalier Rive-Sud", "ground", "fr"] },
    { line: 4, values: ["Ben", "Carter", "jordan.tremblay@example.com", "Lakeshore Imaging", "air", "en"], problem: "Email already belongs to Jordan Tremblay" },
    { line: 5, values: ["Sara", "Nguyen", "sara.nguyen@example.com", "Maple Radiopharmacy", "air", "en"] },
    { line: 6, values: ["Pierre", "", "pierre@example.com", "Bay Street Diagnostics", "ground", "fr"], problem: "Last name is missing" }
  ],
  questions: [
    { line: 2, values: ["Sample question A", "Sample answer A", "Sample answer B", "Sample answer C", "Sample answer D", "B", "Placeholder"] },
    { line: 3, values: ["Sample question B", "True", "False", "", "", "A", "Placeholder"] },
    { line: 4, values: ["Sample question C", "Sample answer A", "Sample answer B", "", "", "E", ""], problem: "Correct answer E has no option" }
  ]
}
