# Product

## Platform

web

## Users

- **Workers who need Class 7 TDG certification**: nuclear medicine, radiopharmacy, research and field-service staff (e.g. SPECT lab technicians, material handlers, electronics technologists) who ship, handle or receive radioactive packages in Canada and must hold a current Transportation of Dangerous Goods certificate. They study on their own schedule, often around clinical shifts.
- **Their employers / managers**, who arrange certification for staff and want confidence the training is compliant and credible.
- **Admins** at Synergy QMP, who create every student account by hand (no self-registration).

## Product Purpose

Synergy QMP is an online portal for training and certification in the Transportation of Dangerous Goods, Class 7 (radioactive materials). A student signs in, reads the course material for their course, takes the exam, and downloads a certificate. Success is a student certified quickly and correctly, and an employer who trusts the certificate.

## Positioning

Built by a team with 20+ years of clinical nuclear medicine, radiopharmacy, regulatory compliance, radiation safety and emergency management experience: TDG training from people inside the nuclear medicine community, not a general dangerous-goods vendor. Course material is certified by CAMRT / ACTRM.

## Operating Context

- Two courses × two languages: Ground (English `ground-en`, French `ground-fr`) and Air (English `air-en`, French `air-fr`).
- Student flow: login → course material (PDF) → exam → certificate (PDF).
- Enrollment is arranged through Synergy QMP; there is no public sign-up or checkout. The public site's job is to inform and route people to **contact to enroll**, plus give existing students a way to sign in.
- Fully bilingual: English and French, with locale-prefixed routes; more languages may come later.

## Capabilities and Constraints

- Next.js App Router on Vercel, Prisma 7 + Neon Postgres (`synergy` schema), Better Auth with admin-created accounts only.
- The public site keeps the **page structure and layout of the existing site** (sections, order, navigation), modernized visually. Copy is carried over from the current site; polish fixes approved 2026-11-04 (readable type sizes, brand-consistent link color, own imagery instead of theme-vendor hotlinks, correct `lang` on French pages, no cart / WooCommerce / LearnPress leftovers, fixed phone prefix).
- Exam facts shown publicly today: 2 courses, 2 certificates, 20 questions, 120 minutes.
- Undecided: self-registration and purchase (plan §4.2, currently removed); final certificate wording; whether air and ground question pools split.

## Brand Commitments

- Name: **Synergy QMP** (Quality Management Programs). Logo: "SYNERGY" + "QMP" wordmark with the yellow QMP (`assets` from the capture: `logo_synergy-qmp_reversed.png`).
- Brand yellow `#FFB606` stays the signature color.
- Typeface: **Inter** (user decision, 2026-11-04).
- Voice: professional, plain, regulatory-accurate; French copy is first-class, not an afterthought.
- Visual direction (user choice, 2026-11-04): **clean modern standard, played straight**, at the craft level of modern healthcare / medical organization sites: trustworthy, institutional, calm. No novelty concept; polish lives in precision, not gimmicks.

## Evidence on Hand

- Real copy for home, about, courses, contact and privacy pages in English and French: `../synergy-qmp-capture/capture/output/html/`.
- CAMRT / ACTRM certification logo: `../synergy-qmp-capture/capture/output/tokens/assets/CAMRT-logo-300x67.jpg`.
- **Testimonials are placeholder.** The current five quotes are identical demo text with fabricated names. The user approved reusing them as mock data for now; they must be replaced with real reviews (admin-managed) before launch and must never be presented as real.
- Contact: info@synergyqmp.com, 416 930-0607.
- Course photography from the current site is mostly Eduma theme demo stock; licensing unknown, so prefer new imagery.

## Product Principles

1. **Compliance-grade trust first.** Every claim is accurate and verifiable; nothing invented.
2. **Get people to the right door.** New visitors → contact to enroll; students → sign in. Two paths, always obvious.
3. **Bilingual by construction.** Every page and string exists in English and French, with the language switch keeping you on the same page.
4. **Familiar, then better.** Returning students recognize the site's structure; every change makes it clearer, more readable and faster.

## Accessibility & Inclusion

Target WCAG 2.2 AA: users read regulatory content on phones between shifts, so body text must be comfortably readable, contrast must pass (yellow is used as a surface or accent, never as small text on white), and every interaction must work by keyboard.
