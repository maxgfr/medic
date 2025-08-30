import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { applicationSchema } from "~/lib/validations";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
	applications,
	cabinetProfiles,
	conversations,
	doctorProfiles,
	jobOffers,
	notifications,
} from "~/server/db/schema";

export const applicationsRouter = createTRPCRouter({
	// Create a new application (Doctor only)
	create: protectedProcedure
		.input(applicationSchema)
		.mutation(async ({ ctx, input }) => {
			if (ctx.session.user.role !== "DOCTOR") {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Seuls les médecins peuvent postuler",
				});
			}

			// Get doctor profile
			const doctorProfile = await ctx.db.query.doctorProfiles.findFirst({
				where: eq(doctorProfiles.userId, ctx.session.user.id),
			});

			if (!doctorProfile) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Profil médecin non trouvé",
				});
			}

			// Verify job offer exists and is published
			const jobOffer = await ctx.db.query.jobOffers.findFirst({
				where: eq(jobOffers.id, input.jobOfferId),
			});

			if (!jobOffer) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Annonce non trouvée",
				});
			}

			if (jobOffer.status !== "PUBLISHED") {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Cette annonce n'est plus disponible",
				});
			}

			// Check if already applied
			const existingApplication = await ctx.db.query.applications.findFirst({
				where: and(
					eq(applications.jobOfferId, input.jobOfferId),
					eq(applications.doctorId, doctorProfile.id),
				),
			});

			if (existingApplication) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Vous avez déjà postulé à cette annonce",
				});
			}

			// Create application
			const [newApplication] = await ctx.db
				.insert(applications)
				.values({
					jobOfferId: input.jobOfferId,
					doctorId: doctorProfile.id,
					motivationLetter: input.motivationLetter,
					attachments: input.attachments ?? [],
					status: "SENT",
				})
				.returning();

			// Create notification for cabinet
			if (newApplication) {
				await ctx.db.insert(notifications).values({
					recipientId: jobOffer.cabinetId,
					type: "NEW_APPLICATION",
					title: "Nouvelle candidature",
					message: `Dr. ${doctorProfile.firstName} ${doctorProfile.lastName} a postulé pour l'annonce "${jobOffer.title}"`,
					data: {
						applicationId: newApplication.id,
						jobOfferId: input.jobOfferId,
						doctorId: doctorProfile.id,
					},
				});
			}

			return newApplication;
		}),

	// Get applications by doctor (Doctor only)
	getByDoctor: protectedProcedure
		.input(
			z.object({
				status: z.enum(["SENT", "VIEWED", "ACCEPTED", "REJECTED"]).optional(),
				limit: z.number().min(1).max(100).default(10),
				offset: z.number().min(0).default(0),
			}),
		)
		.query(async ({ ctx, input }) => {
			if (ctx.session.user.role !== "DOCTOR") {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Seuls les médecins peuvent voir leurs candidatures",
				});
			}

			// Get doctor profile
			const doctorProfile = await ctx.db.query.doctorProfiles.findFirst({
				where: eq(doctorProfiles.userId, ctx.session.user.id),
			});

			if (!doctorProfile) {
				return []; // Return empty array when profile doesn't exist yet
			}

			const whereConditions = [eq(applications.doctorId, doctorProfile.id)];

			if (input.status) {
				whereConditions.push(eq(applications.status, input.status));
			}

			const doctorApplications = await ctx.db.query.applications.findMany({
				where: and(...whereConditions),
				orderBy: [desc(applications.createdAt)],
				limit: input.limit,
				offset: input.offset,
				with: {
					jobOffer: {
						with: {
							cabinet: {
								with: {
									user: {
										columns: {
											name: true,
											email: true,
										},
									},
								},
							},
						},
					},
				},
			});

			return doctorApplications;
		}),

	// Get applications for a job offer (Cabinet only)
	getByJobOffer: protectedProcedure
		.input(
			z.object({
				jobOfferId: z.string(),
				status: z.enum(["SENT", "VIEWED", "ACCEPTED", "REJECTED"]).optional(),
				limit: z.number().min(1).max(100).default(10),
				offset: z.number().min(0).default(0),
			}),
		)
		.query(async ({ ctx, input }) => {
			if (ctx.session.user.role !== "CABINET") {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Seuls les cabinets peuvent voir les candidatures",
				});
			}

			// Get cabinet profile
			const cabinetProfile = await ctx.db.query.cabinetProfiles.findFirst({
				where: eq(cabinetProfiles.userId, ctx.session.user.id),
			});

			if (!cabinetProfile) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Profil cabinet non trouvé",
				});
			}

			// Verify job offer ownership
			const jobOffer = await ctx.db.query.jobOffers.findFirst({
				where: eq(jobOffers.id, input.jobOfferId),
			});

			if (!jobOffer || jobOffer.cabinetId !== cabinetProfile.id) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Annonce non trouvée ou non autorisée",
				});
			}

			const whereConditions = [eq(applications.jobOfferId, input.jobOfferId)];

			if (input.status) {
				whereConditions.push(eq(applications.status, input.status));
			}

			const jobApplications = await ctx.db.query.applications.findMany({
				where: and(...whereConditions),
				orderBy: [desc(applications.createdAt)],
				limit: input.limit,
				offset: input.offset,
				with: {
					doctor: {
						with: {
							user: {
								columns: {
									name: true,
									email: true,
								},
							},
						},
					},
				},
			});

			return jobApplications;
		}),

	// Get all applications for cabinet (Cabinet only)
	getByCabinet: protectedProcedure
		.input(
			z.object({
				status: z.enum(["SENT", "VIEWED", "ACCEPTED", "REJECTED"]).optional(),
				limit: z.number().min(1).max(100).default(10),
				offset: z.number().min(0).default(0),
			}),
		)
		.query(async ({ ctx, input }) => {
			if (ctx.session.user.role !== "CABINET") {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Seuls les cabinets peuvent voir les candidatures",
				});
			}

			// Get cabinet profile
			const cabinetProfile = await ctx.db.query.cabinetProfiles.findFirst({
				where: eq(cabinetProfiles.userId, ctx.session.user.id),
			});

			if (!cabinetProfile) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Profil cabinet non trouvé",
				});
			}

			// Use proper JOIN to get applications for cabinet's job offers
			const cabinetApplications = await ctx.db
				.select({
					id: applications.id,
					status: applications.status,
					createdAt: applications.createdAt,
					updatedAt: applications.updatedAt,
					jobOfferId: applications.jobOfferId,
					doctorId: applications.doctorId,
					motivationLetter: applications.motivationLetter,
					attachments: applications.attachments,
					jobOffer: {
						id: jobOffers.id,
						title: jobOffers.title,
						specialty: jobOffers.specialty,
						location: jobOffers.location,
						startDate: jobOffers.startDate,
						endDate: jobOffers.endDate,
						retrocessionRate: jobOffers.retrocessionRate,
						type: jobOffers.type,
						description: jobOffers.description,
						status: jobOffers.status,
						cabinetId: jobOffers.cabinetId,
					},
					doctor: {
						id: doctorProfiles.id,
						firstName: doctorProfiles.firstName,
						lastName: doctorProfiles.lastName,
						specialties: doctorProfiles.specialties,
						experienceYears: doctorProfiles.experienceYears,
						userId: doctorProfiles.userId,
					},
				})
				.from(applications)
				.innerJoin(jobOffers, eq(applications.jobOfferId, jobOffers.id))
				.innerJoin(doctorProfiles, eq(applications.doctorId, doctorProfiles.id))
				.where(
					input.status
						? and(
								eq(jobOffers.cabinetId, cabinetProfile.id),
								eq(applications.status, input.status),
							)
						: eq(jobOffers.cabinetId, cabinetProfile.id),
				)
				.orderBy(desc(applications.createdAt))
				.limit(input.limit)
				.offset(input.offset);

			return cabinetApplications;
		}),

	// Update application status (Cabinet only)
	updateStatus: protectedProcedure
		.input(
			z.object({
				applicationId: z.string(),
				status: z.enum(["VIEWED", "ACCEPTED", "REJECTED"]),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (ctx.session.user.role !== "CABINET") {
				throw new TRPCError({
					code: "FORBIDDEN",
					message:
						"Seuls les cabinets peuvent modifier le statut des candidatures",
				});
			}

			// Get cabinet profile
			const cabinetProfile = await ctx.db.query.cabinetProfiles.findFirst({
				where: eq(cabinetProfiles.userId, ctx.session.user.id),
			});

			if (!cabinetProfile) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Profil cabinet non trouvé",
				});
			}

			// Get application with job offer to verify ownership
			const application = await ctx.db.query.applications.findFirst({
				where: eq(applications.id, input.applicationId),
				with: {
					jobOffer: true,
				},
			});

			if (!application) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Candidature non trouvée",
				});
			}

			if (application.jobOffer.cabinetId !== cabinetProfile.id) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Non autorisé à modifier cette candidature",
				});
			}

			// Update application status
			const [updatedApplication] = await ctx.db
				.update(applications)
				.set({
					status: input.status,
					updatedAt: new Date(),
				})
				.where(eq(applications.id, input.applicationId))
				.returning();

			// Create notification for doctor about status change
			if (input.status === "ACCEPTED" || input.status === "REJECTED") {
				await ctx.db.insert(notifications).values({
					recipientId: application.doctorId,
					type:
						input.status === "ACCEPTED"
							? "APPLICATION_ACCEPTED"
							: "APPLICATION_REJECTED",
					title:
						input.status === "ACCEPTED"
							? "Candidature acceptée !"
							: "Candidature refusée",
					message:
						input.status === "ACCEPTED"
							? `Votre candidature pour "${application.jobOffer.title}" a été acceptée. Vous pouvez maintenant communiquer avec le cabinet.`
							: `Votre candidature pour "${application.jobOffer.title}" a été refusée.`,
					data: {
						applicationId: application.id,
						jobOfferId: application.jobOffer.id,
						cabinetId: cabinetProfile.id,
					},
				});
			}

			// If application is accepted, create a conversation
			if (input.status === "ACCEPTED") {
				// Check if conversation already exists
				const existingConversation = await ctx.db.query.conversations.findFirst(
					{
						where: and(
							eq(conversations.jobOfferId, application.jobOffer.id),
							eq(conversations.cabinetId, cabinetProfile.id),
							eq(conversations.doctorId, application.doctorId),
						),
					},
				);

				if (!existingConversation) {
					await ctx.db.insert(conversations).values({
						jobOfferId: application.jobOffer.id,
						cabinetId: cabinetProfile.id,
						doctorId: application.doctorId,
					});
				}
			}

			return updatedApplication;
		}),

	// Get application by ID (for both roles)
	getById: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const application = await ctx.db.query.applications.findFirst({
				where: eq(applications.id, input.id),
				with: {
					jobOffer: {
						with: {
							cabinet: {
								with: {
									user: {
										columns: {
											name: true,
											email: true,
										},
									},
								},
							},
						},
					},
					doctor: {
						with: {
							user: {
								columns: {
									name: true,
									email: true,
								},
							},
						},
					},
				},
			});

			if (!application) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Candidature non trouvée",
				});
			}

			// Verify access rights
			if (ctx.session.user.role === "DOCTOR") {
				const doctorProfile = await ctx.db.query.doctorProfiles.findFirst({
					where: eq(doctorProfiles.userId, ctx.session.user.id),
				});

				if (!doctorProfile || application.doctorId !== doctorProfile.id) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "Non autorisé à voir cette candidature",
					});
				}
			} else if (ctx.session.user.role === "CABINET") {
				const cabinetProfile = await ctx.db.query.cabinetProfiles.findFirst({
					where: eq(cabinetProfiles.userId, ctx.session.user.id),
				});

				if (
					!cabinetProfile ||
					application.jobOffer.cabinetId !== cabinetProfile.id
				) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "Non autorisé à voir cette candidature",
					});
				}
			}

			return application;
		}),

	// Get application statistics for cabinet
	getStats: protectedProcedure.query(async ({ ctx }) => {
		if (ctx.session.user.role !== "CABINET") {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "Seuls les cabinets peuvent voir les statistiques",
			});
		}

		// Get cabinet profile
		const cabinetProfile = await ctx.db.query.cabinetProfiles.findFirst({
			where: eq(cabinetProfiles.userId, ctx.session.user.id),
		});

		if (!cabinetProfile) {
			return []; // Return empty array when profile doesn't exist yet
		}

		// Get all applications for this cabinet's job offers
		const allApplications = await ctx.db
			.select()
			.from(applications)
			.innerJoin(jobOffers, eq(applications.jobOfferId, jobOffers.id))
			.where(eq(jobOffers.cabinetId, cabinetProfile.id));

		const stats = {
			total: allApplications.length,
			sent: allApplications.filter((app) => app.application.status === "SENT")
				.length,
			viewed: allApplications.filter(
				(app) => app.application.status === "VIEWED",
			).length,
			accepted: allApplications.filter(
				(app) => app.application.status === "ACCEPTED",
			).length,
			rejected: allApplications.filter(
				(app) => app.application.status === "REJECTED",
			).length,
		};

		return stats;
	}),
});
