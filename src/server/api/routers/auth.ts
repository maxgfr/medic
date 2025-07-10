import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";
import {
	cabinetProfileSchema,
	doctorProfileSchema,
	registerApiSchema,
	updateCabinetProfileSchema,
	updateDoctorProfileSchema,
	userRoleSchema,
} from "~/lib/validations";
import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "~/server/api/trpc";
import { cabinetProfiles, doctorProfiles, users } from "~/server/db/schema";

export const authRouter = createTRPCRouter({
	// Register new user
	register: publicProcedure
		.input(registerApiSchema)
		.mutation(async ({ ctx, input }) => {
			// Check if user already exists
			const existingUser = await ctx.db.query.users.findFirst({
				where: eq(users.email, input.email),
			});

			if (existingUser) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "Un utilisateur avec cet email existe déjà",
				});
			}

			// Hash password
			const hashedPassword = await bcrypt.hash(input.password, 12);

			// Create user
			const [newUser] = await ctx.db
				.insert(users)
				.values({
					name: input.name,
					email: input.email,
					password: hashedPassword,
					role: input.role,
				})
				.returning();

			if (!newUser) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Erreur lors de la création du compte",
				});
			}

			return {
				success: true,
				message: "Compte créé avec succès",
				user: {
					id: newUser.id,
					email: newUser.email,
					name: newUser.name,
					role: newUser.role,
				},
			};
		}),

	// Get current user with profile
	getMe: protectedProcedure.query(async ({ ctx }) => {
		const user = await ctx.db.query.users.findFirst({
			where: eq(users.id, ctx.session.user.id),
			with: {
				cabinetProfile: true,
				doctorProfile: true,
			},
		});

		if (!user) {
			throw new Error("User not found");
		}

		return user;
	}),

	// Update user role (only if no profile exists yet)
	updateRole: protectedProcedure
		.input(z.object({ role: userRoleSchema }))
		.mutation(async ({ ctx, input }) => {
			const user = await ctx.db.query.users.findFirst({
				where: eq(users.id, ctx.session.user.id),
				with: {
					cabinetProfile: true,
					doctorProfile: true,
				},
			});

			if (!user) {
				throw new Error("User not found");
			}

			// Check if user already has a profile
			if (user.cabinetProfile || user.doctorProfile) {
				throw new Error("Cannot change role when profile already exists");
			}

			await ctx.db
				.update(users)
				.set({ role: input.role })
				.where(eq(users.id, ctx.session.user.id));

			return { success: true };
		}),

	// Create cabinet profile
	createCabinetProfile: protectedProcedure
		.input(cabinetProfileSchema)
		.mutation(async ({ ctx, input }) => {
			const user = await ctx.db.query.users.findFirst({
				where: eq(users.id, ctx.session.user.id),
				with: {
					cabinetProfile: true,
				},
			});

			if (!user) {
				throw new Error("User not found");
			}

			if (user.role !== "CABINET") {
				throw new Error(
					"User must have CABINET role to create cabinet profile",
				);
			}

			if (user.cabinetProfile) {
				throw new Error("Cabinet profile already exists");
			}

			const [cabinetProfile] = await ctx.db
				.insert(cabinetProfiles)
				.values({
					userId: ctx.session.user.id,
					...input,
				})
				.returning();

			return cabinetProfile;
		}),

	// Update cabinet profile
	updateCabinetProfile: protectedProcedure
		.input(updateCabinetProfileSchema)
		.mutation(async ({ ctx, input }) => {
			const user = await ctx.db.query.users.findFirst({
				where: eq(users.id, ctx.session.user.id),
				with: {
					cabinetProfile: true,
				},
			});

			if (!user?.cabinetProfile) {
				throw new Error("Cabinet profile not found");
			}

			const [updatedProfile] = await ctx.db
				.update(cabinetProfiles)
				.set(input)
				.where(eq(cabinetProfiles.userId, ctx.session.user.id))
				.returning();

			return updatedProfile;
		}),

	// Get cabinet profile
	getCabinetProfile: protectedProcedure.query(async ({ ctx }) => {
		const cabinetProfile = await ctx.db.query.cabinetProfiles.findFirst({
			where: eq(cabinetProfiles.userId, ctx.session.user.id),
			with: {
				user: true,
			},
		});

		if (!cabinetProfile) {
			throw new Error("Cabinet profile not found");
		}

		return cabinetProfile;
	}),

	// Create doctor profile
	createDoctorProfile: protectedProcedure
		.input(doctorProfileSchema)
		.mutation(async ({ ctx, input }) => {
			const user = await ctx.db.query.users.findFirst({
				where: eq(users.id, ctx.session.user.id),
				with: {
					doctorProfile: true,
				},
			});

			if (!user) {
				throw new Error("User not found");
			}

			if (user.role !== "DOCTOR") {
				throw new Error("User must have DOCTOR role to create doctor profile");
			}

			if (user.doctorProfile) {
				throw new Error("Doctor profile already exists");
			}

			const [doctorProfile] = await ctx.db
				.insert(doctorProfiles)
				.values({
					userId: ctx.session.user.id,
					...input,
					preferredRate: input.preferredRate?.toString(),
				})
				.returning();

			return doctorProfile;
		}),

	// Update doctor profile
	updateDoctorProfile: protectedProcedure
		.input(updateDoctorProfileSchema)
		.mutation(async ({ ctx, input }) => {
			const user = await ctx.db.query.users.findFirst({
				where: eq(users.id, ctx.session.user.id),
				with: {
					doctorProfile: true,
				},
			});

			if (!user?.doctorProfile) {
				throw new Error("Doctor profile not found");
			}

			const { preferredRate, ...otherFields } = input;
			const updateData = {
				...otherFields,
				...(preferredRate !== undefined && {
					preferredRate: preferredRate.toString(),
				}),
			};

			const [updatedProfile] = await ctx.db
				.update(doctorProfiles)
				.set(updateData)
				.where(eq(doctorProfiles.userId, ctx.session.user.id))
				.returning();

			return updatedProfile;
		}),

	// Get doctor profile
	getDoctorProfile: protectedProcedure.query(async ({ ctx }) => {
		const doctorProfile = await ctx.db.query.doctorProfiles.findFirst({
			where: eq(doctorProfiles.userId, ctx.session.user.id),
			with: {
				user: true,
			},
		});

		if (!doctorProfile) {
			throw new Error("Doctor profile not found");
		}

		return doctorProfile;
	}),

	// Check profile completion
	getProfileCompletion: protectedProcedure.query(async ({ ctx }) => {
		const user = await ctx.db.query.users.findFirst({
			where: eq(users.id, ctx.session.user.id),
			with: {
				cabinetProfile: true,
				doctorProfile: true,
			},
		});

		if (!user) {
			throw new Error("User not found");
		}

		let completionPercentage = 0;
		const requiredFields: string[] = [];
		const missingFields: string[] = [];

		if (user.role === "CABINET") {
			const profile = user.cabinetProfile;
			if (!profile) {
				return {
					completionPercentage: 0,
					missingFields: ["Complete profile setup"],
					isComplete: false,
				};
			}

			const fields = [
				{ name: "Cabinet name", value: profile.cabinetName },
				{ name: "Address", value: profile.address },
				{ name: "Phone", value: profile.phone },
				{
					name: "Specialties",
					value: profile.specialties && profile.specialties.length > 0,
				},
			];

			const completed = fields.filter((field) => field.value).length;
			completionPercentage = Math.round((completed / fields.length) * 100);

			for (const field of fields) {
				if (!field.value) missingFields.push(field.name);
			}
		} else if (user.role === "DOCTOR") {
			const profile = user.doctorProfile;
			if (!profile) {
				return {
					completionPercentage: 0,
					missingFields: ["Complete profile setup"],
					isComplete: false,
				};
			}

			const fields = [
				{ name: "First name", value: profile.firstName },
				{ name: "Last name", value: profile.lastName },
				{
					name: "Specialties",
					value: profile.specialties && profile.specialties.length > 0,
				},
				{ name: "Experience", value: profile.experienceYears >= 0 },
				{
					name: "Preferred location",
					value:
						profile.preferredLocations && profile.preferredLocations.length > 0,
				},
				{
					name: "Travel radius",
					value: (profile.preferredLocations?.[0]?.travelRadius ?? 0) > 0,
				},
				{ name: "Availability", value: profile.generalAvailability },
			];

			const completed = fields.filter((field) => field.value).length;
			completionPercentage = Math.round((completed / fields.length) * 100);

			for (const field of fields) {
				if (!field.value) missingFields.push(field.name);
			}
		}

		return {
			completionPercentage,
			missingFields,
			isComplete: completionPercentage === 100,
		};
	}),

	// Get all specialties
	getSpecialties: publicProcedure.query(async ({ ctx }) => {
		return await ctx.db.query.specialties.findMany({
			orderBy: (specialties, { asc }) => [
				asc(specialties.category),
				asc(specialties.name),
			],
		});
	}),
});
