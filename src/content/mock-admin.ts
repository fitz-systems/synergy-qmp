import { locales } from "@/i18n/config";
import type { AdminAttempt, AdminAttemptAnswer, ImportKind, ImportPreviewRow, AdminCourse, AdminQuestion, AdminReview, AdminUser, AuditEntry, CoursePassRate, EnrollmentStatus, MonthlyRegistrations } from "@/types/admin";

// Todo: Placeholder data for designing the admin; replace with database queries once the migration has run

const people = [
  ["Jordan", "Tremblay"], ["Priya", "Natarajan"], ["Marc", "Gagnon"], ["Aisha", "Okafor"], ["Daniel", "Kowalski"],
  ["Sophie", "Bouchard"], ["Ethan", "Li"], ["Fatima", "Haddad"], ["Lucas", "Roy"], ["Grace", "MacDonald"],
  ["Noah", "Singh"], ["Chloé", "Pelletier"], ["Omar", "Farah"], ["Hannah", "Wright"], ["Mateo", "Silva"],
  ["Isabelle", "Côté"], ["Ryan", "O'Brien"], ["Mei", "Chen"], ["Samuel", "Bergeron"], ["Leila", "Ahmadi"],
  ["Thomas", "Fortin"], ["Ava", "Thompson"], ["Gabriel", "Lavoie"], ["Nadia", "Petrova"]
];

const companies = ["Northview Health", "Lakeshore Imaging", "Centre hospitalier Rive-Sud", "Maple Radiopharmacy", "Summit Medical Physics", "Bay Street Diagnostics"];

const statuses: EnrollmentStatus[] = ["passed", "passed", "inProgress", "notStarted", "passed", "failed", "passed", "inProgress"];

export const mockAdminUsers: AdminUser[] = people.map(([firstName, lastName], index) => {
  const status = statuses[index % statuses.length];
  const locale = index % 3 === 1 ? "fr" : "en";
  const day = String(1 + (index * 3) % 27).padStart(2, "0");
  return {
    id: 1001 + index,
    firstName,
    lastName,
    email: `${firstName}.${lastName}`.toLowerCase().normalize("NFD").replace(/[^a-z.]/g, "") + "@example.com",
    company: companies[index % companies.length],
    courseCode: index % 4 === 3 ? "air" : "ground",
    locale,
    status,
    enrolledOn: `2026-${index < 12 ? "10" : "09"}-${day}`,
    passedOn: status === "passed" ? `2026-10-${String(Number(day) + 1).padStart(2, "0")}` : undefined,
    certificateNumber: status === "passed" ? `SQMP-2026-${String(400 + index).padStart(4, "0")}` : undefined,
    attemptsUsed: status === "notStarted" ? 0 : status === "failed" ? 2 : 1,
    active: index !== 9,
    notes: index === 0 ? "Employer arranged enrollment for three staff." : undefined
  }
});

export const mockAdminAttempts: AdminAttempt[] = mockAdminUsers
  .filter((user) => user.status === "passed" || user.status === "failed")
  .map((user, index) => ({
    id: 5001 + index,
    userId: user.id,
    userName: `${user.firstName} ${user.lastName}`,
    courseCode: user.courseCode,
    locale: user.locale,
    submittedAt: `2026-11-0${1 + (index % 5)}T1${index % 9}:2${index % 6}:00Z`,
    correctCount: user.status === "passed" ? 16 + (index % 5) : 12,
    questionCount: user.courseCode === "air" ? 28 : 20,
    passed: user.status === "passed"
  }));

export const mockAttemptAnswers: AdminAttemptAnswer[] = Array.from({ length: 6 }, (_, index) => ({
  question: `Sample question ${index + 1}. Placeholder text for a real exam question.`,
  answer: `Sample answer ${"ABCD"[index % 4]}`,
  correct: index !== 3
}));

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

export const mockAuditLog: AuditEntry[] = [
  { id: 1, at: "2026-11-05T14:12:00Z", admin: "Sample Admin", action: "Created user", entity: "User", entityLabel: "Jordan Tremblay", details: "Enrolled in TDG – Class 7 Ground (English)" },
  { id: 2, at: "2026-11-05T13:40:00Z", admin: "Sample Admin", action: "Reset attempts", entity: "User", entityLabel: "Sophie Bouchard", details: "Attempts reset from 2 to 0" },
  { id: 3, at: "2026-11-05T11:05:00Z", admin: "Sample Admin", action: "Edited question", entity: "Question", entityLabel: "Ground · English #12", details: "Prompt wording changed" },
  { id: 4, at: "2026-11-04T16:22:00Z", admin: "Sample Admin", action: "Published review", entity: "Review", entityLabel: "Sample reviewer A", details: "Shown on the English home page" },
  { id: 5, at: "2026-11-04T10:18:00Z", admin: "Sample Admin", action: "Imported users", entity: "Import", entityLabel: "users-november.csv", details: "14 created, 2 skipped (duplicate email)" },
  { id: 6, at: "2026-11-03T15:51:00Z", admin: "Sample Admin", action: "Reissued certificate", entity: "Certificate", entityLabel: "SQMP-2026-0404", details: "New PDF generated" },
  { id: 7, at: "2026-11-03T09:30:00Z", admin: "Sample Admin", action: "Deactivated user", entity: "User", entityLabel: "Grace MacDonald", details: "Left employer" },
  { id: 8, at: "2026-11-02T14:02:00Z", admin: "Sample Admin", action: "Updated exam settings", entity: "Course", entityLabel: "TDG – Class 7 Air", details: "Time limit changed from 90 to 120 minutes" }
];

export const mockMonthlyRegistrations: MonthlyRegistrations[] = [
  { month: "Jun", registrations: 31 },
  { month: "Jul", registrations: 24 },
  { month: "Aug", registrations: 38 },
  { month: "Sep", registrations: 52 },
  { month: "Oct", registrations: 61 },
  { month: "Nov", registrations: 19 }
];

export const mockPassRates: CoursePassRate[] = [
  { course: "Ground EN", passRate: 91 },
  { course: "Ground FR", passRate: 88 },
  { course: "Air EN", passRate: 84 },
  { course: "Air FR", passRate: 79 }
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
