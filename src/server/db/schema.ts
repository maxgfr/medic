import { relations, sql } from "drizzle-orm";
import {
  index,
  pgTableCreator,
  primaryKey,
  varchar,
  text,
  integer,
  numeric,
  boolean,
  timestamp,
  json,
  real,
} from "drizzle-orm/pg-core";
import type { AdapterAccount } from "next-auth/adapters";
import type {
  MedicalSpecialty,
  PreferredLocation,
  GeneralAvailability,
  SpecificAvailability,
} from "~/types";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `medic_${name}`);

export const users = createTable("user", (d) => ({
  id: d
    .varchar({ length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: d.varchar({ length: 255 }),
  email: d.varchar({ length: 255 }).notNull().unique(),
  emailVerified: d
    .timestamp({
      mode: "date",
      withTimezone: true,
    })
    .default(sql`CURRENT_TIMESTAMP`),
  image: d.varchar({ length: 255 }),
  password: d.varchar({ length: 255 }), // Hash du mot de passe
  role: d.varchar({ length: 20 }).$type<"CABINET" | "DOCTOR">().notNull(),
  createdAt: d
    .timestamp({ withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
}));

export const accounts = createTable(
  "account",
  (d) => ({
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    type: d.varchar({ length: 255 }).$type<AdapterAccount["type"]>().notNull(),
    provider: d.varchar({ length: 255 }).notNull(),
    providerAccountId: d.varchar({ length: 255 }).notNull(),
    refresh_token: d.text(),
    access_token: d.text(),
    expires_at: d.integer(),
    token_type: d.varchar({ length: 255 }),
    scope: d.varchar({ length: 255 }),
    id_token: d.text(),
    session_state: d.varchar({ length: 255 }),
  }),
  (t) => [
    primaryKey({ columns: [t.provider, t.providerAccountId] }),
    index("account_user_id_idx").on(t.userId),
  ]
);

export const sessions = createTable(
  "session",
  (d) => ({
    sessionToken: d.varchar({ length: 255 }).notNull().primaryKey(),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
  }),
  (t) => [index("t_user_id_idx").on(t.userId)]
);

export const verificationTokens = createTable(
  "verification_token",
  (d) => ({
    identifier: d.varchar({ length: 255 }).notNull(),
    token: d.varchar({ length: 255 }).notNull(),
    expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
  }),
  (t) => [primaryKey({ columns: [t.identifier, t.token] })]
);

// Specialties table
export const specialties = createTable("specialty", (d) => ({
  id: d
    .varchar({ length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: d.varchar({ length: 255 }).notNull(),
  category: d.varchar({ length: 100 }).notNull(),
  createdAt: d
    .timestamp({ withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
}));

// Cabinet profiles table
export const cabinetProfiles = createTable("cabinet_profile", (d) => ({
  id: d
    .varchar({ length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: d
    .varchar({ length: 255 })
    .notNull()
    .references(() => users.id)
    .unique(),
  cabinetName: d.varchar({ length: 255 }).notNull(),
  address: d.text().notNull(),
  phone: d.varchar({ length: 50 }).notNull(),
  description: d.text(),
  specialties: d.json().$type<string[]>().notNull(),
  photos: d.json().$type<string[]>().default([]),
  latitude: d.real(),
  longitude: d.real(),
  createdAt: d
    .timestamp({ withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
}));

// Doctor profiles table
export const doctorProfiles = createTable("doctor_profile", (d) => ({
  id: d
    .varchar({ length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: d
    .varchar({ length: 255 })
    .notNull()
    .references(() => users.id)
    .unique(),
  firstName: d.varchar({ length: 255 }).notNull(),
  lastName: d.varchar({ length: 255 }).notNull(),
  specialties: d.json().$type<string[]>().notNull(),
  experienceYears: d.integer().notNull(),
  preferredLocations: d.json().$type<PreferredLocation[]>().notNull(),
  documents: d.json().$type<string[]>().default([]),
  generalAvailability: d.json().$type<GeneralAvailability>().notNull(),
  specificAvailabilities: d.json().$type<SpecificAvailability[]>().default([]),
  preferredRate: d.numeric({ precision: 10, scale: 2 }),
  createdAt: d
    .timestamp({ withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
}));

// Job offers table
export const jobOffers = createTable(
  "job_offer",
  (d) => ({
    id: d
      .varchar({ length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    cabinetId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => cabinetProfiles.id),
    title: d.varchar({ length: 255 }).notNull(),
    specialty: d.varchar({ length: 255 }).$type<MedicalSpecialty>().notNull(),
    location: d.text().notNull(),
    latitude: d.real(),
    longitude: d.real(),
    startDate: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
    endDate: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
    retrocessionRate: d.numeric({ precision: 5, scale: 2 }).notNull(),
    type: d
      .varchar({ length: 20 })
      .$type<"URGENT" | "PLANNED" | "RECURRING">()
      .notNull(),
    description: d.text(),
    schedule: d.json().$type<{
      morning: boolean;
      afternoon: boolean;
      evening: boolean;
    }>(),
    estimatedPatients: d.integer(),
    equipment: d.json().$type<string[]>().default([]),
    housingProvided: d.boolean().default(false),
    status: d
      .varchar({ length: 20 })
      .$type<"DRAFT" | "PUBLISHED" | "FILLED" | "ARCHIVED">()
      .notNull()
      .default("DRAFT"),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("job_offer_cabinet_id_idx").on(t.cabinetId),
    index("job_offer_specialty_idx").on(t.specialty),
    index("job_offer_status_idx").on(t.status),
    index("job_offer_dates_idx").on(t.startDate, t.endDate),
  ]
);

// Applications table
export const applications = createTable(
  "application",
  (d) => ({
    id: d
      .varchar({ length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    jobOfferId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => jobOffers.id),
    doctorId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => doctorProfiles.id),
    motivationLetter: d.text().notNull(),
    attachments: d.json().$type<string[]>().default([]),
    status: d
      .varchar({ length: 20 })
      .$type<"SENT" | "VIEWED" | "ACCEPTED" | "REJECTED">()
      .notNull()
      .default("SENT"),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("application_job_offer_id_idx").on(t.jobOfferId),
    index("application_doctor_id_idx").on(t.doctorId),
    index("application_status_idx").on(t.status),
  ]
);

// Conversations table
export const conversations = createTable(
  "conversation",
  (d) => ({
    id: d
      .varchar({ length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    jobOfferId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => jobOffers.id),
    cabinetId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => cabinetProfiles.id),
    doctorId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => doctorProfiles.id),
    lastMessageAt: d.timestamp({ withTimezone: true }),
    isArchived: d.boolean().default(false),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("conversation_job_offer_id_idx").on(t.jobOfferId),
    index("conversation_cabinet_id_idx").on(t.cabinetId),
    index("conversation_doctor_id_idx").on(t.doctorId),
  ]
);

// Messages table
export const messages = createTable(
  "message",
  (d) => ({
    id: d
      .varchar({ length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    conversationId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => conversations.id),
    senderId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    content: d.text().notNull(),
    attachments: d.json().$type<string[]>().default([]),
    isRead: d.boolean().default(false),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  }),
  (t) => [
    index("message_conversation_id_idx").on(t.conversationId),
    index("message_sender_id_idx").on(t.senderId),
  ]
);

// Notifications table
export const notifications = createTable(
  "notification",
  (d) => ({
    id: d
      .varchar({ length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    recipientId: d.varchar({ length: 255 }).notNull(),
    type: d
      .varchar({ length: 50 })
      .$type<
        | "NEW_APPLICATION"
        | "APPLICATION_ACCEPTED"
        | "APPLICATION_REJECTED"
        | "NEW_MESSAGE"
        | "NEW_JOB_OFFER"
        | "JOB_OFFER_UPDATED"
        | "PROFILE_INCOMPLETE"
      >()
      .notNull(),
    title: d.varchar({ length: 255 }).notNull(),
    message: d.text().notNull(),
    data: d.json().default({}),
    isRead: d.boolean().default(false),
    readAt: d.timestamp({ withTimezone: true }),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  }),
  (t) => [
    index("notification_recipient_id_idx").on(t.recipientId),
    index("notification_is_read_idx").on(t.isRead),
    index("notification_created_at_idx").on(t.createdAt),
  ]
);

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  accounts: many(accounts),
  cabinetProfile: one(cabinetProfiles),
  doctorProfile: one(doctorProfiles),
  sentMessages: many(messages),
  jobOffers: many(jobOffers),
  applications: many(applications),
  cabinetConversations: many(conversations, {
    relationName: "cabinetConversations",
  }),
  doctorConversations: many(conversations, {
    relationName: "doctorConversations",
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const specialtiesRelations = relations(specialties, () => ({}));

export const cabinetProfilesRelations = relations(
  cabinetProfiles,
  ({ one, many }) => ({
    user: one(users, {
      fields: [cabinetProfiles.userId],
      references: [users.id],
    }),
    jobOffers: many(jobOffers),
    conversations: many(conversations, {
      relationName: "cabinetConversations",
    }),
  })
);

export const doctorProfilesRelations = relations(
  doctorProfiles,
  ({ one, many }) => ({
    user: one(users, {
      fields: [doctorProfiles.userId],
      references: [users.id],
    }),
    applications: many(applications),
    conversations: many(conversations, { relationName: "doctorConversations" }),
  })
);

export const jobOffersRelations = relations(jobOffers, ({ one, many }) => ({
  cabinet: one(cabinetProfiles, {
    fields: [jobOffers.cabinetId],
    references: [cabinetProfiles.id],
  }),
  applications: many(applications),
  conversations: many(conversations),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  jobOffer: one(jobOffers, {
    fields: [applications.jobOfferId],
    references: [jobOffers.id],
  }),
  doctor: one(doctorProfiles, {
    fields: [applications.doctorId],
    references: [doctorProfiles.id],
  }),
}));

export const conversationsRelations = relations(
  conversations,
  ({ one, many }) => ({
    jobOffer: one(jobOffers, {
      fields: [conversations.jobOfferId],
      references: [jobOffers.id],
    }),
    cabinet: one(cabinetProfiles, {
      fields: [conversations.cabinetId],
      references: [cabinetProfiles.id],
    }),
    doctor: one(doctorProfiles, {
      fields: [conversations.doctorId],
      references: [doctorProfiles.id],
    }),
    messages: many(messages),
  })
);

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(users, { fields: [messages.senderId], references: [users.id] }),
}));

export const notificationsRelations = relations(notifications, () => ({}));
