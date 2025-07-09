import { authRouter } from "~/server/api/routers/auth";
import { jobOffersRouter } from "~/server/api/routers/job-offers";
import { applicationsRouter } from "~/server/api/routers/applications";
import { messagesRouter } from "~/server/api/routers/messages";
import { notificationsRouter } from "~/server/api/routers/notifications";
import { analyticsRouter } from "~/server/api/routers/analytics";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  jobOffers: jobOffersRouter,
  applications: applicationsRouter,
  messages: messagesRouter,
  notifications: notificationsRouter,
  analytics: analyticsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
