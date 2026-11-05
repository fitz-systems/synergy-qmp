import type { Locale } from "@/i18n/config";

export interface Testimonial {
  id: string;
  name: string;
  role: Record<Locale, string>;
  quote: Record<Locale, string>;
}

// Todo: Integrate testimonials with backend and replace hard coded data
const quote = {
  en: "The Synergy QMP course was easy and convenient. As a professional in the industry it is difficult to find the time to maintain such certifications, and being able to take the course online and on my own schedule is a huge benefit. Thank you, Synergy QMP!",
  fr: "Le cours de Synergy QMP était simple et pratique. En tant que professionnel de l'industrie, il est difficile de trouver le temps de maintenir ces certifications, et pouvoir suivre le cours en ligne, à mon rythme, est un énorme avantage. Merci, Synergy QMP!"
}

export const testimonials: Testimonial[] = [
  { id: "peter", name: "Peter Packer", role: { en: "Field Service Representative", fr: "Représentant du service technique" }, quote },
  { id: "manuel", name: "Manuel", role: { en: "Electronics Technologist", fr: "Technologue en électronique" }, quote },
  { id: "john", name: "John Doe", role: { en: "Material Handler", fr: "Manutentionnaire" }, quote },
  { id: "elsie", name: "Elsie", role: { en: "Research", fr: "Recherche" }, quote },
  { id: "susan", name: "Susan Jackson", role: { en: "SPECT Lab Technician", fr: "Technicienne de laboratoire TEMP" }, quote }
];
