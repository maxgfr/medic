// Medical specialties
export const MEDICAL_SPECIALTIES = [
  {
    id: "medecine-generale",
    name: "Médecine générale",
    category: "Généraliste",
  },
  { id: "cardiologie", name: "Cardiologie", category: "Spécialiste" },
  { id: "dermatologie", name: "Dermatologie", category: "Spécialiste" },
  { id: "gynecologie", name: "Gynécologie", category: "Spécialiste" },
  { id: "ophtalmologie", name: "Ophtalmologie", category: "Spécialiste" },
  { id: "orthopédie", name: "Orthopédie", category: "Spécialiste" },
  { id: "pediatrie", name: "Pédiatrie", category: "Spécialiste" },
  { id: "psychiatrie", name: "Psychiatrie", category: "Spécialiste" },
  { id: "radiologie", name: "Radiologie", category: "Spécialiste" },
  { id: "anesthesie", name: "Anesthésie-réanimation", category: "Spécialiste" },
  {
    id: "chirurgie-generale",
    name: "Chirurgie générale",
    category: "Chirurgien",
  },
  {
    id: "chirurgie-orthopedique",
    name: "Chirurgie orthopédique",
    category: "Chirurgien",
  },
  { id: "neurologie", name: "Neurologie", category: "Spécialiste" },
  { id: "urologie", name: "Urologie", category: "Spécialiste" },
  {
    id: "gastro-enterologie",
    name: "Gastro-entérologie",
    category: "Spécialiste",
  },
  { id: "endocrinologie", name: "Endocrinologie", category: "Spécialiste" },
  { id: "pneumologie", name: "Pneumologie", category: "Spécialiste" },
  { id: "rhumatologie", name: "Rhumatologie", category: "Spécialiste" },
  { id: "otorhinolaryngologie", name: "ORL", category: "Spécialiste" },
  { id: "medecine-interne", name: "Médecine interne", category: "Spécialiste" },
] as const;

// Job offer types
export const JOB_OFFER_TYPES = [
  {
    value: "URGENT",
    label: "Urgent",
    description: "Remplacement urgent (< 48h)",
  },
  {
    value: "PLANNED",
    label: "Planifié",
    description: "Remplacement planifié à l'avance",
  },
  {
    value: "RECURRING",
    label: "Récurrent",
    description: "Remplacement récurrent",
  },
] as const;

// Job offer statuses
export const JOB_OFFER_STATUSES = [
  { value: "DRAFT", label: "Brouillon", color: "gray" },
  { value: "PUBLISHED", label: "Publiée", color: "blue" },
  { value: "FILLED", label: "Pourvue", color: "green" },
  { value: "ARCHIVED", label: "Archivée", color: "orange" },
] as const;

// Application statuses
export const APPLICATION_STATUSES = [
  { value: "SENT", label: "Envoyée", color: "blue" },
  { value: "VIEWED", label: "Vue", color: "yellow" },
  { value: "ACCEPTED", label: "Acceptée", color: "green" },
  { value: "REJECTED", label: "Refusée", color: "red" },
] as const;

// User roles
export const USER_ROLES = [
  { value: "CABINET", label: "Cabinet médical" },
  { value: "DOCTOR", label: "Médecin remplaçant" },
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

// Time slots
export const TIME_SLOTS = [
  { key: "morning", label: "Matin" },
  { key: "afternoon", label: "Après-midi" },
  { key: "evening", label: "Soir" },
] as const;

// Pagination defaults
export const PAGINATION_DEFAULTS = {
  page: 1,
  limit: 20,
  maxLimit: 100,
} as const;

// Search defaults
export const SEARCH_DEFAULTS = {
  radius: 50, // km
  minRetrocession: 0,
  maxRetrocession: 100,
} as const;

// File upload limits
export const FILE_UPLOAD_LIMITS = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  maxFiles: 5,
  allowedTypes: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
} as const;

// Default retrocession rates by specialty
export const DEFAULT_RETROCESSION_RATES = {
  "medecine-generale": 70,
  cardiologie: 65,
  dermatologie: 60,
  gynecologie: 65,
  ophtalmologie: 55,
  orthopédie: 60,
  pediatrie: 70,
  psychiatrie: 65,
  radiologie: 50,
  anesthesie: 55,
  "chirurgie-generale": 50,
  "chirurgie-orthopedique": 45,
  neurologie: 60,
  urologie: 55,
  "gastro-enterologie": 60,
  endocrinologie: 65,
  pneumologie: 65,
  rhumatologie: 65,
  otorhinolaryngologie: 60,
  "medecine-interne": 65,
} as const;

// App metadata
export const APP_METADATA = {
  name: "Medic Remplacement",
  description: "Plateforme de mise en relation pour les remplacements médicaux",
  version: "1.0.0",
  author: "Medic Team",
} as const;

// Navigation routes
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
  CABINET: {
    DASHBOARD: "/cabinet/dashboard",
    PROFILE: "/cabinet/profile",
    JOB_OFFERS: "/cabinet/job-offers",
    APPLICATIONS: "/cabinet/applications",
    MESSAGES: "/cabinet/messages",
  },
  DOCTOR: {
    DASHBOARD: "/doctor/dashboard",
    PROFILE: "/doctor/profile",
    SEARCH: "/doctor/search",
    APPLICATIONS: "/doctor/applications",
    MESSAGES: "/doctor/messages",
  },
} as const;

// API endpoints
export const API_ENDPOINTS = {
  UPLOAD: "/api/upload",
  GEOCODE: "/api/geocode",
  RECOMMENDATIONS: "/api/recommendations",
} as const;

// Form field limits
export const FORM_LIMITS = {
  CABINET_NAME: { min: 2, max: 255 },
  TITLE: { min: 5, max: 255 },
  DESCRIPTION: { min: 10, max: 2000 },
  PHONE: { min: 10, max: 20 },
  ADDRESS: { min: 5, max: 500 },
  MOTIVATION_LETTER: { min: 10, max: 1000 },
  MESSAGE: { min: 1, max: 2000 },
  EXPERIENCE_YEARS: { min: 0, max: 50 },
  TRAVEL_RADIUS: { min: 1, max: 500 },
  RETROCESSION_RATE: { min: 0, max: 100 },
  ESTIMATED_PATIENTS: { min: 0, max: 200 },
} as const;
