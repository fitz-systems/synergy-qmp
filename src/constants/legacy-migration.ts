import type { CourseCode } from "@/types/courses";
import type { CourseCopy, LegacyCourseRef, LegacyQuestionSource } from "@/types/legacy-migration";

export const legacyCourses: Record<string, LegacyCourseRef> = {
  "ground-en": { code: "ground", locale: "en" },
  "ground-fr": { code: "ground", locale: "fr" },
  "air-en": { code: "air", locale: "en" },
  "air-fr": { code: "air", locale: "fr" }
}

export const legacyQuestionCategories: Record<string, LegacyQuestionSource> = {
  "ground-en": { code: "ground", locale: "en", airOnly: false },
  "air-en": { code: "air", locale: "en", airOnly: true },
  "route-fr": { code: "ground", locale: "fr", airOnly: false },
  "avion-fr": { code: "air", locale: "fr", airOnly: true }
}

export const legacyQuestionOptionCount = 4;

export const trueFalseOptions = new Set(["true", "false", "t", "f", "vrai", "faux", "v"]);

export const legacyQuestionsPerAttempt = {
  ground: 20,
  air: 28
}

export const legacyCertificateValidMonths = {
  ground: 36,
  air: 24
}

export const legacyPassMarkPct = 75;

export const legacyAttemptWindowMinutes = 120;

export const legacyAttemptGapSeconds = 2;

export const legacyAccountProvider = "credential";

export const legacyMd5Pattern = /^[a-f0-9]{32}$/i;

export const mojibakePattern = /[ÃÂ][\u0080-¿ŒœŠšŸŽžƒˆ˜–-…‰‹›€™]/;

export const windows1252Extras: Record<number, string> = {
  0x80: "€", 0x82: "‚", 0x83: "ƒ", 0x84: "„", 0x85: "…", 0x86: "†", 0x87: "‡", 0x88: "ˆ", 0x89: "‰", 0x8a: "Š", 0x8b: "‹", 0x8c: "Œ", 0x8e: "Ž",
  0x91: "‘", 0x92: "’", 0x93: "“", 0x94: "”", 0x95: "•", 0x96: "–", 0x97: "—", 0x98: "˜", 0x99: "™", 0x9a: "š", 0x9b: "›", 0x9c: "œ", 0x9e: "ž", 0x9f: "Ÿ"
}

export const htmlEntities: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: "\"",
  apos: "'",
  nbsp: " ",
  micro: "µ",
  deg: "°",
  sup2: "²",
  sup3: "³",
  times: "×",
  plusmn: "±",
  laquo: "«",
  raquo: "»",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
  ndash: "–",
  mdash: "—",
  hellip: "…",
  agrave: "à",
  acirc: "â",
  ccedil: "ç",
  eacute: "é",
  egrave: "è",
  ecirc: "ê",
  euml: "ë",
  icirc: "î",
  iuml: "ï",
  ocirc: "ô",
  ugrave: "ù",
  ucirc: "û",
  uuml: "ü",
  Agrave: "À",
  Acirc: "Â",
  Ccedil: "Ç",
  Eacute: "É",
  Egrave: "È",
  Ecirc: "Ê",
  Icirc: "Î",
  Ocirc: "Ô",
  Ugrave: "Ù"
}

const sharedOutcomes = {
  en: [
    "Understand the classification of dangerous goods.",
    "Choose the proper packaging for the transportation of Class 7 packages.",
    "Assign safety marks to radioactive packages.",
    "Apply the standard procedures for shipping, handling and receiving radioactive packages.",
    "React appropriately in case of emergency."
  ],
  fr: [
    "Comprendre la classification des matières dangereuses.",
    "Choisir l'emballage approprié pour le transport de matières de classe 7.",
    "Apposer les signes d'avertissement nécessaires sur les colis radioactifs.",
    "Suivre les procédures concernant la réception, la manutention et l'envoi de colis radioactifs.",
    "Suivre les procédures en cas de situation d'urgence."
  ]
}

const sharedDescription = {
  en: "Transportation of Dangerous Goods certification course for Class 7 radioactive materials.",
  fr: "Cours de certification en transport des marchandises dangereuses pour les matières radioactives de classe 7."
}

export const legacyCourseCopy: Record<CourseCode, CourseCopy> = {
  ground: {
    priceCents: 9900,
    durationHours: 2,
    lectureMinutes: 60,
    locales: {
      en: {
        name: "TDG – Class 7 Ground",
        description: sharedDescription.en,
        lectureTitle: "TDG Class 7 Ground",
        outcomes: ["Become familiar with the regulations for transporting radioactive materials by ground.", ...sharedOutcomes.en]
      },
      fr: {
        name: "TMD – Classe 7, transport terrestre",
        description: sharedDescription.fr,
        lectureTitle: "TMD classe 7, transport terrestre",
        outcomes: ["Maîtriser les règlements qui régissent le transport de matières radioactives par route.", ...sharedOutcomes.fr]
      }
    }
  },
  air: {
    priceCents: 9900,
    durationHours: 2,
    lectureMinutes: 60,
    locales: {
      en: {
        name: "TDG – Class 7 Air",
        description: sharedDescription.en,
        lectureTitle: "TDG Class 7 Air",
        outcomes: ["Become familiar with the regulations for transporting radioactive materials by air.", ...sharedOutcomes.en]
      },
      fr: {
        name: "TMD – Classe 7, transport aérien",
        description: sharedDescription.fr,
        lectureTitle: "TMD classe 7, transport aérien",
        outcomes: ["Maîtriser les règlements qui régissent le transport de matières radioactives par voie aérienne.", ...sharedOutcomes.fr]
      }
    }
  }
}
