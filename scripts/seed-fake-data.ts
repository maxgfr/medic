import { db } from "~/server/db";
import {
  users,
  cabinetProfiles,
  doctorProfiles,
  jobOffers,
  applications,
  specialties,
} from "~/server/db/schema";
import { MEDICAL_SPECIALTIES } from "~/lib/constants";
import bcrypt from "bcryptjs";
import type {
  MedicalSpecialty,
  PreferredLocation,
  GeneralAvailability,
} from "~/types";

const FAKE_CABINETS = [
  {
    name: "Cabinet Médical Saint-Germain",
    address: "15 Rue de Rivoli, 75001 Paris",
    phone: "01 42 60 30 40",
    description:
      "Cabinet médical moderne situé au cœur de Paris, spécialisé en médecine générale et cardiologie.",
    specialties: ["MEDECINE_GENERALE", "CARDIOLOGIE"],
    latitude: 48.8566,
    longitude: 2.3522,
  },
  {
    name: "Centre Médical Lyon Presqu'île",
    address: "22 Rue de la République, 69002 Lyon",
    phone: "04 78 42 15 20",
    description:
      "Centre médical pluridisciplinaire avec plateau technique complet.",
    specialties: ["MEDECINE_GENERALE", "DERMATOLOGIE", "OPHTALMOLOGIE"],
    latitude: 45.764,
    longitude: 4.8357,
  },
  {
    name: "Cabinet Dr. Dubois",
    address: "8 Avenue Jean Médecin, 06000 Nice",
    phone: "04 93 87 52 10",
    description: "Cabinet spécialisé en pédiatrie et médecine familiale.",
    specialties: ["PEDIATRIE", "MEDECINE_GENERALE"],
    latitude: 43.7102,
    longitude: 7.262,
  },
  {
    name: "Polyclinique de Bordeaux",
    address: "45 Cours de l'Intendance, 33000 Bordeaux",
    phone: "05 56 00 22 30",
    description:
      "Établissement médical regroupant plusieurs spécialités médicales.",
    specialties: ["GYNECOLOGIE", "PSYCHIATRIE", "RADIOLOGIE"],
    latitude: 44.8378,
    longitude: -0.5792,
  },
  {
    name: "Centre de Santé Marseille",
    address: "12 La Canebière, 13001 Marseille",
    phone: "04 91 13 45 60",
    description: "Centre de santé communautaire offrant des soins de qualité.",
    specialties: ["MEDECINE_GENERALE", "NEUROLOGIE"],
    latitude: 43.2965,
    longitude: 5.3698,
  },
];

const FAKE_DOCTORS = [
  {
    firstName: "Marie",
    lastName: "Dubois",
    specialties: ["MEDECINE_GENERALE", "CARDIOLOGIE"],
    experienceYears: 8,
    preferredLocations: [
      { name: "Paris", travelRadius: 50, priority: 1 },
      { name: "Lyon", travelRadius: 30, priority: 2 },
    ],
    preferredRate: "120.00",
  },
  {
    firstName: "Pierre",
    lastName: "Martin",
    specialties: ["PEDIATRIE"],
    experienceYears: 12,
    preferredLocations: [
      { name: "Nice", travelRadius: 25, priority: 1 },
      { name: "Cannes", travelRadius: 40, priority: 2 },
    ],
    preferredRate: "110.00",
  },
  {
    firstName: "Sophie",
    lastName: "Bernard",
    specialties: ["DERMATOLOGIE", "MEDECINE_GENERALE"],
    experienceYears: 6,
    preferredLocations: [
      { name: "Lyon", travelRadius: 35, priority: 1 },
      { name: "Villeurbanne", travelRadius: 20, priority: 2 },
    ],
    preferredRate: "130.00",
  },
  {
    firstName: "Thomas",
    lastName: "Rousseau",
    specialties: ["NEUROLOGIE"],
    experienceYears: 15,
    preferredLocations: [
      { name: "Bordeaux", travelRadius: 60, priority: 1 },
      { name: "Toulouse", travelRadius: 50, priority: 2 },
    ],
    preferredRate: "150.00",
  },
  {
    firstName: "Emma",
    lastName: "Leroy",
    specialties: ["GYNECOLOGIE", "MEDECINE_GENERALE"],
    experienceYears: 10,
    preferredLocations: [
      { name: "Marseille", travelRadius: 40, priority: 1 },
      { name: "Aix-en-Provence", travelRadius: 30, priority: 2 },
    ],
    preferredRate: "125.00",
  },
  {
    firstName: "Lucas",
    lastName: "Moreau",
    specialties: ["OPHTALMOLOGIE"],
    experienceYears: 7,
    preferredLocations: [
      { name: "Paris", travelRadius: 45, priority: 1 },
      { name: "Boulogne-Billancourt", travelRadius: 25, priority: 2 },
    ],
    preferredRate: "140.00",
  },
];

