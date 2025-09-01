#!/usr/bin/env bun
import { eq } from "drizzle-orm";
/**
 * Script utilitaire pour la gestion des validations de cabinets et médecins
 * Ce script permet d'approuver, rejeter ou remettre en attente des profils
 *
 * Usage:
 *   bun scripts/manage-validation.ts list
 *   bun scripts/manage-validation.ts cabinet approve <email>
 *   bun scripts/manage-validation.ts doctor reject <email>
 */
import { db } from "../src/server/db";
import {
	cabinetProfiles,
	doctorProfiles,
	users,
} from "../src/server/db/schema";

/**
 * Affiche tous les cabinets avec leurs statuts
 */
async function listCabinets() {
	console.log("🏥 === CABINETS ===");

	try {
		const cabinets = await db.query.cabinetProfiles.findMany({
			with: {
				user: true,
			},
		});

		console.log(
			`📊 ${cabinets.length} cabinets trouvés dans la base de données\n`,
		);

		for (const cabinet of cabinets) {
			console.log(`🏥 ${cabinet.cabinetName}`);
			console.log(`📧 Email: ${cabinet.user.email}`);
			console.log(
				`📋 Statut: ${getStatusEmoji(cabinet.status)} ${cabinet.status}`,
			);

			if (cabinet.adminNotes) {
				console.log(`📝 Notes admin: ${cabinet.adminNotes}`);
			}

			if (cabinet.approvedAt) {
				console.log(
					`✅ Approuvé le: ${cabinet.approvedAt.toLocaleDateString("fr-FR")}`,
				);
			}

			if (cabinet.approvedBy) {
				console.log(`👤 Approuvé par: ${cabinet.approvedBy}`);
			}

			console.log("─".repeat(50));
		}

		// Statistiques
		const stats = getStats(cabinets.map((c) => c.status));
		console.log("\n📈 Résumé des statuts cabinets:");
		console.log(`⏳ En attente: ${stats.pending}`);
		console.log(`✅ Approuvés: ${stats.approved}`);
		console.log(`❌ Rejetés: ${stats.rejected}`);
	} catch (error) {
		console.error("❌ Erreur lors de la récupération des cabinets:", error);
	}
}

/**
 * Affiche tous les médecins avec leurs statuts
 */
async function listDoctors() {
	console.log("👨‍⚕️ === MÉDECINS ===");

	try {
		const doctors = await db.query.doctorProfiles.findMany({
			with: {
				user: true,
			},
		});

		console.log(
			`📊 ${doctors.length} médecins trouvés dans la base de données\n`,
		);

		for (const doctor of doctors) {
			console.log(`👨‍⚕️ Dr. ${doctor.firstName} ${doctor.lastName}`);
			console.log(`📧 Email: ${doctor.user.email}`);
			console.log(
				`📋 Statut: ${getStatusEmoji(doctor.status)} ${doctor.status}`,
			);
			console.log(`🏥 Spécialités: ${doctor.specialties.join(", ")}`);
			console.log(`📅 Expérience: ${doctor.experienceYears} ans`);

			if (doctor.adminNotes) {
				console.log(`📝 Notes admin: ${doctor.adminNotes}`);
			}

			if (doctor.approvedAt) {
				console.log(
					`✅ Approuvé le: ${doctor.approvedAt.toLocaleDateString("fr-FR")}`,
				);
			}

			if (doctor.approvedBy) {
				console.log(`👤 Approuvé par: ${doctor.approvedBy}`);
			}

			console.log("─".repeat(50));
		}

		// Statistiques
		const stats = getStats(doctors.map((d) => d.status));
		console.log("\n📈 Résumé des statuts médecins:");
		console.log(`⏳ En attente: ${stats.pending}`);
		console.log(`✅ Approuvés: ${stats.approved}`);
		console.log(`❌ Rejetés: ${stats.rejected}`);
	} catch (error) {
		console.error("❌ Erreur lors de la récupération des médecins:", error);
	}
}

/**
 * Met à jour le statut d'un cabinet
 */
async function updateCabinetStatus(
	email: string,
	status: "PENDING" | "APPROVED" | "REJECTED",
	adminNotes?: string,
	adminId?: string,
) {
	try {
		const user = await db.query.users.findFirst({
			where: eq(users.email, email),
			with: {
				cabinetProfile: true,
			},
		});

		if (!user?.cabinetProfile) {
			console.log(`❌ Aucun cabinet trouvé pour l'email: ${email}`);
			return false;
		}

		const updateData = {
			status,
			adminNotes: adminNotes || null,
			approvedAt: status === "APPROVED" ? new Date() : null,
			approvedBy: status !== "PENDING" ? adminId || "admin" : null,
		};

		await db
			.update(cabinetProfiles)
			.set(updateData)
			.where(eq(cabinetProfiles.id, user.cabinetProfile.id));

		console.log(
			`✅ Statut du cabinet "${user.cabinetProfile.cabinetName}" mis à jour:`,
		);
		console.log(`   Email: ${email}`);
		console.log(`   Nouveau statut: ${getStatusEmoji(status)} ${status}`);
		if (adminNotes) {
			console.log(`   Notes: ${adminNotes}`);
		}

		return true;
	} catch (error) {
		console.error("❌ Erreur lors de la mise à jour du cabinet:", error);
		return false;
	}
}

