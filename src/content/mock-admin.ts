import { locales } from "@/i18n/config";
import type { ImportKind, ImportPreviewRow, AdminCourse, AdminQuestion, AdminReview } from "@/types/admin";

// Todo: Placeholder data for designing the admin; replace with database queries once the migration has run

export const mockAdminCourses: AdminCourse[] = [
  {
    code: "ground",
    names: { en: "TDG – Class 7 Ground", fr: "TMD – Classe 7, transport terrestre" },
    descriptions: {
      en: "Transportation of Dangerous Goods certification course for Class 7 radioactive materials.",
      fr: "Cours de certification en transport des marchandises dangereuses pour les matières radioactives de classe 7."
    },
    materialFiles: { en: "TDG Ground.pdf", fr: "TMD French ground.pdf" },
    certificateCodes: { en: "SQMP-2020-114", fr: "SQMP-2020-113" },
    questionCounts: { en: 41, fr: 42 },
    questionsPerAttempt: 20,
    passMarkPct: 75,
    timeLimitMinutes: 120,
    maxAttempts: 3,
    shuffleQuestions: true,
    shuffleAnswers: true,
    active: true
  },
  {
    code: "air",
    names: { en: "TDG – Class 7 Air", fr: "TMD – Classe 7, transport aérien" },
    descriptions: {
      en: "Transportation of Dangerous Goods certification course for Class 7 radioactive materials.",
      fr: "Cours de certification en transport des marchandises dangereuses pour les matières radioactives de classe 7."
    },
    materialFiles: { en: "TDG Air.pdf", fr: null },
    certificateCodes: { en: "SQMP-2020-112", fr: "SQMP-2020-111" },
    questionCounts: { en: 51, fr: 52 },
    questionsPerAttempt: 28,
    passMarkPct: 75,
    timeLimitMinutes: 120,
    maxAttempts: 3,
    shuffleQuestions: true,
    shuffleAnswers: true,
    active: true
  }
];

const questionBanks = mockAdminCourses.flatMap((course) => locales.map((locale) => ({ courseCode: course.code, locale })));

export const mockAdminQuestions: AdminQuestion[] = questionBanks.flatMap((bank, bankIndex) =>
  Array.from({ length: 8 }, (_, index) => ({
    id: (bankIndex + 1) * 100 + index + 1,
    courseCode: bank.courseCode,
    locale: bank.locale,
    sortOrder: index + 1,
    type: index % 5 === 4 ? "trueFalse" as const : "multipleChoice" as const,
    prompt: `Sample question ${index + 1}. Placeholder text for a real exam question.`,
    options: index % 5 === 4
      ? [{ text: "True", correct: true }, { text: "False", correct: false }]
      : ["A", "B", "C", "D"].map((letter, option) => ({ text: `Sample answer ${letter}`, correct: option === index % 4 })),
    explanation: "Placeholder explanation shown to admins only.",
    active: index !== 6
  }))
);

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
