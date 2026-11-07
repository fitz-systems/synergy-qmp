import type { LegacyRedirect } from "../types/navigation.ts";
import { routes, type Route } from "./routes.ts";

const en = (route: Route) => `/en${routes[route]}`;

const fr = (route: Route) => `/fr${routes[route]}`;

export const legacyRedirects: LegacyRedirect[] = [
  { source: "/home.php", destination: en("home") },
  { source: "/home-fr.php", destination: fr("home") },
  { source: "/home-fr", destination: fr("home") },
  { source: "/about-us.php", destination: en("about") },
  { source: "/about-us", destination: en("about") },
  { source: "/courses.php", destination: en("courses") },
  { source: "/courses-fr.php", destination: fr("courses") },
  { source: "/course-category/:path*", destination: en("courses") },
  { source: "/course/tmd-cours-en-transport-de-marchandises-dangereuses-francais", destination: fr("courses") },
  { source: "/course/:path*", destination: en("courses") },
  { source: "/contact.php", destination: en("contact") },
  { source: "/contact-fr.php", destination: fr("contact") },
  { source: "/privacy-policy.php", destination: en("privacy") },
  { source: "/account", has: [{ type: "query", key: "action", value: "lostpassword" }], destination: en("forgotPassword") },
  { source: "/account", has: [{ type: "query", key: "action", value: "register" }], destination: en("contact") },
  { source: "/account", destination: en("login") },
  { source: "/wp-login.php", destination: en("login") },
  { source: "/login.php", destination: en("login") },
  { source: "/logout.php", destination: en("home") },
  { source: "/password-reset.php", destination: en("forgotPassword") },
  { source: "/profile/:path*", destination: en("myCourse") },
  { source: "/my-course.php", destination: en("myCourse") },
  { source: "/exam.php", destination: en("exam") },
  { source: "/certificate.php", destination: en("certificate") },
  { source: "/course-content/:path*", destination: en("myCourse") },
  { source: "/admin/index.php", destination: "/admin" },
  { source: "/admin/home.php", destination: "/admin" },
  { source: "/admin/users.php", destination: "/admin/users" },
  { source: "/admin/user.php", destination: "/admin/users" },
  { source: "/admin/user-new.php", destination: "/admin/users/new" },
  { source: "/admin/questions.php", destination: "/admin/courses" },
  { source: "/admin/questions-update.php", destination: "/admin/courses" },
  { source: "/admin/rceem.php", destination: "/admin/courses" }
];
