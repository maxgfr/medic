import { MEDICAL_SPECIALTIES } from "~/lib/constants";
import { db } from "~/server/db";
import { specialties } from "~/server/db/schema";

async function seed() {
	console.log("🌱 Seeding database...");

	try {
		// Insert medical specialties
		console.log("📋 Inserting medical specialties...");

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

		console.log(
			`✅ Inserted ${MEDICAL_SPECIALTIES.length} medical specialties`,
		);
		console.log("🎉 Database seeded successfully!");
	} catch (error) {
		console.error("❌ Error seeding database:", error);
		process.exit(1);
	}
}

// Run the seed function
seed()
	.then(() => {
		console.log("🏁 Seeding completed");
		process.exit(0);
	})
	.catch((error) => {
		console.error("💥 Seeding failed:", error);
		process.exit(1);
	});