const JOB_TITLES = [
  "Remplacement médecin généraliste urgent",
  "Remplaçant(e) pédiatre - Cabinet moderne",
  "Médecin dermatologue - Remplacement 3 mois",
  "Cardiologue remplaçant - Urgence",
  "Remplaçant(e) gynécologue - Planning flexible",
  "Neurologue - Remplacement temporaire",
  "Ophtalmologue remplaçant(e) - Excellent cadre",
  "Médecin généraliste - Remplacement congés",
];

const JOB_DESCRIPTIONS = [
  "Nous recherchons un médecin remplaçant dynamique pour rejoindre notre équipe. Cabinet bien équipé avec secrétariat médical.",
  "Remplacement dans un environnement médical moderne avec plateau technique complet. Patientèle fidèle et variée.",
  "Opportunité de remplacement dans un cabinet réputé. Excellentes conditions de travail et rémunération attractive.",
  "Remplacement urgent suite à congé maladie. Cabinet bien organisé avec équipe médicale expérimentée.",
  "Poste de remplacement dans un centre médical pluridisciplinaire. Possibilité de collaboration avec d'autres spécialistes.",
];

type UserRecord = {
  id: string;
  name: string | null;
  email: string;
  password: string | null;
  role: "CABINET" | "DOCTOR";
  createdAt: Date;
  updatedAt: Date | null;
  emailVerified: Date | null;
  image: string | null;
};

type CabinetProfileRecord = typeof cabinetProfiles.$inferSelect;
type DoctorProfileRecord = typeof doctorProfiles.$inferSelect;

async function createFakeUsers() {
  console.log("👥 Création des utilisateurs fake...");

  const cabinetUsers: UserRecord[] = [];
  const doctorUsers: UserRecord[] = [];

  // Créer les utilisateurs cabinets
  for (let i = 0; i < FAKE_CABINETS.length; i++) {
    const cabinet = FAKE_CABINETS[i];
    if (!cabinet) continue;

    const hashedPassword = await bcrypt.hash("password123", 10);

    const [user] = await db
      .insert(users)
      .values({
        name: cabinet.name,
        email: `cabinet${i + 1}@medicremplacement.com`,
        password: hashedPassword,
        role: "CABINET",
      })
      .returning();

    if (user) {
      cabinetUsers.push(user);
    }
  }

  // Créer les utilisateurs médecins
  for (let i = 0; i < FAKE_DOCTORS.length; i++) {
    const doctor = FAKE_DOCTORS[i];
    if (!doctor) continue;

    const hashedPassword = await bcrypt.hash("password123", 10);

    const [user] = await db
      .insert(users)
      .values({
        name: `Dr. ${doctor.firstName} ${doctor.lastName}`,
        email: `${doctor.firstName.toLowerCase()}.${doctor.lastName.toLowerCase()}@medicremplacement.com`,
        password: hashedPassword,
        role: "DOCTOR",
      })
      .returning();

    if (user) {
      doctorUsers.push(user);
    }
  }

  console.log(
    `✅ Créé ${cabinetUsers.length} utilisateurs cabinets et ${doctorUsers.length} utilisateurs médecins`
  );
  return { cabinetUsers, doctorUsers };
}