/**
 * Met à jour le statut d'un médecin
 */
async function updateDoctorStatus(
	email: string,
	status: "PENDING" | "APPROVED" | "REJECTED",
	adminNotes?: string,
	adminId?: string,
) {
	try {
		const user = await db.query.users.findFirst({
			where: eq(users.email, email),
			with: {
				doctorProfile: true,
			},
		});

		if (!user?.doctorProfile) {
			console.log(`❌ Aucun médecin trouvé pour l'email: ${email}`);
			return false;
		}

		const updateData = {
			status,
			adminNotes: adminNotes || null,
			approvedAt: status === "APPROVED" ? new Date() : null,
			approvedBy: status !== "PENDING" ? adminId || "admin" : null,
		};

		await db
			.update(doctorProfiles)
			.set(updateData)
			.where(eq(doctorProfiles.id, user.doctorProfile.id));

		console.log(
			`✅ Statut du médecin "Dr. ${user.doctorProfile.firstName} ${user.doctorProfile.lastName}" mis à jour:`,
		);
		console.log(`   Email: ${email}`);
		console.log(`   Nouveau statut: ${getStatusEmoji(status)} ${status}`);
		if (adminNotes) {
			console.log(`   Notes: ${adminNotes}`);
		}

		return true;
	} catch (error) {
		console.error("❌ Erreur lors de la mise à jour du médecin:", error);
		return false;
	}
}

/**
 * Utilitaires
 */
function getStatusEmoji(status: string): string {
	switch (status) {
		case "PENDING":
			return "⏳";
		case "APPROVED":
			return "✅";
		case "REJECTED":
			return "❌";
		default:
			return "❓";
	}
}

function getStats(statuses: string[]) {
	return {
		pending: statuses.filter((s) => s === "PENDING").length,
		approved: statuses.filter((s) => s === "APPROVED").length,
		rejected: statuses.filter((s) => s === "REJECTED").length,
	};
}

/**
 * Affiche l'aide
 */
function showHelp() {
	console.log(`
🧪 Script de gestion des validations de cabinets et médecins

Commandes disponibles:

📋 CONSULTATION:
  list                    - Afficher tous les profils et leurs statuts
  list cabinets          - Afficher seulement les cabinets
  list doctors           - Afficher seulement les médecins

🏥 GESTION CABINETS:
  cabinet approve <email> [notes] - Approuver un cabinet
  cabinet reject <email> [notes]  - Rejeter un cabinet 
  cabinet pending <email>         - Remettre un cabinet en attente

👨‍⚕️ GESTION MÉDECINS:
  doctor approve <email> [notes]  - Approuver un médecin
  doctor reject <email> [notes]   - Rejeter un médecin
  doctor pending <email>          - Remettre un médecin en attente

📝 EXEMPLES:
  bun scripts/manage-validation.ts list
  bun scripts/manage-validation.ts cabinet approve cabinet@example.com "Cabinet vérifié"
  bun scripts/manage-validation.ts doctor reject doctor@example.com "Documents manquants"
  bun scripts/manage-validation.ts list doctors
	`);
}

// Point d'entrée principal
if (import.meta.main) {
	const args = process.argv.slice(2);
	const command = args[0];
	const subCommand = args[1];
	const email = args[2];
	const notes = args[3];

	switch (command) {
		case "list":
			if (subCommand === "cabinets") {
				await listCabinets();
			} else if (subCommand === "doctors") {
				await listDoctors();
			} else {
				await listCabinets();
				console.log("\n");
				await listDoctors();
			}
			break;

		case "cabinet":
			if (!email) {
				console.log("❌ Email requis pour la commande cabinet");
				break;
			}

			switch (subCommand) {
				case "approve":
					await updateCabinetStatus(
						email,
						"APPROVED",
						notes || "Cabinet approuvé",
					);
					break;
				case "reject":
					await updateCabinetStatus(
						email,
						"REJECTED",
						notes || "Cabinet rejeté",
					);
					break;
				case "pending":
					await updateCabinetStatus(email, "PENDING");
					break;
				default:
					console.log(
						"❌ Sous-commande cabinet invalide. Utilisez: approve, reject, ou pending",
					);
			}
			break;

		case "doctor":
			if (!email) {
				console.log("❌ Email requis pour la commande doctor");
				break;
			}

			switch (subCommand) {
				case "approve":
					await updateDoctorStatus(
						email,
						"APPROVED",
						notes || "Médecin approuvé",
					);
					break;
				case "reject":
					await updateDoctorStatus(
						email,
						"REJECTED",
						notes || "Médecin rejeté",
					);
					break;
				case "pending":
					await updateDoctorStatus(email, "PENDING");
					break;
				default:
					console.log(
						"❌ Sous-commande doctor invalide. Utilisez: approve, reject, ou pending",
					);
			}
			break;

		case "help":
		case "--help":
		case "-h":
			showHelp();
			break;

		default:
			if (command) {
				console.log(`❌ Commande inconnue: ${command}\n`);
			}
			showHelp();
	}
}

// Exports pour les tests
export { listCabinets, listDoctors, updateCabinetStatus, updateDoctorStatus };
