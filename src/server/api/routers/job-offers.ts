import { z } from "zod";
import { eq, desc, and, gte, lte, ilike, sql } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  jobOffers,
  cabinetProfiles,
  applications,
  doctorProfiles,
} from "~/server/db/schema";
import {
  jobOfferSchema,
  jobOfferStatusSchema,
  jobOfferTypeSchema,
  updateJobOfferSchema,
} from "~/lib/validations";
import { TRPCError } from "@trpc/server";

export const jobOffersRouter = createTRPCRouter({
  // Create a new job offer (Cabinet only)
  create: protectedProcedure
    .input(jobOfferSchema)
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "CABINET") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Seuls les cabinets peuvent créer des annonces",
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

      // Convert retrocessionRate to string for database
      const { retrocessionRate, ...rest } = input;

      // Create job offer
      const [jobOffer] = await ctx.db
        .insert(jobOffers)
        .values({
          ...rest,
          cabinetId: cabinetProfile.id,
          retrocessionRate: retrocessionRate.toString(),
        })
        .returning();

      return jobOffer;
    }),

  // Update a job offer (Cabinet only)
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: updateJobOfferSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "CABINET") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Seuls les cabinets peuvent modifier des annonces",
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

      // Verify ownership
      const jobOffer = await ctx.db.query.jobOffers.findFirst({
        where: eq(jobOffers.id, input.id),
      });

      if (!jobOffer || jobOffer.cabinetId !== cabinetProfile.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Annonce non trouvée ou non autorisée",
        });
      }

      // Convert retrocessionRate to string if provided
      const { retrocessionRate, ...restUpdateData } = input.data;
      const updateData = {
        ...restUpdateData,
        ...(retrocessionRate && {
          retrocessionRate: retrocessionRate.toString(),
        }),
      };

      // Update job offer
      const [updatedJobOffer] = await ctx.db
        .update(jobOffers)
        .set(updateData)
        .where(eq(jobOffers.id, input.id))
        .returning();

      return updatedJobOffer;
    }),

  // Delete a job offer (Cabinet only)
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "CABINET") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Seuls les cabinets peuvent supprimer des annonces",
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

      // Verify ownership
      const jobOffer = await ctx.db.query.jobOffers.findFirst({
        where: eq(jobOffers.id, input.id),
      });

      if (!jobOffer || jobOffer.cabinetId !== cabinetProfile.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Annonce non trouvée ou non autorisée",
        });
      }

      // Delete job offer
      await ctx.db.delete(jobOffers).where(eq(jobOffers.id, input.id));

      return { success: true };
    }),

  // Get a single job offer by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const jobOffer = await ctx.db.query.jobOffers.findFirst({
        where: eq(jobOffers.id, input.id),
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
          applications: {
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
          },
        },
      });

      if (!jobOffer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Annonce non trouvée",
        });
      }

      return jobOffer;
    }),

  // Get all job offers for a cabinet (Cabinet only)
  getByCabinet: protectedProcedure
    .input(
      z.object({
        status: jobOfferStatusSchema.optional(),
        limit: z.number().min(1).max(100).default(10),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "CABINET") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Seuls les cabinets peuvent voir leurs annonces",
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

      const whereConditions = [eq(jobOffers.cabinetId, cabinetProfile.id)];

      if (input.status) {
        whereConditions.push(eq(jobOffers.status, input.status));
      }

      const jobOffersList = await ctx.db.query.jobOffers.findMany({
        where: and(...whereConditions),
        orderBy: [desc(jobOffers.createdAt)],
        limit: input.limit,
        offset: input.offset,
        with: {
          applications: {
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
          },
        },
      });

      return jobOffersList;
    }),

  // Search job offers (Doctor only)
  search: protectedProcedure
    .input(
      z.object({
        specialty: z.string().optional(),
        location: z.string().optional(),
        type: jobOfferTypeSchema.optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        retrocessionMin: z.number().optional(),
        retrocessionMax: z.number().optional(),
        housingProvided: z.boolean().optional(),
        limit: z.number().min(1).max(100).default(10),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "DOCTOR") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Seuls les médecins peuvent rechercher des annonces",
        });
      }

      const whereConditions = [
        eq(jobOffers.status, "PUBLISHED"),
        gte(jobOffers.endDate, new Date()), // Only future offers
      ];

      if (input.specialty) {
        whereConditions.push(
          eq(
            jobOffers.specialty,
            input.specialty as import("~/types").MedicalSpecialty
          )
        );
      }

      if (input.location) {
        whereConditions.push(ilike(jobOffers.location, `%${input.location}%`));
      }

      if (input.type) {
        whereConditions.push(eq(jobOffers.type, input.type));
      }

      if (input.startDate) {
        whereConditions.push(gte(jobOffers.startDate, input.startDate));
      }

      if (input.endDate) {
        whereConditions.push(lte(jobOffers.endDate, input.endDate));
      }

      if (input.retrocessionMin) {
        whereConditions.push(
          gte(jobOffers.retrocessionRate, input.retrocessionMin.toString())
        );
      }

      if (input.retrocessionMax) {
        whereConditions.push(
          lte(jobOffers.retrocessionRate, input.retrocessionMax.toString())
        );
      }

      if (input.housingProvided !== undefined) {
        whereConditions.push(
          eq(jobOffers.housingProvided, input.housingProvided)
        );
      }

      const jobOffersList = await ctx.db.query.jobOffers.findMany({
        where: and(...whereConditions),
        orderBy: [desc(jobOffers.createdAt)],
        limit: input.limit,
        offset: input.offset,
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
      });

      return jobOffersList;
    }),

  // Update job offer status (Cabinet only)
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: jobOfferStatusSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "CABINET") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "Seuls les cabinets peuvent modifier le statut d'une annonce",
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

      // Verify ownership
      const jobOffer = await ctx.db.query.jobOffers.findFirst({
        where: eq(jobOffers.id, input.id),
      });

      if (!jobOffer || jobOffer.cabinetId !== cabinetProfile.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Annonce non trouvée ou non autorisée",
        });
      }

      // Update status
      const [updatedJobOffer] = await ctx.db
        .update(jobOffers)
        .set({ status: input.status })
        .where(eq(jobOffers.id, input.id))
        .returning();

      return updatedJobOffer;
    }),

  // Get job offer statistics (Cabinet only)
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
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Profil cabinet non trouvé",
      });
    }

    const stats = await ctx.db
      .select({
        status: jobOffers.status,
        count: sql<number>`cast(count(*) as int)`,
      })
      .from(jobOffers)
      .where(eq(jobOffers.cabinetId, cabinetProfile.id))
      .groupBy(jobOffers.status);

    return stats;
  }),
});
