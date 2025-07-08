import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  applications,
  jobOffers,
  doctorProfiles,
  cabinetProfiles,
  conversations,
  messages,
} from "~/server/db/schema";
import { TRPCError } from "@trpc/server";
import { eq, and, desc, gte, count, sql } from "drizzle-orm";

type UserProfile =
  | {
      id: string;
      userId: string;
    }
  | undefined;

export const analyticsRouter = createTRPCRouter({
  // Get dashboard stats for cabinets
  getCabinetStats: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.session.user.role !== "CABINET") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Accès réservé aux cabinets",
      });
    }

    const cabinetProfile = await ctx.db.query.cabinetProfiles.findFirst({
      where: eq(cabinetProfiles.userId, ctx.session.user.id),
    });

    if (!cabinetProfile) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Profil cabinet non trouvé",
      });
    }

    // Get counts for different metrics
    const [
      totalJobOffers,
      activeJobOffers,
      totalApplications,
      pendingApplications,
      acceptedApplications,
      activeConversations,
    ] = await Promise.all([
      // Total job offers
      ctx.db
        .select({ count: count() })
        .from(jobOffers)
        .where(eq(jobOffers.cabinetId, cabinetProfile.id)),

      // Active job offers
      ctx.db
        .select({ count: count() })
        .from(jobOffers)
        .where(
          and(
            eq(jobOffers.cabinetId, cabinetProfile.id),
            eq(jobOffers.status, "PUBLISHED")
          )
        ),

      // Total applications
      ctx.db
        .select({ count: count() })
        .from(applications)
        .innerJoin(jobOffers, eq(applications.jobOfferId, jobOffers.id))
        .where(eq(jobOffers.cabinetId, cabinetProfile.id)),

      // Pending applications
      ctx.db
        .select({ count: count() })
        .from(applications)
        .innerJoin(jobOffers, eq(applications.jobOfferId, jobOffers.id))
        .where(
          and(
            eq(jobOffers.cabinetId, cabinetProfile.id),
            eq(applications.status, "SENT")
          )
        ),

      // Accepted applications
      ctx.db
        .select({ count: count() })
        .from(applications)
        .innerJoin(jobOffers, eq(applications.jobOfferId, jobOffers.id))
        .where(
          and(
            eq(jobOffers.cabinetId, cabinetProfile.id),
            eq(applications.status, "ACCEPTED")
          )
        ),

      // Active conversations
      ctx.db
        .select({ count: count() })
        .from(conversations)
        .where(
          and(
            eq(conversations.cabinetId, cabinetProfile.id),
            eq(conversations.isArchived, false)
          )
        ),
    ]);

    return {
      totalJobOffers: totalJobOffers[0]?.count ?? 0,
      activeJobOffers: activeJobOffers[0]?.count ?? 0,
      totalApplications: totalApplications[0]?.count ?? 0,
      pendingApplications: pendingApplications[0]?.count ?? 0,
      acceptedApplications: acceptedApplications[0]?.count ?? 0,
      activeConversations: activeConversations[0]?.count ?? 0,
    };
  }),

  // Get dashboard stats for doctors
  getDoctorStats: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.session.user.role !== "DOCTOR") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Accès réservé aux médecins",
      });
    }

    const doctorProfile = await ctx.db.query.doctorProfiles.findFirst({
      where: eq(doctorProfiles.userId, ctx.session.user.id),
    });

    if (!doctorProfile) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Profil médecin non trouvé",
      });
    }

    // Get counts for different metrics
    const [
      totalApplications,
      pendingApplications,
      acceptedApplications,
      rejectedApplications,
      activeConversations,
      availableJobOffers,
    ] = await Promise.all([
      // Total applications
      ctx.db
        .select({ count: count() })
        .from(applications)
        .where(eq(applications.doctorId, doctorProfile.id)),

      // Pending applications
      ctx.db
        .select({ count: count() })
        .from(applications)
        .where(
          and(
            eq(applications.doctorId, doctorProfile.id),
            eq(applications.status, "SENT")
          )
        ),

      // Accepted applications
      ctx.db
        .select({ count: count() })
        .from(applications)
        .where(
          and(
            eq(applications.doctorId, doctorProfile.id),
            eq(applications.status, "ACCEPTED")
          )
        ),

      // Rejected applications
      ctx.db
        .select({ count: count() })
        .from(applications)
        .where(
          and(
            eq(applications.doctorId, doctorProfile.id),
            eq(applications.status, "REJECTED")
          )
        ),

      // Active conversations
      ctx.db
        .select({ count: count() })
        .from(conversations)
        .where(
          and(
            eq(conversations.doctorId, doctorProfile.id),
            eq(conversations.isArchived, false)
          )
        ),

      // Available job offers (based on doctor's specialties)
      ctx.db
        .select({ count: count() })
        .from(jobOffers)
        .where(
          and(
            eq(jobOffers.status, "PUBLISHED"),
            // This is a simplified check - in practice you'd want to match specialties
            gte(
              jobOffers.createdAt,
              new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            ) // Last 30 days
          )
        ),
    ]);

    return {
      totalApplications: totalApplications[0]?.count ?? 0,
      pendingApplications: pendingApplications[0]?.count ?? 0,
      acceptedApplications: acceptedApplications[0]?.count ?? 0,
      rejectedApplications: rejectedApplications[0]?.count ?? 0,
      activeConversations: activeConversations[0]?.count ?? 0,
      availableJobOffers: availableJobOffers[0]?.count ?? 0,
    };
  }),

  // Get recent activity for cabinet
  getCabinetRecentActivity: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(20).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "CABINET") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Accès réservé aux cabinets",
        });
      }

      const cabinetProfile = await ctx.db.query.cabinetProfiles.findFirst({
        where: eq(cabinetProfiles.userId, ctx.session.user.id),
      });

      if (!cabinetProfile) {
        return [];
      }

      // Get recent applications
      const recentApplications = await ctx.db.query.applications.findMany({
        where: sql`${jobOffers.cabinetId} = ${cabinetProfile.id}`,
        orderBy: [desc(applications.createdAt)],
        limit: input.limit,
        with: {
          jobOffer: true,
          doctor: {
            with: {
              user: {
                columns: {
                  name: true,
                },
              },
            },
          },
        },
      });

      return recentApplications.map((app) => ({
        id: app.id,
        type: "application" as const,
        title: `Nouvelle candidature de Dr. ${app.doctor.firstName} ${app.doctor.lastName}`,
        description: `Pour l'annonce "${app.jobOffer.title}"`,
        status: app.status,
        createdAt: app.createdAt,
        jobOfferId: app.jobOfferId,
        doctorId: app.doctorId,
      }));
    }),

  // Get recent activity for doctor
  getDoctorRecentActivity: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(20).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "DOCTOR") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Accès réservé aux médecins",
        });
      }

      const doctorProfile = await ctx.db.query.doctorProfiles.findFirst({
        where: eq(doctorProfiles.userId, ctx.session.user.id),
      });

      if (!doctorProfile) {
        return [];
      }

      // Get recent application status changes
      const recentApplications = await ctx.db.query.applications.findMany({
        where: eq(applications.doctorId, doctorProfile.id),
        orderBy: [desc(applications.updatedAt)],
        limit: input.limit,
        with: {
          jobOffer: {
            with: {
              cabinet: {
                with: {
                  user: {
                    columns: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      return recentApplications.map((app) => ({
        id: app.id,
        type: "application" as const,
        title: `Candidature ${
          app.status === "ACCEPTED"
            ? "acceptée"
            : app.status === "REJECTED"
            ? "refusée"
            : app.status === "VIEWED"
            ? "vue"
            : "envoyée"
        }`,
        description: `Pour l'annonce "${app.jobOffer.title}" chez ${app.jobOffer.cabinet.user.name}`,
        status: app.status,
        createdAt: app.updatedAt,
        jobOfferId: app.jobOfferId,
        cabinetId: app.jobOffer.cabinetId,
      }));
    }),

  // Get application trends (for charts)
  getApplicationTrends: protectedProcedure
    .input(
      z.object({
        days: z.number().min(7).max(90).default(30),
      })
    )
    .query(async ({ ctx, input }) => {
      let userProfile: UserProfile = undefined;
      let isDoctor = false;

      if (ctx.session.user.role === "CABINET") {
        userProfile = await ctx.db.query.cabinetProfiles.findFirst({
          where: eq(cabinetProfiles.userId, ctx.session.user.id),
        });
      } else if (ctx.session.user.role === "DOCTOR") {
        userProfile = await ctx.db.query.doctorProfiles.findFirst({
          where: eq(doctorProfiles.userId, ctx.session.user.id),
        });
        isDoctor = true;
      }

      if (!userProfile) {
        return [];
      }

      const startDate = new Date(Date.now() - input.days * 24 * 60 * 60 * 1000);

      // Get applications grouped by date
      const applicationsQuery = isDoctor
        ? ctx.db
            .select({
              date: sql<string>`DATE(${applications.createdAt})`,
              count: count(),
              status: applications.status,
            })
            .from(applications)
            .where(
              and(
                eq(applications.doctorId, userProfile.id),
                gte(applications.createdAt, startDate)
              )
            )
            .groupBy(sql`DATE(${applications.createdAt})`, applications.status)
        : ctx.db
            .select({
              date: sql<string>`DATE(${applications.createdAt})`,
              count: count(),
              status: applications.status,
            })
            .from(applications)
            .innerJoin(jobOffers, eq(applications.jobOfferId, jobOffers.id))
            .where(
              and(
                eq(jobOffers.cabinetId, userProfile.id),
                gte(applications.createdAt, startDate)
              )
            )
            .groupBy(sql`DATE(${applications.createdAt})`, applications.status);

      const results = await applicationsQuery;

      return results;
    }),
});
