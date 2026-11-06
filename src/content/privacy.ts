import type { Locale } from "@/i18n/config";
import type { PrivacySection } from "@/types/privacy";

// Todo: Draft written 2026-11-05 to replace the 2017 template; needs approval from the client (or their lawyer) before launch
export const privacySections: Record<Locale, PrivacySection[]> = {
  en: [
    {
      id: "who-we-are",
      title: "Who we are",
      paragraphs: [
        "Synergy QMP (Quality Management Programs) is based in Toronto, Ontario, and provides online training and certification in the Transportation of Dangerous Goods, Class 7. This policy explains what personal information synergyqmp.com collects, why we collect it, and the choices you have."
      ]
    },
    {
      id: "information-we-collect",
      title: "Information we collect",
      paragraphs: ["We only collect the information we need to train and certify you, and to answer your questions:"],
      items: [
        "Account details: your name, email address, company and the course you are enrolled in. Synergy QMP creates your account when you enroll; the site has no public sign-up.",
        "Training records: your exam attempts, answers and scores, the date you passed and your certificate number.",
        "Messages: the name, email address, subject and message you send through our contact form.",
        "Technical information: like most websites, our hosting provider records basic details of each request, such as your IP address, browser and the pages you visit, to keep the site secure and running."
      ]
    },
    {
      id: "how-we-use-it",
      title: "How we use your information",
      paragraphs: ["We use your information to:"],
      items: [
        "Give you access to your course material and exam.",
        "Score your exam and issue your certificate.",
        "Keep a record of your certification.",
        "Send you emails about your account, such as password resets.",
        "Reply to messages you send us."
      ]
    },
    {
      id: "cookies",
      title: "Cookies",
      paragraphs: [
        "We use a cookie to keep you logged in to your student account. We do not use advertising cookies or third-party tracking. You can block cookies in your browser settings, but you will not be able to log in without them."
      ]
    },
    {
      id: "sharing",
      title: "Sharing your information",
      paragraphs: [
        "We do not sell, rent or trade your personal information, and we do not use it for advertising.",
        "We share it only with the service providers that host our website, store our data and send our emails, and only so they can provide those services to us. We may also disclose information when the law requires it."
      ]
    },
    {
      id: "storage",
      title: "Where your information is stored",
      paragraphs: [
        "Our service providers may store and process your information outside Canada, including in the United States. When they do, your information may be subject to the laws of that country."
      ]
    },
    {
      id: "security",
      title: "How we protect your information",
      paragraphs: [
        "The site is served over an encrypted connection (HTTPS). Passwords are stored in a hashed form that cannot be read, even by us. Access to student records is limited to Synergy QMP staff who need it."
      ]
    },
    {
      id: "retention",
      title: "How long we keep it",
      paragraphs: [
        "We keep your account and training records for as long as we need them to confirm your certification, and as long as the law requires. Contact form messages are kept only as long as we need them to answer you."
      ]
    },
    {
      id: "your-rights",
      title: "Your rights",
      paragraphs: [
        "You can ask to see the personal information we hold about you, ask us to correct it, or ask questions about how we handle it. Email us at {email} and we will respond within 30 days."
      ]
    },
    {
      id: "changes",
      title: "Changes to this policy",
      paragraphs: [
        "If we change this policy, we will post the new version on this page and update the date at the top."
      ]
    },
    {
      id: "contact",
      title: "Contact us",
      paragraphs: [
        "If you have questions about this policy or your personal information, contact Synergy QMP in Toronto, Ontario, at {email} or {phone}."
      ]
    }
  ],
  fr: [
    {
      id: "who-we-are",
      title: "Qui sommes-nous",
      paragraphs: [
        "Synergy QMP (Quality Management Programs), établie à Toronto (Ontario), offre de la formation et de la certification en ligne pour le transport des marchandises dangereuses, classe 7. La présente politique explique quels renseignements personnels synergyqmp.com recueille, pourquoi nous les recueillons et quels choix s'offrent à vous."
      ]
    },
    {
      id: "information-we-collect",
      title: "Renseignements que nous recueillons",
      paragraphs: ["Nous recueillons uniquement les renseignements dont nous avons besoin pour vous former, vous certifier et répondre à vos questions :"],
      items: [
        "Renseignements de compte : votre nom, votre adresse courriel, votre entreprise et le cours auquel vous êtes inscrit. Synergy QMP crée votre compte au moment de votre inscription; le site n'offre pas d'inscription publique.",
        "Dossiers de formation : vos tentatives d'examen, vos réponses et vos résultats, la date de votre réussite et le numéro de votre certificat.",
        "Messages : le nom, l'adresse courriel, l'objet et le message que vous nous envoyez au moyen de notre formulaire de contact.",
        "Renseignements techniques : comme la plupart des sites Web, notre hébergeur enregistre des renseignements de base sur chaque requête, comme votre adresse IP, votre navigateur et les pages que vous consultez, afin d'assurer la sécurité et le bon fonctionnement du site."
      ]
    },
    {
      id: "how-we-use-it",
      title: "Utilisation de vos renseignements",
      paragraphs: ["Nous utilisons vos renseignements pour :"],
      items: [
        "Vous donner accès à votre matériel de cours et à votre examen.",
        "Corriger votre examen et délivrer votre certificat.",
        "Conserver un dossier de votre certification.",
        "Vous envoyer des courriels concernant votre compte, comme les réinitialisations de mot de passe.",
        "Répondre aux messages que vous nous envoyez."
      ]
    },
    {
      id: "cookies",
      title: "Témoins (cookies)",
      paragraphs: [
        "Nous utilisons un témoin pour garder votre session ouverte dans votre compte étudiant. Nous n'utilisons ni témoins publicitaires ni suivi par des tiers. Vous pouvez bloquer les témoins dans les paramètres de votre navigateur, mais vous ne pourrez alors plus vous connecter."
      ]
    },
    {
      id: "sharing",
      title: "Communication de vos renseignements",
      paragraphs: [
        "Nous ne vendons, ne louons et n'échangeons pas vos renseignements personnels, et nous ne les utilisons pas à des fins publicitaires.",
        "Nous les communiquons uniquement aux fournisseurs de services qui hébergent notre site, stockent nos données et envoient nos courriels, et seulement pour qu'ils puissent nous fournir ces services. Nous pouvons aussi communiquer des renseignements lorsque la loi l'exige."
      ]
    },
    {
      id: "storage",
      title: "Lieu de stockage de vos renseignements",
      paragraphs: [
        "Nos fournisseurs de services peuvent stocker et traiter vos renseignements à l'extérieur du Canada, notamment aux États-Unis. Le cas échéant, vos renseignements peuvent être assujettis aux lois de ce pays."
      ]
    },
    {
      id: "security",
      title: "Protection de vos renseignements",
      paragraphs: [
        "Le site utilise une connexion chiffrée (HTTPS). Les mots de passe sont stockés sous une forme hachée qui ne peut pas être lue, même par nous. L'accès aux dossiers des étudiants est limité au personnel de Synergy QMP qui en a besoin."
      ]
    },
    {
      id: "retention",
      title: "Durée de conservation",
      paragraphs: [
        "Nous conservons votre compte et vos dossiers de formation aussi longtemps que nécessaire pour confirmer votre certification et aussi longtemps que la loi l'exige. Les messages du formulaire de contact sont conservés uniquement le temps de vous répondre."
      ]
    },
    {
      id: "your-rights",
      title: "Vos droits",
      paragraphs: [
        "Vous pouvez demander à consulter les renseignements personnels que nous détenons à votre sujet, nous demander de les corriger ou poser des questions sur la façon dont nous les traitons. Écrivez-nous à {email} et nous vous répondrons dans un délai de 30 jours."
      ]
    },
    {
      id: "changes",
      title: "Modifications de la politique",
      paragraphs: [
        "Si nous modifions la présente politique, nous publierons la nouvelle version sur cette page et mettrons à jour la date indiquée en haut."
      ]
    },
    {
      id: "contact",
      title: "Nous joindre",
      paragraphs: [
        "Pour toute question sur la présente politique ou sur vos renseignements personnels, communiquez avec Synergy QMP à Toronto (Ontario), à {email} ou au {phone}."
      ]
    }
  ]
}
