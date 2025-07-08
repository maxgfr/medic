import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  notifications,
  doctorProfiles,
  cabinetProfiles,
} from "~/server/db/schema";
import { TRPCError } from "@trpc/server";
import { eq, and, desc } from "drizzle-orm";

type UserProfile =
  | {
      id: string;
      userId: string;
    }
  | undefined;

export const notificationsRouter = createTRPCRouter({
  // Get notifications for current user
  getNotifications: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
        unreadOnly: z.boolean().default(false),
      })
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
        return [];
      }

      const whereConditions = [eq(notifications.recipientId, userProfile.id)];

      if (input.unreadOnly) {
        whereConditions.push(eq(notifications.isRead, false));
      }

      const userNotifications = await ctx.db.query.notifications.findMany({
        where: and(...whereConditions),
        orderBy: [desc(notifications.createdAt)],
        limit: input.limit,
        offset: input.offset,
      });

      return userNotifications;
    }),

  // Mark notification as read
  markAsRead: protectedProcedure
    .input(z.object({ notificationId: z.string() }))
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

      // Verify notification ownership and mark as read
      const [updatedNotification] = await ctx.db
        .update(notifications)
        .set({
          isRead: true,
          readAt: new Date(),
        })
        .where(
          and(
            eq(notifications.id, input.notificationId),
            eq(notifications.recipientId, userProfile.id)
          )
        )
        .returning();

      if (!updatedNotification) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Notification non trouvée",
        });
      }

      return updatedNotification;
    }),

  // Mark all notifications as read
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
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

    await ctx.db
      .update(notifications)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(
        and(
          eq(notifications.recipientId, userProfile.id),
          eq(notifications.isRead, false)
        )
      );

    return { success: true };
  }),

  // Get unread count
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

    const unreadNotifications = await ctx.db.query.notifications.findMany({
      where: and(
        eq(notifications.recipientId, userProfile.id),
        eq(notifications.isRead, false)
      ),
    });

    return unreadNotifications.length;
  }),

  // Create notification (internal use)
  create: protectedProcedure
    .input(
      z.object({
        recipientId: z.string(),
        type: z.enum([
          "NEW_APPLICATION",
          "APPLICATION_ACCEPTED",
          "APPLICATION_REJECTED",
          "NEW_MESSAGE",
          "NEW_JOB_OFFER",
          "JOB_OFFER_UPDATED",
          "PROFILE_INCOMPLETE",
        ]),
        title: z.string(),
        message: z.string(),
        data: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [newNotification] = await ctx.db
        .insert(notifications)
        .values({
          recipientId: input.recipientId,
          type: input.type,
          title: input.title,
          message: input.message,
          data: input.data ?? {},
        })
        .returning();

      return newNotification;
    }),

  // Delete notification
  delete: protectedProcedure
    .input(z.object({ notificationId: z.string() }))
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

      const deletedNotification = await ctx.db
        .delete(notifications)
        .where(
          and(
            eq(notifications.id, input.notificationId),
            eq(notifications.recipientId, userProfile.id)
          )
        )
        .returning();

      if (!deletedNotification.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Notification non trouvée",
        });
      }

      return { success: true };
    }),
});
