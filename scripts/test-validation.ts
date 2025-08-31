import { eq } from "drizzle-orm";
/**
 * Script de test pour la fonctionnalité de validation des cabinets et médecins
 * Ce script permet de tester manuellement les différents statuts de validation
 */
import { db } from "../src/server/db";
import {
	cabinetProfiles,
	doctorProfiles,
	users,
} from "../src/server/db/schema";

async function testCabinetValidation() {
	console.log("🏥 Test de la fonctionnalité de validation des cabinets");

	try {
		// Rechercher tous les cabinets existants
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
		console.error("❌ Erreur lors du test cabinets:", error);
	}
}

async function testDoctorValidation() {
	console.log("👨‍⚕️ Test de la fonctionnalité de validation des médecins");

	try {
		// Rechercher tous les médecins existants
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
		console.error("❌ Erreur lors du test médecins:", error);
	}
}

async function setCabinetStatus(
	email: string,
	status: "PENDING" | "APPROVED" | "REJECTED",
	adminNotes?: string,
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
			return;
		}

		await db
			.update(cabinetProfiles)
			.set({
				status,
				adminNotes: adminNotes || null,
				approvedAt: status === "APPROVED" ? new Date() : null,
				approvedBy: status !== "PENDING" ? "test-admin" : null,
			})
			.where(eq(cabinetProfiles.id, user.cabinetProfile.id));

		console.log(
			`✅ Statut du cabinet ${user.cabinetProfile.cabinetName} mis à jour: ${status}`,
		);
	} catch (error) {
		console.error("❌ Erreur lors de la mise à jour cabinet:", error);
	}
}

async function setDoctorStatus(
	email: string,
	status: "PENDING" | "APPROVED" | "REJECTED",
	adminNotes?: string,
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
			return;
		}

		await db
			.update(doctorProfiles)
			.set({
				status,
				adminNotes: adminNotes || null,
				approvedAt: status === "APPROVED" ? new Date() : null,
				approvedBy: status !== "PENDING" ? "test-admin" : null,
			})
			.where(eq(doctorProfiles.id, user.doctorProfile.id));

		console.log(
			`✅ Statut du médecin Dr. ${user.doctorProfile.firstName} ${user.doctorProfile.lastName} mis à jour: ${status}`,
		);
	} catch (error) {
		console.error("❌ Erreur lors de la mise à jour médecin:", error);
	}
}

// Si le script est exécuté directement
if (require.main === module) {
	const args = process.argv.slice(2);
	const command = args[0];
	const subCommand = args[1];

	switch (command) {
		case "list":
			if (subCommand === "cabinets") {
				testCabinetValidation();
			} else if (subCommand === "doctors") {
				testDoctorValidation();
			} else {
				console.log("🏥 === CABINETS ===");
				testCabinetValidation().then(() => {
					console.log("\n👨‍⚕️ === MÉDECINS ===");
					testDoctorValidation();
				});
			}
			break;
		case "cabinet":
			if (args[1] === "approve" && args[2]) {
				setCabinetStatus(args[2], "APPROVED", "Cabinet approuvé pour test");
			} else if (args[1] === "reject" && args[2]) {
				setCabinetStatus(
					args[2],
					"REJECTED",
					"Cabinet rejeté pour test - informations manquantes",
				);
			} else if (args[1] === "pending" && args[2]) {
				setCabinetStatus(args[2], "PENDING");
			} else {
				console.log(`
Usage cabinet:
  bun scripts/test-validation.ts cabinet approve <email>
  bun scripts/test-validation.ts cabinet reject <email>
  bun scripts/test-validation.ts cabinet pending <email>
				`);
			}
			break;
		case "doctor":
			if (args[1] === "approve" && args[2]) {
				setDoctorStatus(args[2], "APPROVED", "Médecin approuvé pour test");
			} else if (args[1] === "reject" && args[2]) {
				setDoctorStatus(
					args[2],
					"REJECTED",
					"Médecin rejeté pour test - documents manquants",
				);
			} else if (args[1] === "pending" && args[2]) {
				setDoctorStatus(args[2], "PENDING");
			} else {
				console.log(`
Usage médecin:
  bun scripts/test-validation.ts doctor approve <email>
  bun scripts/test-validation.ts doctor reject <email>
  bun scripts/test-validation.ts doctor pending <email>
				`);
			}
			break;
		default:
			console.log(`
🧪 Script de test pour la validation des cabinets et médecins

Commandes disponibles:
  list                    - Afficher tous les profils et leurs statuts
  list cabinets          - Afficher seulement les cabinets
  list doctors           - Afficher seulement les médecins
  
  cabinet approve <email> - Approuver un cabinet
  cabinet reject <email>  - Rejeter un cabinet 
  cabinet pending <email> - Remettre un cabinet en attente
  
  doctor approve <email>  - Approuver un médecin
  doctor reject <email>   - Rejeter un médecin
  doctor pending <email>  - Remettre un médecin en attente

Exemples:
  bun scripts/test-validation.ts list
  bun scripts/test-validation.ts cabinet approve cabinet@example.com
  bun scripts/test-validation.ts doctor reject doctor@example.com
			`);
	}
}

export {
	testCabinetValidation,
	testDoctorValidation,
	setCabinetStatus,
	setDoctorStatus,
};
