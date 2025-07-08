// User roles
export const USER_ROLES = [
  {
    value: "CABINET",
    label: "Cabinet médical",
    description:
      "Je représente un cabinet médical et je souhaite publier des annonces de remplacement",
  },
  {
    value: "DOCTOR",
    label: "Médecin remplaçant",
    description:
      "Je suis médecin et je recherche des opportunités de remplacement",
  },
] as const;

// Medical specialties
export const MEDICAL_SPECIALTIES = [
  {
    id: "medecine-generale",
    name: "Médecine générale",
    category: "Médecine générale",
  },
  { id: "cardiologie", name: "Cardiologie", category: "Spécialités médicales" },
  {
    id: "dermatologie",
    name: "Dermatologie",
    category: "Spécialités médicales",
  },
  { id: "pediatrie", name: "Pédiatrie", category: "Spécialités médicales" },
  { id: "gynecologie", name: "Gynécologie", category: "Spécialités médicales" },
  {
    id: "ophtalmologie",
    name: "Ophtalmologie",
    category: "Spécialités médicales",
  },
  { id: "psychiatrie", name: "Psychiatrie", category: "Spécialités médicales" },
  { id: "radiologie", name: "Radiologie", category: "Spécialités médicales" },
  { id: "neurologie", name: "Neurologie", category: "Spécialités médicales" },
  {
    id: "gastroenterologie",
    name: "Gastroentérologie",
    category: "Spécialités médicales",
  },
  { id: "pneumologie", name: "Pneumologie", category: "Spécialités médicales" },
  {
    id: "rhumatologie",
    name: "Rhumatologie",
    category: "Spécialités médicales",
  },
  {
    id: "endocrinologie",
    name: "Endocrinologie",
    category: "Spécialités médicales",
  },
  { id: "urologie", name: "Urologie", category: "Spécialités chirurgicales" },
  { id: "orl", name: "ORL", category: "Spécialités chirurgicales" },
  {
    id: "chirurgie-generale",
    name: "Chirurgie générale",
    category: "Spécialités chirurgicales",
  },
  {
    id: "anesthesie-reanimation",
    name: "Anesthésie-Réanimation",
    category: "Spécialités médicales",
  },
  {
    id: "medecine-urgence",
    name: "Médecine d'urgence",
    category: "Spécialités médicales",
  },
  { id: "geriatrie", name: "Gériatrie", category: "Spécialités médicales" },
  {
    id: "medecine-interne",
    name: "Médecine interne",
    category: "Spécialités médicales",
  },
] as const;

// Days of the week
export const DAYS_OF_WEEK = [
  { key: "monday", label: "Lundi" },
  { key: "tuesday", label: "Mardi" },
  { key: "wednesday", label: "Mercredi" },
  { key: "thursday", label: "Jeudi" },
  { key: "friday", label: "Vendredi" },
  { key: "saturday", label: "Samedi" },
  { key: "sunday", label: "Dimanche" },
] as const;

// Routes
export const ROUTES = {
  // Public routes
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",

  // Dashboard base
  DASHBOARD: "/dashboard",
  ONBOARDING: "/onboarding",

  // Cabinet routes
  CABINET: {
    DASHBOARD: "/cabinet/dashboard",
    PROFILE: "/cabinet/profile",
    JOB_OFFERS: "/cabinet/job-offers",
    JOB_OFFERS_CREATE: "/cabinet/job-offers/create",
    APPLICATIONS: "/cabinet/applications",
    MESSAGES: "/cabinet/messages",
  },

  // Doctor routes
  DOCTOR: {
    DASHBOARD: "/doctor/dashboard",
    PROFILE: "/doctor/profile",
    SEARCH: "/doctor/job-offers",
    APPLICATIONS: "/doctor/applications",
    MESSAGES: "/doctor/messages",
  },
} as const;
