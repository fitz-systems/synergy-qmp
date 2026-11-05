import type { CourseContent } from "@/types/courses";

// Todo: Move course content to the courses / course_locales tables once the migration has run
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

const description = {
  en: "Transportation of Dangerous Goods certification course for Class 7 radioactive materials.",
  fr: "Cours de certification en transport des marchandises dangereuses pour les matières radioactives de classe 7."
}

export const courses: CourseContent[] = [
  {
    code: "ground",
    price: 99,
    lectures: 1,
    quizzes: 1,
    durationHours: 2,
    lectureMinutes: 60,
    examQuestions: 20,
    locales: {
      en: {
        title: "TDG – Class 7 Ground",
        description: description.en,
        lectureTitle: "TDG Class 7 Ground",
        outcomes: ["Become familiar with the regulations for transporting radioactive materials by ground.", ...sharedOutcomes.en]
      },
      fr: {
        title: "TMD – Classe 7, transport terrestre",
        description: description.fr,
        lectureTitle: "TMD classe 7, transport terrestre",
        outcomes: ["Maîtriser les règlements qui régissent le transport de matières radioactives par route.", ...sharedOutcomes.fr]
      }
    }
  },
  {
    code: "air",
    price: 99,
    lectures: 1,
    quizzes: 1,
    durationHours: 2,
    lectureMinutes: 60,
    examQuestions: 28,
    locales: {
      en: {
        title: "TDG – Class 7 Air",
        description: description.en,
        lectureTitle: "TDG Class 7 Air",
        outcomes: ["Become familiar with the regulations for transporting radioactive materials by air.", ...sharedOutcomes.en]
      },
      fr: {
        title: "TMD – Classe 7, transport aérien",
        description: description.fr,
        lectureTitle: "TMD classe 7, transport aérien",
        outcomes: ["Maîtriser les règlements qui régissent le transport de matières radioactives par voie aérienne.", ...sharedOutcomes.fr]
      }
    }
  }
];
