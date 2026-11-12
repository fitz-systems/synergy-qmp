export const routes = {
  home: "",
  about: "/about",
  courses: "/courses",
  contact: "/contact",
  privacy: "/privacy-policy",
  login: "/login",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  myCourse: "/my-course",
  exam: "/my-course/exam",
  examResults: "/my-course/exam/results",
  certificate: "/my-course/certificate"
} as const;

export type Route = keyof typeof routes;

export const headerLinks: Route[] = ["home", "about", "courses", "contact"];

export const footerLinks: Route[] = ["home", "about", "courses", "contact", "privacy"];

export const unlocalizedSegments = ["admin"];

export const adminLoginPath = "/admin/login";
