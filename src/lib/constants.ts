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
		id: "MEDECINE_GENERALE",
		name: "Médecine générale",
		category: "Médecine générale",
	},
	{ id: "CARDIOLOGIE", name: "Cardiologie", category: "Spécialités médicales" },
	{
		id: "DERMATOLOGIE",
		name: "Dermatologie",
		category: "Spécialités médicales",
	},
	{ id: "PEDIATRIE", name: "Pédiatrie", category: "Spécialités médicales" },
	{ id: "GYNECOLOGIE", name: "Gynécologie", category: "Spécialités médicales" },
	{
		id: "OPHTALMOLOGIE",
		name: "Ophtalmologie",
		category: "Spécialités médicales",
	},
	{ id: "PSYCHIATRIE", name: "Psychiatrie", category: "Spécialités médicales" },
	{ id: "RADIOLOGIE", name: "Radiologie", category: "Spécialités techniques" },
	{ id: "NEUROLOGIE", name: "Neurologie", category: "Spécialités médicales" },
	{
		id: "GASTRO_ENTEROLOGIE",
		name: "Gastro-entérologie",
		category: "Spécialités médicales",
	},
	{ id: "PNEUMOLOGIE", name: "Pneumologie", category: "Spécialités médicales" },
	{
		id: "RHUMATOLOGIE",
		name: "Rhumatologie",
		category: "Spécialités médicales",
	},
	{
		id: "ENDOCRINOLOGIE",
		name: "Endocrinologie",
		category: "Spécialités médicales",
	},
	{ id: "UROLOGIE", name: "Urologie", category: "Spécialités chirurgicales" },
	{ id: "ORL", name: "ORL", category: "Spécialités chirurgicales" },
	{
		id: "CHIRURGIE_GENERALE",
		name: "Chirurgie générale",
		category: "Spécialités chirurgicales",
	},
	{
		id: "ANESTHESIE",
		name: "Anesthésie-Réanimation",
		category: "Spécialités chirurgicales",
	},
	{
		id: "MEDECINE_URGENCE",
		name: "Médecine d'urgence",
		category: "Spécialités d'urgence",
	},
	{ id: "GERIATRIE", name: "Gériatrie", category: "Spécialités médicales" },
	{
		id: "MEDECINE_INTERNE",
		name: "Médecine interne",
		category: "Spécialités médicales",
	},
	{ id: "HEMATOLOGIE", name: "Hématologie", category: "Spécialités médicales" },
	{ id: "NEPHROLOGIE", name: "Néphrologie", category: "Spécialités médicales" },
	{ id: "ORTHOPEDYE", name: "Orthopédie", category: "Spécialités médicales" },
	{
		id: "CHIRURGIE_ORTHOPEDIQUE",
		name: "Chirurgie orthopédique",
		category: "Spécialités chirurgicales",
	},
	{
		id: "CHIRURGIE_VASCULAIRE",
		name: "Chirurgie vasculaire",
		category: "Spécialités chirurgicales",
	},
	{ id: "ONCOLOGIE", name: "Oncologie", category: "Spécialités médicales" },
	{
		id: "ADDICTOLOGIE",
		name: "Addictologie",
		category: "Spécialités médicales",
	},
	{
		id: "MEDECINE_TRAVAIL",
		name: "Médecine du travail",
		category: "Médecine spécialisée",
	},
	{
		id: "MEDECINE_SPORT",
		name: "Médecine du sport",
		category: "Médecine spécialisée",
	},
] as const;

// Helper function to get specialty options for forms
export const getSpecialtyOptions = () => {
	return MEDICAL_SPECIALTIES.map((specialty) => ({
		value: specialty.id,
		label: specialty.name,
		category: specialty.category,
	}));
};

// Helper function to get specialties by category
export const getSpecialtiesByCategory = () => {
	const categories: Record<
		string,
		Array<{ value: string; label: string }>
	> = {};

	for (const specialty of MEDICAL_SPECIALTIES) {
		if (!categories[specialty.category]) {
			categories[specialty.category] = [];
		}
		categories[specialty.category]?.push({
			value: specialty.id,
			label: specialty.name,
		});
	}

	return categories;
};

// Helper function to get specialty name by ID
export const getSpecialtyName = (id: string) => {
	return (
		MEDICAL_SPECIALTIES.find((specialty) => specialty.id === id)?.name || id
	);
};

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
