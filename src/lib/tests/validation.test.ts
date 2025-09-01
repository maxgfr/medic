import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { eq } from "drizzle-orm";
import { db } from "../../server/db";
import { cabinetProfiles, doctorProfiles, users } from "../../server/db/schema";
import type { GeneralAvailability } from "../../types";

// Types pour les insertions
type InsertUser = typeof users.$inferInsert;
type InsertCabinetProfile = typeof cabinetProfiles.$inferInsert;
type InsertDoctorProfile = typeof doctorProfiles.$inferInsert;

describe("Validation System", () => {
	// Variables pour stocker les IDs des entités de test
	let testCabinetUserId: string;
	let testDoctorUserId: string;
	let testCabinetId: string;
	let testDoctorId: string;

	beforeAll(async () => {
		// Créer des utilisateurs de test
		const testCabinetUser: InsertUser = {
			email: "test-cabinet@example.com",
			name: "Cabinet Test",
			role: "CABINET",
		};

		const testDoctorUser: InsertUser = {
			email: "test-doctor@example.com",
			name: "Doctor Test",
			role: "DOCTOR",
		};

		// Insérer les utilisateurs de test
		const [cabinetUser] = await db
			.insert(users)
			.values(testCabinetUser)
			.returning();
		const [doctorUser] = await db
			.insert(users)
			.values(testDoctorUser)
			.returning();

		if (!cabinetUser || !doctorUser) {
			throw new Error("Failed to create test users");
		}

		testCabinetUserId = cabinetUser.id;
		testDoctorUserId = doctorUser.id;

		// Créer les profils de test
		const testCabinetProfile: InsertCabinetProfile = {
			userId: testCabinetUserId,
			cabinetName: "Cabinet de Test",
			address: "123 Rue de Test, Paris",
			phone: "0123456789",
			specialties: ["Médecine générale"],
			status: "PENDING",
		};

		const testDoctorProfile: InsertDoctorProfile = {
			userId: testDoctorUserId,
			firstName: "Jean",
			lastName: "Test",
			specialties: ["Médecine générale"],
			experienceYears: 5,
			preferredLocations: [],
			generalAvailability: {
				monday: true,
				tuesday: true,
				wednesday: true,
				thursday: true,
				friday: true,
				saturday: false,
				sunday: false,
			},
			status: "PENDING",
		};

		// Insérer les profils de test
		const [cabinetProfile] = await db
			.insert(cabinetProfiles)
			.values(testCabinetProfile)
			.returning();
		const [doctorProfile] = await db
			.insert(doctorProfiles)
			.values(testDoctorProfile)
			.returning();

		if (!cabinetProfile || !doctorProfile) {
			throw new Error("Failed to create test profiles");
		}

		testCabinetId = cabinetProfile.id;
		testDoctorId = doctorProfile.id;
	});

	afterAll(async () => {
		// Nettoyer les données de test
		await db
			.delete(cabinetProfiles)
			.where(eq(cabinetProfiles.id, testCabinetId));
		await db.delete(doctorProfiles).where(eq(doctorProfiles.id, testDoctorId));
		await db.delete(users).where(eq(users.id, testCabinetUserId));
		await db.delete(users).where(eq(users.id, testDoctorUserId));
	});

	describe("Cabinet Validation", () => {
		test("should approve a cabinet", async () => {
			// Approuver le cabinet
			await db
				.update(cabinetProfiles)
				.set({
					status: "APPROVED",
					adminNotes: "Cabinet approuvé pour test",
					approvedAt: new Date(),
					approvedBy: "test-admin",
				})
				.where(eq(cabinetProfiles.id, testCabinetId));

			// Vérifier que le statut a été mis à jour
			const updatedCabinet = await db.query.cabinetProfiles.findFirst({
				where: eq(cabinetProfiles.id, testCabinetId),
			});

			expect(updatedCabinet?.status).toBe("APPROVED");
			expect(updatedCabinet?.adminNotes).toBe("Cabinet approuvé pour test");
			expect(updatedCabinet?.approvedAt).toBeInstanceOf(Date);
			expect(updatedCabinet?.approvedBy).toBe("test-admin");
		});

		test("should reject a cabinet", async () => {
			// Rejeter le cabinet
			await db
				.update(cabinetProfiles)
				.set({
					status: "REJECTED",
					adminNotes: "Cabinet rejeté - informations manquantes",
					approvedAt: null,
					approvedBy: "test-admin",
				})
				.where(eq(cabinetProfiles.id, testCabinetId));

			// Vérifier que le statut a été mis à jour
			const updatedCabinet = await db.query.cabinetProfiles.findFirst({
				where: eq(cabinetProfiles.id, testCabinetId),
			});

			expect(updatedCabinet?.status).toBe("REJECTED");
			expect(updatedCabinet?.adminNotes).toBe(
				"Cabinet rejeté - informations manquantes",
			);
			expect(updatedCabinet?.approvedAt).toBeNull();
			expect(updatedCabinet?.approvedBy).toBe("test-admin");
		});

		test("should set cabinet back to pending", async () => {
			// Remettre le cabinet en attente
			await db
				.update(cabinetProfiles)
				.set({
					status: "PENDING",
					adminNotes: null,
					approvedAt: null,
					approvedBy: null,
				})
				.where(eq(cabinetProfiles.id, testCabinetId));

			// Vérifier que le statut a été mis à jour
			const updatedCabinet = await db.query.cabinetProfiles.findFirst({
				where: eq(cabinetProfiles.id, testCabinetId),
			});

			expect(updatedCabinet?.status).toBe("PENDING");
			expect(updatedCabinet?.adminNotes).toBeNull();
			expect(updatedCabinet?.approvedAt).toBeNull();
			expect(updatedCabinet?.approvedBy).toBeNull();
		});

		test("should find cabinet by email", async () => {
			const user = await db.query.users.findFirst({
				where: eq(users.email, "test-cabinet@example.com"),
				with: {
					cabinetProfile: true,
				},
			});

			expect(user).toBeDefined();
			expect(user?.cabinetProfile).toBeDefined();
			expect(user?.cabinetProfile?.cabinetName).toBe("Cabinet de Test");
		});
	});

	describe("Doctor Validation", () => {
		test("should approve a doctor", async () => {
			// Approuver le médecin
			await db
				.update(doctorProfiles)
				.set({
					status: "APPROVED",
					adminNotes: "Médecin approuvé pour test",
					approvedAt: new Date(),
					approvedBy: "test-admin",
				})
				.where(eq(doctorProfiles.id, testDoctorId));

			// Vérifier que le statut a été mis à jour
			const updatedDoctor = await db.query.doctorProfiles.findFirst({
				where: eq(doctorProfiles.id, testDoctorId),
			});

			expect(updatedDoctor?.status).toBe("APPROVED");
			expect(updatedDoctor?.adminNotes).toBe("Médecin approuvé pour test");
			expect(updatedDoctor?.approvedAt).toBeInstanceOf(Date);
			expect(updatedDoctor?.approvedBy).toBe("test-admin");
		});

		test("should reject a doctor", async () => {
			// Rejeter le médecin
			await db
				.update(doctorProfiles)
				.set({
					status: "REJECTED",
					adminNotes: "Médecin rejeté - documents manquants",
					approvedAt: null,
					approvedBy: "test-admin",
				})
				.where(eq(doctorProfiles.id, testDoctorId));

			// Vérifier que le statut a été mis à jour
			const updatedDoctor = await db.query.doctorProfiles.findFirst({
				where: eq(doctorProfiles.id, testDoctorId),
			});

			expect(updatedDoctor?.status).toBe("REJECTED");
			expect(updatedDoctor?.adminNotes).toBe(
				"Médecin rejeté - documents manquants",
			);
			expect(updatedDoctor?.approvedAt).toBeNull();
			expect(updatedDoctor?.approvedBy).toBe("test-admin");
		});

		test("should set doctor back to pending", async () => {
			// Remettre le médecin en attente
			await db
				.update(doctorProfiles)
				.set({
					status: "PENDING",
					adminNotes: null,
					approvedAt: null,
					approvedBy: null,
				})
				.where(eq(doctorProfiles.id, testDoctorId));

			// Vérifier que le statut a été mis à jour
			const updatedDoctor = await db.query.doctorProfiles.findFirst({
				where: eq(doctorProfiles.id, testDoctorId),
			});

			expect(updatedDoctor?.status).toBe("PENDING");
			expect(updatedDoctor?.adminNotes).toBeNull();
			expect(updatedDoctor?.approvedAt).toBeNull();
			expect(updatedDoctor?.approvedBy).toBeNull();
		});

		test("should find doctor by email", async () => {
			const user = await db.query.users.findFirst({
				where: eq(users.email, "test-doctor@example.com"),
				with: {
					doctorProfile: true,
				},
			});

			expect(user).toBeDefined();
			expect(user?.doctorProfile).toBeDefined();
			expect(user?.doctorProfile?.firstName).toBe("Jean");
			expect(user?.doctorProfile?.lastName).toBe("Test");
		});
	});

	describe("Validation Statistics", () => {
		test("should count profiles by status", async () => {
			// Compter les cabinets par statut
			const cabinets = await db.query.cabinetProfiles.findMany();
			const cabinetStats = {
				pending: cabinets.filter((c) => c.status === "PENDING").length,
				approved: cabinets.filter((c) => c.status === "APPROVED").length,
				rejected: cabinets.filter((c) => c.status === "REJECTED").length,
			};

			// Compter les médecins par statut
			const doctors = await db.query.doctorProfiles.findMany();
			const doctorStats = {
				pending: doctors.filter((d) => d.status === "PENDING").length,
				approved: doctors.filter((d) => d.status === "APPROVED").length,
				rejected: doctors.filter((d) => d.status === "REJECTED").length,
			};

			// Vérifier que les compteurs sont des nombres
			expect(typeof cabinetStats.pending).toBe("number");
			expect(typeof cabinetStats.approved).toBe("number");
			expect(typeof cabinetStats.rejected).toBe("number");

			expect(typeof doctorStats.pending).toBe("number");
			expect(typeof doctorStats.approved).toBe("number");
			expect(typeof doctorStats.rejected).toBe("number");

			// Vérifier qu'au moins notre cabinet et médecin de test sont comptés
			expect(cabinets.length).toBeGreaterThanOrEqual(1);
			expect(doctors.length).toBeGreaterThanOrEqual(1);
		});
	});

	describe("Validation Workflow", () => {
		test("should handle complete validation workflow for cabinet", async () => {
			// 1. Démarrer en pending
			await db
				.update(cabinetProfiles)
				.set({ status: "PENDING" })
				.where(eq(cabinetProfiles.id, testCabinetId));

			let cabinet = await db.query.cabinetProfiles.findFirst({
				where: eq(cabinetProfiles.id, testCabinetId),
			});
			expect(cabinet?.status).toBe("PENDING");

			// 2. Approuver
			await db
				.update(cabinetProfiles)
				.set({
					status: "APPROVED",
					approvedAt: new Date(),
					approvedBy: "test-admin",
				})
				.where(eq(cabinetProfiles.id, testCabinetId));

			cabinet = await db.query.cabinetProfiles.findFirst({
				where: eq(cabinetProfiles.id, testCabinetId),
			});
			expect(cabinet?.status).toBe("APPROVED");
			expect(cabinet?.approvedAt).toBeInstanceOf(Date);

			// 3. Rejeter (si besoin de changer d'avis)
			await db
				.update(cabinetProfiles)
				.set({
					status: "REJECTED",
					approvedAt: null,
				})
				.where(eq(cabinetProfiles.id, testCabinetId));

			cabinet = await db.query.cabinetProfiles.findFirst({
				where: eq(cabinetProfiles.id, testCabinetId),
			});
			expect(cabinet?.status).toBe("REJECTED");
			expect(cabinet?.approvedAt).toBeNull();
		});

		test("should handle complete validation workflow for doctor", async () => {
			// 1. Démarrer en pending
			await db
				.update(doctorProfiles)
				.set({ status: "PENDING" })
				.where(eq(doctorProfiles.id, testDoctorId));

			let doctor = await db.query.doctorProfiles.findFirst({
				where: eq(doctorProfiles.id, testDoctorId),
			});
			expect(doctor?.status).toBe("PENDING");

			// 2. Approuver
			await db
				.update(doctorProfiles)
				.set({
					status: "APPROVED",
					approvedAt: new Date(),
					approvedBy: "test-admin",
				})
				.where(eq(doctorProfiles.id, testDoctorId));

			doctor = await db.query.doctorProfiles.findFirst({
				where: eq(doctorProfiles.id, testDoctorId),
			});
			expect(doctor?.status).toBe("APPROVED");
			expect(doctor?.approvedAt).toBeInstanceOf(Date);

			// 3. Rejeter (si besoin de changer d'avis)
			await db
				.update(doctorProfiles)
				.set({
					status: "REJECTED",
					approvedAt: null,
				})
				.where(eq(doctorProfiles.id, testDoctorId));

			doctor = await db.query.doctorProfiles.findFirst({
				where: eq(doctorProfiles.id, testDoctorId),
			});
			expect(doctor?.status).toBe("REJECTED");
			expect(doctor?.approvedAt).toBeNull();
		});
	});
});
