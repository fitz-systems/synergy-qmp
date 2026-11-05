export const routes = {
  home: "",
  about: "/about",
  courses: "/courses",
  contact: "/contact",
  privacy: "/privacy-policy",
  login: "/login"
} as const;

export type Route = keyof typeof routes;

export const headerLinks: Route[] = ["home", "about", "courses", "contact"];

export const footerLinks: Route[] = ["home", "about", "courses", "contact", "privacy"];
