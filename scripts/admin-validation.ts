#!/usr/bin/env bun
/**
 * Script d'administration pour la validation des cabinets et médecins
 * Permet d'approuver ou rejeter des profils en ligne de commande
 */
import { eq } from "drizzle-orm";
import { db } from "../src/server/db";
import {
	cabinetProfiles,
	doctorProfiles,
	users,
} from "../src/server/db/schema";

/**
 * Affiche tous les cabinets avec leurs statuts de validation
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
			`📊 ${cabinets.length} cabinets trouvés dans la base de données`,
		);

		for (const cabinet of cabinets) {
			console.log(`\n🏥 Cabinet: ${cabinet.cabinetName}`);
			console.log(`📧 Email: ${cabinet.user.email}`);
			console.log(`📋 Statut: ${cabinet.status}`);

			if (cabinet.adminNotes) {
				console.log(`📝 Notes admin: ${cabinet.adminNotes}`);
			}

			if (cabinet.approvedAt) {
				console.log(
					`✅ Approuvé le: ${cabinet.approvedAt.toLocaleDateString()}`,
				);
			}

			if (cabinet.approvedBy) {
				console.log(`👤 Approuvé par: ${cabinet.approvedBy}`);
			}
		}

		// Compter par statut
		const pendingCount = cabinets.filter((c) => c.status === "PENDING").length;
		const approvedCount = cabinets.filter(
			(c) => c.status === "APPROVED",
		).length;
		const rejectedCount = cabinets.filter(
			(c) => c.status === "REJECTED",
		).length;

		console.log("\n📈 Résumé des statuts cabinets:");
		console.log(`⏳ En attente: ${pendingCount}`);
		console.log(`✅ Approuvés: ${approvedCount}`);
		console.log(`❌ Rejetés: ${rejectedCount}`);
	} catch (error) {
		console.error("❌ Erreur lors de la liste cabinets:", error);
	}
}

/**
 * Affiche tous les médecins avec leurs statuts de validation
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
			`📊 ${doctors.length} médecins trouvés dans la base de données`,
		);

		for (const doctor of doctors) {
			console.log(`\n👨‍⚕️ Médecin: Dr. ${doctor.firstName} ${doctor.lastName}`);
			console.log(`📧 Email: ${doctor.user.email}`);
			console.log(`📋 Statut: ${doctor.status}`);

			if (doctor.adminNotes) {
				console.log(`📝 Notes admin: ${doctor.adminNotes}`);
			}

			if (doctor.approvedAt) {
				console.log(
					`✅ Approuvé le: ${doctor.approvedAt.toLocaleDateString()}`,
				);
			}

			if (doctor.approvedBy) {
				console.log(`👤 Approuvé par: ${doctor.approvedBy}`);
			}
		}

		// Compter par statut
		const pendingCount = doctors.filter((d) => d.status === "PENDING").length;
		const approvedCount = doctors.filter((d) => d.status === "APPROVED").length;
		const rejectedCount = doctors.filter((d) => d.status === "REJECTED").length;

		console.log("\n📈 Résumé des statuts médecins:");
		console.log(`⏳ En attente: ${pendingCount}`);
		console.log(`✅ Approuvés: ${approvedCount}`);
		console.log(`❌ Rejetés: ${rejectedCount}`);
	} catch (error) {
		console.error("❌ Erreur lors de la liste médecins:", error);
	}
}

/**
 * Met à jour le statut de validation d'un cabinet
 */
async function setCabinetStatus(
	email: string,
	status: "PENDING" | "APPROVED" | "REJECTED",
	adminNotes?: string,
	adminId = "admin-script",
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

		await db
			.update(cabinetProfiles)
			.set({
				status,
				adminNotes: adminNotes || null,
				approvedAt: status === "APPROVED" ? new Date() : null,
				approvedBy: status !== "PENDING" ? adminId : null,
			})
			.where(eq(cabinetProfiles.id, user.cabinetProfile.id));

		console.log(
			`✅ Statut du cabinet "${user.cabinetProfile.cabinetName}" mis à jour: ${status}`,
		);

		if (adminNotes) {
			console.log(`📝 Notes: ${adminNotes}`);
		}

		return true;
	} catch (error) {
		console.error("❌ Erreur lors de la mise à jour cabinet:", error);
		return false;
	}
}

/**
 * Met à jour le statut de validation d'un médecin
 */
