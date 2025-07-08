import { z } from "zod";

// User role validation
export const userRoleSchema = z.enum(["CABINET", "DOCTOR"]);

// Job offer type validation
export const jobOfferTypeSchema = z.enum(["URGENT", "PLANNED", "RECURRING"]);

// Job offer status validation
export const jobOfferStatusSchema = z.enum([
  "DRAFT",
  "PUBLISHED",
  "FILLED",
  "ARCHIVED",
]);

// Application status validation
export const applicationStatusSchema = z.enum([
  "SENT",
  "VIEWED",
  "ACCEPTED",
  "REJECTED",
]);

// Availability schema
export const availabilitySchema = z.object({
  monday: z.boolean(),
  tuesday: z.boolean(),
  wednesday: z.boolean(),
  thursday: z.boolean(),
  friday: z.boolean(),
  saturday: z.boolean(),
  sunday: z.boolean(),
});

// Schedule schema
export const scheduleSchema = z.object({
  morning: z.boolean(),
  afternoon: z.boolean(),
  evening: z.boolean(),
});

// Cabinet Profile Schema
export const cabinetProfileSchema = z.object({
  cabinetName: z
    .string()
    .min(2, "Le nom du cabinet doit contenir au moins 2 caractères")
    .max(255),
  address: z.string().min(5, "L'adresse complète est obligatoire"),
  phone: z.string().regex(/^[0-9+\-\s().]+$/, "Format de téléphone invalide"),
  description: z.string().optional(),
  specialties: z
    .array(z.string())
    .min(1, "Au moins une spécialité est requise"),
  photos: z.array(z.string()).optional(),
});

// Doctor Profile Schema
export const doctorProfileSchema = z.object({
  firstName: z.string().min(2, "Le prénom est obligatoire").max(255),
  lastName: z.string().min(2, "Le nom est obligatoire").max(255),
  specialties: z
    .array(z.string())
    .min(1, "Au moins une spécialité est requise"),
  experienceYears: z.number().min(0, "L'expérience doit être positive").max(50),
  preferredLocation: z
    .string()
    .min(1, "La localisation préférée est obligatoire"),
  travelRadius: z
    .number()
    .min(1, "Le rayon de déplacement doit être d'au moins 1 km")
    .max(500),
  documents: z.array(z.string()).optional(),
  availability: availabilitySchema,
  preferredRate: z.number().min(0).optional(),
});

// Job Offer Schema - Base schema without refinement
export const jobOfferBaseSchema = z.object({
  title: z
    .string()
    .min(5, "Le titre doit contenir au moins 5 caractères")
    .max(255),
  specialty: z.string().min(1, "La spécialité est obligatoire"),
  location: z.string().min(1, "La localisation est obligatoire"),
  startDate: z.date({ required_error: "La date de début est obligatoire" }),
  endDate: z.date({ required_error: "La date de fin est obligatoire" }),
  retrocessionRate: z
    .number()
    .min(0, "Le taux de rétrocession doit être positif")
    .max(100, "Le taux ne peut pas dépasser 100%"),
  type: jobOfferTypeSchema,
  description: z.string().optional(),
  schedule: scheduleSchema.optional(),
  estimatedPatients: z.number().min(0).optional(),
  equipment: z.array(z.string()).optional(),
  housingProvided: z.boolean().default(false),
  status: jobOfferStatusSchema.default("DRAFT"),
});

// Job Offer Schema with validation
export const jobOfferSchema = jobOfferBaseSchema.refine(
  (data) => data.endDate > data.startDate,
  {
    message: "La date de fin doit être après la date de début",
    path: ["endDate"],
  }
);

// Job Offer Update Schema (for partial updates)
export const updateJobOfferSchema = jobOfferBaseSchema.partial();

// Application Schema
export const applicationSchema = z.object({
  jobOfferId: z.string().min(1, "L'ID de l'annonce est obligatoire"),
  motivationLetter: z
    .string()
    .min(10, "La lettre de motivation doit contenir au moins 10 caractères"),
  attachments: z.array(z.string()).optional(),
});

// Message Schema
export const messageSchema = z.object({
  conversationId: z.string().min(1, "L'ID de la conversation est obligatoire"),
  content: z
    .string()
    .min(1, "Le message ne peut pas être vide")
    .max(2000, "Le message ne peut pas dépasser 2000 caractères"),
  attachments: z.array(z.string()).optional(),
});

// Conversation Schema
export const conversationSchema = z.object({
  jobOfferId: z.string().min(1, "L'ID de l'annonce est obligatoire"),
  doctorId: z.string().min(1, "L'ID du médecin est obligatoire"),
});

// Search filters schema
export const searchFiltersSchema = z.object({
  specialty: z.string().optional(),
  location: z.string().optional(),
  radius: z.number().min(1).max(500).optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  minRetrocession: z.number().min(0).max(100).optional(),
  type: jobOfferTypeSchema.optional(),
  housingProvided: z.boolean().optional(),
  keywords: z.string().optional(),
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z
    .enum(["createdAt", "startDate", "retrocessionRate", "title"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Update schemas (partial versions for updates)
export const updateCabinetProfileSchema = cabinetProfileSchema.partial();
export const updateDoctorProfileSchema = doctorProfileSchema.partial();

// Export types
export type UserRole = z.infer<typeof userRoleSchema>;
export type JobOfferType = z.infer<typeof jobOfferTypeSchema>;
export type JobOfferStatus = z.infer<typeof jobOfferStatusSchema>;
export type ApplicationStatus = z.infer<typeof applicationStatusSchema>;
export type Availability = z.infer<typeof availabilitySchema>;
export type Schedule = z.infer<typeof scheduleSchema>;
export type CabinetProfile = z.infer<typeof cabinetProfileSchema>;
export type DoctorProfile = z.infer<typeof doctorProfileSchema>;
export type JobOffer = z.infer<typeof jobOfferSchema>;
export type Application = z.infer<typeof applicationSchema>;
export type Message = z.infer<typeof messageSchema>;
export type SearchFilters = z.infer<typeof searchFiltersSchema>;
export type Pagination = z.infer<typeof paginationSchema>;
