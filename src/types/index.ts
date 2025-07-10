import type {
	applications,
	cabinetProfiles,
	conversations,
	doctorProfiles,
	jobOffers,
	messages,
	specialties,
	users,
} from "~/server/db/schema";

// Database types (inferred from schema)
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type CabinetProfile = typeof cabinetProfiles.$inferSelect;
export type NewCabinetProfile = typeof cabinetProfiles.$inferInsert;

export type DoctorProfile = typeof doctorProfiles.$inferSelect;
export type NewDoctorProfile = typeof doctorProfiles.$inferInsert;

export type JobOffer = typeof jobOffers.$inferSelect;
export type NewJobOffer = typeof jobOffers.$inferInsert;

export type Application = typeof applications.$inferSelect;
export type NewApplication = typeof applications.$inferInsert;

export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;

export type Specialty = typeof specialties.$inferSelect;
export type NewSpecialty = typeof specialties.$inferInsert;

// Extended types with relations
export type UserWithProfile = User & {
	cabinetProfile?: CabinetProfile;
	doctorProfile?: DoctorProfile;
};

export type CabinetProfileWithUser = CabinetProfile & {
	user: User;
};

export type DoctorProfileWithUser = DoctorProfile & {
	user: User;
};

export type JobOfferWithCabinet = JobOffer & {
	cabinet: CabinetProfileWithUser;
};

export type JobOfferWithDetails = JobOffer & {
	cabinet: CabinetProfileWithUser;
	_count: {
		applications: number;
		conversations: number;
	};
};

export type ApplicationWithDetails = Application & {
	jobOffer: JobOfferWithCabinet;
	doctor: DoctorProfileWithUser;
};

export type ConversationWithDetails = Conversation & {
	jobOffer: JobOfferWithCabinet;
	cabinet: CabinetProfileWithUser;
	doctor: DoctorProfileWithUser;
	messages: Message[];
	_count: {
		messages: number;
	};
};

export type MessageWithSender = Message & {
	sender: User;
};

// API Response types
export type ApiResponse<T> = {
	data: T;
	success: boolean;
	message?: string;
};

export type PaginatedResponse<T> = {
	data: T[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		pages: number;
		hasNext: boolean;
		hasPrev: boolean;
	};
	success: boolean;
	message?: string;
};

// Form data types
export type CabinetProfileFormData = {
	cabinetName: string;
	address: string;
	phone: string;
	description?: string;
	specialties: MedicalSpecialty[];
	photos?: string[];
};

// Types pour les localisations préférées
export type PreferredLocation = {
	name: string;
	latitude?: number;
	longitude?: number;
	travelRadius: number; // en kilomètres
	priority: number; // 1 = priorité haute, 2 = moyenne, 3 = basse
};

// Types pour les disponibilités
export type GeneralAvailability = {
	monday: boolean;
	tuesday: boolean;
	wednesday: boolean;
	thursday: boolean;
	friday: boolean;
	saturday: boolean;
	sunday: boolean;
};

export type SpecificAvailability = {
	id: string;
	startDate: Date;
	endDate: Date;
	days: GeneralAvailability;
	description?: string;
};

export type DoctorProfileFormData = {
	firstName: string;
	lastName: string;
	specialties: MedicalSpecialty[];
	experienceYears: number;
	preferredLocations: PreferredLocation[];
	documents?: string[];
	generalAvailability: GeneralAvailability;
	specificAvailabilities?: SpecificAvailability[];
	preferredRate?: number;
};

// Spécialités médicales prédéfinies
export type MedicalSpecialty =
	| "MEDECINE_GENERALE"
	| "CARDIOLOGIE"
	| "DERMATOLOGIE"
	| "ENDOCRINOLOGIE"
	| "GASTRO_ENTEROLOGIE"
	| "GERIATRIE"
	| "GYNECOLOGIE"
	| "HEMATOLOGIE"
	| "NEPHROLOGIE"
	| "NEUROLOGIE"
	| "OPHTALMOLOGIE"
	| "ORL"
	| "ORTHOPEDYE"
	| "PEDIATRIE"
	| "PNEUMOLOGIE"
	| "PSYCHIATRIE"
	| "RADIOLOGIE"
	| "RHUMATOLOGIE"
	| "UROLOGIE"
	| "ANESTHESIE"
	| "CHIRURGIE_GENERALE"
	| "CHIRURGIE_ORTHOPEDIQUE"
	| "CHIRURGIE_VASCULAIRE"
	| "MEDECINE_URGENCE"
	| "MEDECINE_INTERNE"
	| "ONCOLOGIE"
	| "ADDICTOLOGIE"
	| "MEDECINE_TRAVAIL"
	| "MEDECINE_SPORT";