async function setDoctorStatus(
	email: string,
	status: "PENDING" | "APPROVED" | "REJECTED",
	adminNotes?: string,
	adminId = "admin-script",
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

		await db
			.update(doctorProfiles)
			.set({
				status,
				adminNotes: adminNotes || null,
				approvedAt: status === "APPROVED" ? new Date() : null,
				approvedBy: status !== "PENDING" ? adminId : null,
			})
			.where(eq(doctorProfiles.id, user.doctorProfile.id));

		console.log(
			`✅ Statut du médecin "Dr. ${user.doctorProfile.firstName} ${user.doctorProfile.lastName}" mis à jour: ${status}`,
		);

		if (adminNotes) {
			console.log(`📝 Notes: ${adminNotes}`);
		}

		return true;
	} catch (error) {
		console.error("❌ Erreur lors de la mise à jour médecin:", error);
		return false;
	}
}

/**
 * Affiche l'aide pour l'utilisation du script
 */
function showHelp() {
	console.log(`
🧪 Script d'administration pour la validation des cabinets et médecins

Commandes disponibles:
  list                    - Afficher tous les profils et leurs statuts
  list cabinets          - Afficher seulement les cabinets
  list doctors           - Afficher seulement les médecins
  
  cabinet approve <email> [notes] - Approuver un cabinet
  cabinet reject <email> [notes]  - Rejeter un cabinet 
  cabinet pending <email>         - Remettre un cabinet en attente
  
  doctor approve <email> [notes]  - Approuver un médecin
  doctor reject <email> [notes]   - Rejeter un médecin
  doctor pending <email>          - Remettre un médecin en attente

Exemples:
  bun scripts/admin-validation.ts list
  bun scripts/admin-validation.ts cabinet approve cabinet@example.com "Dossier complet"
  bun scripts/admin-validation.ts doctor reject doctor@example.com "Documents manquants"
	`);
}

/**
 * CLI principal - exécution en ligne de commande
 */
async function main() {
	const args = process.argv.slice(2);
	const command = args[0];
	const subCommand = args[1];

	if (!command) {
		showHelp();
		return;
	}

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

		case "cabinet": {
			const cabinetEmail = args[2];
			const cabinetNotes = args[3];

			if (!cabinetEmail) {
				console.log("❌ Email requis pour les opérations cabinet");
				console.log(
					"Usage: bun scripts/admin-validation.ts cabinet <action> <email> [notes]",
				);
				return;
			}

			if (subCommand === "approve") {
				await setCabinetStatus(
					cabinetEmail,
					"APPROVED",
					cabinetNotes || "Cabinet approuvé via script admin",
				);
			} else if (subCommand === "reject") {
				await setCabinetStatus(
					cabinetEmail,
					"REJECTED",
					cabinetNotes || "Cabinet rejeté via script admin",
				);
			} else if (subCommand === "pending") {
				await setCabinetStatus(cabinetEmail, "PENDING");
			} else {
				console.log("❌ Action cabinet non reconnue:", subCommand);
				console.log("Actions disponibles: approve, reject, pending");
			}
			break;
		}

		case "doctor": {
			const doctorEmail = args[2];
			const doctorNotes = args[3];

			if (!doctorEmail) {
				console.log("❌ Email requis pour les opérations médecin");
				console.log(
					"Usage: bun scripts/admin-validation.ts doctor <action> <email> [notes]",
				);
				return;
			}

			if (subCommand === "approve") {
				await setDoctorStatus(
					doctorEmail,
					"APPROVED",
					doctorNotes || "Médecin approuvé via script admin",
				);
			} else if (subCommand === "reject") {
				await setDoctorStatus(
					doctorEmail,
					"REJECTED",
					doctorNotes || "Médecin rejeté via script admin",
				);
			} else if (subCommand === "pending") {
				await setDoctorStatus(doctorEmail, "PENDING");
			} else {
				console.log("❌ Action médecin non reconnue:", subCommand);
				console.log("Actions disponibles: approve, reject, pending");
			}
			break;
		}

		case "help":
		case "-h":
		case "--help":
			showHelp();
			break;

		default:
			console.log("❌ Commande non reconnue:", command);
			showHelp();
	}
}

// Exporter les fonctions pour utilisation en tant que module
export { listCabinets, listDoctors, setCabinetStatus, setDoctorStatus };

// Si le script est exécuté directement
if (import.meta.main) {
	main().catch((error) => {
		console.error("❌ Erreur lors de l'exécution:", error);
		process.exit(1);
	});
}