async function createCabinetProfiles(cabinetUsers: UserRecord[]) {
  console.log("🏥 Création des profils cabinets...");

  const profiles: CabinetProfileRecord[] = [];

  for (let i = 0; i < cabinetUsers.length; i++) {
    const user = cabinetUsers[i];
    const cabinet = FAKE_CABINETS[i];
    if (!user || !cabinet) continue;

    const [profile] = await db
      .insert(cabinetProfiles)
      .values({
        userId: user.id,
        cabinetName: cabinet.name,
        address: cabinet.address,
        phone: cabinet.phone,
        description: cabinet.description,
        specialties: cabinet.specialties,
        latitude: cabinet.latitude,
        longitude: cabinet.longitude,
      })
      .returning();

    if (profile) {
      profiles.push(profile);
    }
  }

  console.log(`✅ Créé ${profiles.length} profils cabinets`);
  return profiles;
}

async function createDoctorProfiles(doctorUsers: UserRecord[]) {
  console.log("👨‍⚕️ Création des profils médecins...");

  const profiles: DoctorProfileRecord[] = [];

  for (let i = 0; i < doctorUsers.length; i++) {
    const user = doctorUsers[i];
    const doctor = FAKE_DOCTORS[i];
    if (!user || !doctor) continue;

    const [profile] = await db
      .insert(doctorProfiles)
      .values({
        userId: user.id,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        specialties: doctor.specialties,
        experienceYears: doctor.experienceYears,
        preferredLocations: doctor.preferredLocations as PreferredLocation[],
        generalAvailability: {
          monday: true,
          tuesday: true,
          wednesday: true,
          thursday: true,
          friday: true,
          saturday: false,
          sunday: false,
        },
        specificAvailabilities: [],
        preferredRate: doctor.preferredRate,
      })
      .returning();

    if (profile) {
      profiles.push(profile);
    }
  }

  console.log(`✅ Créé ${profiles.length} profils médecins`);
  return profiles;
}

async function createJobOffers(cabinetProfiles: CabinetProfileRecord[]) {
  console.log("💼 Création des annonces d'emploi...");

  const createdJobOffers = [];
  const now = new Date();

  for (let i = 0; i < 15; i++) {
    const randomIndex = Math.floor(Math.random() * cabinetProfiles.length);
    const cabinet = cabinetProfiles[randomIndex];
    if (!cabinet) continue;

    const cabinetData = FAKE_CABINETS.find(
      (c) => c.name === cabinet.cabinetName
    );
    if (!cabinetData) continue;

    // Dates aléatoires dans le futur
    const startDate = new Date(
      now.getTime() + Math.random() * 60 * 24 * 60 * 60 * 1000
    ); // 0-60 jours
    const endDate = new Date(
      startDate.getTime() + (Math.random() * 30 + 1) * 24 * 60 * 60 * 1000
    ); // 1-30 jours de durée

    // Spécialité aléatoire parmi celles du cabinet
    const specialtyIndex = Math.floor(
      Math.random() * cabinetData.specialties.length
    );
    const specialty = cabinetData.specialties[specialtyIndex];
    if (!specialty) continue;

    const titleIndex = Math.floor(Math.random() * JOB_TITLES.length);
    const title = JOB_TITLES[titleIndex];
    if (!title) continue;

    const descriptionIndex = Math.floor(
      Math.random() * JOB_DESCRIPTIONS.length
    );
    const description = JOB_DESCRIPTIONS[descriptionIndex];
    if (!description) continue;

    const locationParts = cabinetData.address.split(",");
    const location = locationParts[1]?.trim() || cabinetData.address;

    const [jobOffer] = await db
      .insert(jobOffers)
      .values({
        cabinetId: cabinet.id,
        title,
        specialty: specialty as MedicalSpecialty,
        location,
        latitude: cabinetData.latitude,
        longitude: cabinetData.longitude,
        startDate,
        endDate,
        retrocessionRate: (Math.random() * 30 + 50).toFixed(2), // 50-80%
        type:
          Math.random() > 0.7
            ? "URGENT"
            : Math.random() > 0.5
            ? "PLANNED"
            : "RECURRING",
        description,
        schedule: {
          morning: Math.random() > 0.3,
          afternoon: Math.random() > 0.2,
          evening: Math.random() > 0.8,
        },
        estimatedPatients: Math.floor(Math.random() * 30 + 10), // 10-40 patients
        equipment: ["Stéthoscope", "Tensiomètre", "ECG"].filter(
          () => Math.random() > 0.5
        ),
        housingProvided: Math.random() > 0.8,
        status: "PUBLISHED",
      })
      .returning();

    if (jobOffer) {
      createdJobOffers.push(jobOffer);
    }
  }

  console.log(`✅ Créé ${createdJobOffers.length} annonces d'emploi`);
  return createdJobOffers;
}