export type JobOfferFormData = {
	title: string;
	specialty: MedicalSpecialty;
	location: string;
	startDate: Date;
	endDate: Date;
	retrocessionRate: number;
	type: "URGENT" | "PLANNED" | "RECURRING";
	description?: string;
	schedule?: {
		morning: boolean;
		afternoon: boolean;
		evening: boolean;
	};
	estimatedPatients?: number;
	equipment?: string[];
	housingProvided: boolean;
};

export type ApplicationFormData = {
	jobOfferId: string;
	motivationLetter: string;
	attachments?: string[];
};

export type MessageFormData = {
	conversationId: string;
	content: string;
	attachments?: string[];
};

// Search and filter types
export type SearchFilters = {
	specialty?: string;
	location?: string;
	radius?: number;
	startDate?: Date;
	endDate?: Date;
	minRetrocession?: number;
	type?: "URGENT" | "PLANNED" | "RECURRING";
	housingProvided?: boolean;
	keywords?: string;
};

export type SortOption = {
	field: "createdAt" | "startDate" | "retrocessionRate" | "title";
	direction: "asc" | "desc";
};

export type PaginationParams = {
	page: number;
	limit: number;
	sortBy?: SortOption["field"];
	sortOrder?: SortOption["direction"];
};

// Dashboard statistics types
export type CabinetDashboardStats = {
	totalJobOffers: number;
	activeJobOffers: number;
	totalApplications: number;
	pendingApplications: number;
	filledPositions: number;
	avgResponseTime: number; // in hours
	popularSpecialties: Array<{
		specialty: string;
		count: number;
	}>;
	recentApplications: ApplicationWithDetails[];
	recentMessages: MessageWithSender[];
};

export type DoctorDashboardStats = {
	totalApplications: number;
	pendingApplications: number;
	acceptedApplications: number;
	rejectedApplications: number;
	avgResponseTime: number; // in hours
	matchingJobOffers: number;
	recentJobOffers: JobOfferWithCabinet[];
	recentMessages: MessageWithSender[];
	profileCompleteness: number; // percentage
};

// Notification types
export type NotificationType =
	| "NEW_JOB_OFFER"
	| "NEW_APPLICATION"
	| "APPLICATION_VIEWED"
	| "APPLICATION_ACCEPTED"
	| "APPLICATION_REJECTED"
	| "NEW_MESSAGE"
	| "JOB_OFFER_FILLED"
	| "PROFILE_INCOMPLETE";

export type Notification = {
	id: string;
	type: NotificationType;
	title: string;
	message: string;
	read: boolean;
	createdAt: Date;
	data?: Record<string, unknown>;
};

// File upload types
export type FileUpload = {
	file: File;
	progress: number;
	status: "pending" | "uploading" | "completed" | "error";
	url?: string;
	error?: string;
};

// Geolocation types
export type LocationCoordinates = {
	latitude: number;
	longitude: number;
};

export type GeocodingResult = {
	address: string;
	coordinates: LocationCoordinates;
	formattedAddress: string;
	city: string;
	region: string;
	country: string;
	postalCode: string;
};

// Error types
export type AppError = {
	code: string;
	message: string;
	field?: string;
	details?: Record<string, unknown>;
};

export type ValidationError = {
	field: string;
	message: string;
	value?: unknown;
};

// UI State types
export type LoadingState = "idle" | "loading" | "succeeded" | "failed";

export type ModalState = {
	isOpen: boolean;
	data?: unknown;
	onClose?: () => void;
};

export type ToastType = "success" | "error" | "warning" | "info";

export type Toast = {
	id: string;
	type: ToastType;
	title: string;
	message?: string;
	duration?: number;
	action?: {
		label: string;
		onClick: () => void;
	};
};

// Theme types
export type ThemeMode = "light" | "dark" | "system";

// Component prop types
export type ButtonVariant =
	| "default"
	| "destructive"
	| "outline"
	| "secondary"
	| "ghost"
	| "link";
export type ButtonSize = "default" | "sm" | "lg" | "icon";

export type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export type CardVariant = "default" | "elevated" | "outline";

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Re-export validation types
export type {
	UserRole,
	JobOfferType,
	JobOfferStatus,
	ApplicationStatus,
	Availability,
	Schedule,
} from "~/lib/validations";
