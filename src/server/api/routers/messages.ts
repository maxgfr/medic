import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
	cabinetProfiles,
	conversations,
	doctorProfiles,
	jobOffers,
	messages,
	users,
} from "~/server/db/schema";

type UserProfile =
	| {
			id: string;
			userId: string;
	  }
	| undefined;

export const messagesRouter = createTRPCRouter({
	// Get all conversations for current user
	getConversations: protectedProcedure
		.input(
			z.object({
				limit: z.number().min(1).max(100).default(20),
				offset: z.number().min(0).default(0),
			}),
		)
		.query(async ({ ctx, input }) => {
			let userProfile: UserProfile = undefined;

			if (ctx.session.user.role === "CABINET") {
				userProfile = await ctx.db.query.cabinetProfiles.findFirst({
					where: eq(cabinetProfiles.userId, ctx.session.user.id),
				});
			} else if (ctx.session.user.role === "DOCTOR") {
				userProfile = await ctx.db.query.doctorProfiles.findFirst({
					where: eq(doctorProfiles.userId, ctx.session.user.id),
				});
			}

			if (!userProfile) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Profil utilisateur non trouvé",
				});
			}

			const whereCondition =
				ctx.session.user.role === "CABINET"
					? eq(conversations.cabinetId, userProfile.id)
					: eq(conversations.doctorId, userProfile.id);

			const userConversations = await ctx.db.query.conversations.findMany({
				where: whereCondition,
				orderBy: [desc(conversations.lastMessageAt)],
				limit: input.limit,
				offset: input.offset,
				with: {
					jobOffer: true,
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
					messages: {
						orderBy: [desc(messages.createdAt)],
						limit: 1, // Get only the last message for preview
						with: {
							sender: {
								columns: {
									name: true,
									role: true,
								},
							},
						},
					},
				},
			});

			return userConversations;
		}),

	// Get a specific conversation with messages
	getConversation: protectedProcedure
		.input(
			z.object({
				conversationId: z.string(),
				limit: z.number().min(1).max(100).default(50),
				offset: z.number().min(0).default(0),
			}),
		)
		.query(async ({ ctx, input }) => {
			let userProfile: UserProfile = undefined;

			if (ctx.session.user.role === "CABINET") {
				userProfile = await ctx.db.query.cabinetProfiles.findFirst({
					where: eq(cabinetProfiles.userId, ctx.session.user.id),
				});
			} else if (ctx.session.user.role === "DOCTOR") {
				userProfile = await ctx.db.query.doctorProfiles.findFirst({
					where: eq(doctorProfiles.userId, ctx.session.user.id),
				});
			}

			if (!userProfile) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Profil utilisateur non trouvé",
				});
			}

			// Get conversation with access check
			const conversation = await ctx.db.query.conversations.findFirst({
				where: and(
					eq(conversations.id, input.conversationId),
					ctx.session.user.role === "CABINET"
						? eq(conversations.cabinetId, userProfile.id)
						: eq(conversations.doctorId, userProfile.id),
				),
				with: {
					jobOffer: true,
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

			if (!conversation) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Conversation non trouvée",
				});
			}

			// Get messages for this conversation
			const conversationMessages = await ctx.db.query.messages.findMany({
				where: eq(messages.conversationId, input.conversationId),
				orderBy: [desc(messages.createdAt)],
				limit: input.limit,
				offset: input.offset,
				with: {
					sender: {
						columns: {
							name: true,
							role: true,
						},
					},
				},
			});

			return {
				...conversation,
				messages: conversationMessages.reverse(), // Reverse to show chronological order
			};
		}),

	// Create a new conversation (when accepting an application)
	createConversation: protectedProcedure
		.input(
			z.object({
				jobOfferId: z.string(),
				doctorId: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (ctx.session.user.role !== "CABINET") {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Seuls les cabinets peuvent créer des conversations",
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

			// Check if conversation already exists
			const existingConversation = await ctx.db.query.conversations.findFirst({
				where: and(
					eq(conversations.jobOfferId, input.jobOfferId),
					eq(conversations.cabinetId, cabinetProfile.id),
					eq(conversations.doctorId, input.doctorId),
				),
			});

			if (existingConversation) {
				return existingConversation;
			}

			// Create new conversation
			const [newConversation] = await ctx.db
				.insert(conversations)
				.values({
					jobOfferId: input.jobOfferId,
					cabinetId: cabinetProfile.id,
					doctorId: input.doctorId,
				})
				.returning();

			return newConversation;
		}),

	// Send a message
	sendMessage: protectedProcedure
		.input(
			z.object({
				conversationId: z.string(),
				content: z.string().min(1, "Le message ne peut pas être vide"),
				attachments: z.array(z.string()).optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			let userProfile: UserProfile = undefined;

			if (ctx.session.user.role === "CABINET") {
				userProfile = await ctx.db.query.cabinetProfiles.findFirst({
					where: eq(cabinetProfiles.userId, ctx.session.user.id),
				});
			} else if (ctx.session.user.role === "DOCTOR") {
				userProfile = await ctx.db.query.doctorProfiles.findFirst({
					where: eq(doctorProfiles.userId, ctx.session.user.id),
				});
			}

			if (!userProfile) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Profil utilisateur non trouvé",
				});
			}

			// Verify conversation access
			const conversation = await ctx.db.query.conversations.findFirst({
				where: and(
					eq(conversations.id, input.conversationId),
					ctx.session.user.role === "CABINET"
						? eq(conversations.cabinetId, userProfile.id)
						: eq(conversations.doctorId, userProfile.id),
				),
			});

			if (!conversation) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Conversation non trouvée ou non autorisée",
				});
			}

			// Create message - using senderId as user.id instead of profile.id
			const [newMessage] = await ctx.db
				.insert(messages)
				.values({
					conversationId: input.conversationId,
					content: input.content,
					senderId: ctx.session.user.id, // Use user.id directly
					attachments: input.attachments ?? [],
				})
				.returning();

			// Update conversation lastMessageAt
			await ctx.db
				.update(conversations)
				.set({
					lastMessageAt: new Date(),
					updatedAt: new Date(),
				})
				.where(eq(conversations.id, input.conversationId));

			return newMessage;
		}),

	// Mark messages as read
	markAsRead: protectedProcedure
		.input(
			z.object({
				conversationId: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			let userProfile: UserProfile = undefined;

			if (ctx.session.user.role === "CABINET") {
				userProfile = await ctx.db.query.cabinetProfiles.findFirst({
					where: eq(cabinetProfiles.userId, ctx.session.user.id),
				});
			} else if (ctx.session.user.role === "DOCTOR") {
				userProfile = await ctx.db.query.doctorProfiles.findFirst({
					where: eq(doctorProfiles.userId, ctx.session.user.id),
				});
			}

			if (!userProfile) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Profil utilisateur non trouvé",
				});
			}

			// Verify conversation access
			const conversation = await ctx.db.query.conversations.findFirst({
				where: and(
					eq(conversations.id, input.conversationId),
					ctx.session.user.role === "CABINET"
						? eq(conversations.cabinetId, userProfile.id)
						: eq(conversations.doctorId, userProfile.id),
				),
			});

			if (!conversation) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Conversation non trouvée",
				});
			}

			// Update conversation as "viewed"
			await ctx.db
				.update(conversations)
				.set({
					updatedAt: new Date(),
				})
				.where(eq(conversations.id, input.conversationId));

			return { success: true };
		}),

	// Archive/Unarchive conversation
	toggleArchive: protectedProcedure
		.input(
			z.object({
				conversationId: z.string(),
				isArchived: z.boolean(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			let userProfile: UserProfile = undefined;

			if (ctx.session.user.role === "CABINET") {
				userProfile = await ctx.db.query.cabinetProfiles.findFirst({
					where: eq(cabinetProfiles.userId, ctx.session.user.id),
				});
			} else if (ctx.session.user.role === "DOCTOR") {
				userProfile = await ctx.db.query.doctorProfiles.findFirst({
					where: eq(doctorProfiles.userId, ctx.session.user.id),
				});
			}

			if (!userProfile) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Profil utilisateur non trouvé",
				});
			}

			// Verify conversation access and update
			const [updatedConversation] = await ctx.db
				.update(conversations)
				.set({
					isArchived: input.isArchived,
					updatedAt: new Date(),
				})
				.where(
					and(
						eq(conversations.id, input.conversationId),
						ctx.session.user.role === "CABINET"
							? eq(conversations.cabinetId, userProfile.id)
							: eq(conversations.doctorId, userProfile.id),
					),
				)
				.returning();

			if (!updatedConversation) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Conversation non trouvée",
				});
			}

			return updatedConversation;
		}),

	// Get unread message count
	getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
		let userProfile: UserProfile = undefined;

		if (ctx.session.user.role === "CABINET") {
			userProfile = await ctx.db.query.cabinetProfiles.findFirst({
				where: eq(cabinetProfiles.userId, ctx.session.user.id),
			});
		} else if (ctx.session.user.role === "DOCTOR") {
			userProfile = await ctx.db.query.doctorProfiles.findFirst({
				where: eq(doctorProfiles.userId, ctx.session.user.id),
			});
		}

		if (!userProfile) {
			return 0;
		}

		// Get conversations for this user
		const userConversations = await ctx.db.query.conversations.findMany({
			where:
				ctx.session.user.role === "CABINET"
					? eq(conversations.cabinetId, userProfile.id)
					: eq(conversations.doctorId, userProfile.id),
			with: {
				messages: {
					orderBy: [desc(messages.createdAt)],
					limit: 1,
					with: {
						sender: {
							columns: {
								id: true,
							},
						},
					},
				},
			},
		});

		// Count conversations with recent messages from the other party
		let unreadCount = 0;
		for (const conversation of userConversations) {
			const lastMessage = conversation.messages[0];
			if (lastMessage) {
				// If the last message was sent by someone else, consider it unread
				const isFromOtherParty = lastMessage.sender.id !== ctx.session.user.id;

				if (isFromOtherParty) {
					unreadCount++;
				}
			}
		}

		return unreadCount;
	}),
});