async function createApplications(
  jobOffersList: (typeof jobOffers.$inferSelect)[],
  doctorProfiles: DoctorProfileRecord[]
) {
  console.log("📋 Création des candidatures...");

  const createdApplications = [];

  // Créer quelques candidatures aléatoires
  for (let i = 0; i < 25; i++) {
    const jobOfferIndex = Math.floor(Math.random() * jobOffersList.length);
    const jobOffer = jobOffersList[jobOfferIndex];
    if (!jobOffer) continue;

    const doctorIndex = Math.floor(Math.random() * doctorProfiles.length);
    const doctor = doctorProfiles[doctorIndex];
    if (!doctor) continue;

    // Vérifier que le médecin peut postuler (spécialité compatible)
    const jobSpecialty = jobOffer.specialty;
    if (!doctor.specialties.includes(jobSpecialty)) {
      continue; // Skip si spécialité incompatible
    }

    const motivationLetters = [
      "Je suis très intéressé(e) par cette offre de remplacement. Mon expérience et ma disponibilité correspondent parfaitement à vos besoins.",
      "Médecin expérimenté, je souhaite rejoindre votre équipe pour ce remplacement. Je suis disponible aux dates mentionnées.",
      "Votre annonce a retenu toute mon attention. Je serais ravi(e) de contribuer à la continuité des soins dans votre cabinet.",
      "Fort(e) de mes années d'expérience, je pense pouvoir répondre efficacement à vos attentes pour ce remplacement.",
    ];

    const letterIndex = Math.floor(Math.random() * motivationLetters.length);
    const motivationLetter = motivationLetters[letterIndex];
    if (!motivationLetter) continue;

    const statusOptions: Array<"SENT" | "VIEWED" | "ACCEPTED" | "REJECTED"> = [
      "SENT",
      "VIEWED",
      "ACCEPTED",
      "REJECTED",
    ];
    const statusIndex = Math.floor(Math.random() * 4);
    const status = statusOptions[statusIndex];
    if (!status) continue;

    const [application] = await db
      .insert(applications)
      .values({
        jobOfferId: jobOffer.id,
        doctorId: doctor.id,
        motivationLetter,
        attachments: [],
        status,
      })
      .returning();

    if (application) {
      createdApplications.push(application);
    }
  }

  console.log(`✅ Créé ${createdApplications.length} candidatures`);
  return createdApplications;
}

async function seedFakeData() {
  console.log("🌱 Démarrage du seeding avec des données fake...");

  try {
    // 1. S'assurer que les spécialités sont présentes
    console.log("📋 Vérification des spécialités médicales...");
    for (const specialty of MEDICAL_SPECIALTIES) {
      await db
        .insert(specialties)
        .values({
          id: specialty.id,
          name: specialty.name,
          category: specialty.category,
        })
        .onConflictDoNothing();
    }

    // 2. Créer les utilisateurs
    const { cabinetUsers, doctorUsers } = await createFakeUsers();

    // 3. Créer les profils
    const cabinetProfiles = await createCabinetProfiles(cabinetUsers);
    const doctorProfiles = await createDoctorProfiles(doctorUsers);

    // 4. Créer les annonces d'emploi
    const jobOffersList = await createJobOffers(cabinetProfiles);

    // 5. Créer les candidatures
    await createApplications(jobOffersList, doctorProfiles);

    console.log("🎉 Seeding des données fake terminé avec succès !");
    console.log("📧 Identifiants de connexion :");
    console.log(
      "   Cabinets : cabinet1@medicremplacement.com à cabinet5@medicremplacement.com"
    );
    console.log("   Médecins : prenom.nom@medicremplacement.com");
    console.log("   Mot de passe : password123");
  } catch (error) {
    console.error("❌ Erreur lors du seeding :", error);
    process.exit(1);
  }
}

// Exécuter le script
seedFakeData()
  .then(() => {
    console.log("🏁 Seeding terminé");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Seeding échoué :", error);
    process.exit(1);
  });
