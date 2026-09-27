import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  primaryKey,
  pgEnum,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ----------------------------------------------------
// ENUMS
// ----------------------------------------------------
export const userRoleEnum = pgEnum("user_role", ["admin", "judge", "participant"]);
export const submissionStatusEnum = pgEnum("submission_status", ["draft", "submitted"]);

// ----------------------------------------------------
// USERS & BETTER AUTH TABLES
// ----------------------------------------------------
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  role: text("role").notNull().default("participant"), // admin | judge | participant
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verifications = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ----------------------------------------------------
// DOMAIN TABLES: EVENTS & TRACKS
// ----------------------------------------------------
export const events = pgTable("events", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  submissionDeadline: timestamp("submission_deadline", { withTimezone: true }).notNull(),
  createdBy: text("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const tracks = pgTable("tracks", {
  id: text("id").primaryKey(),
  eventId: text("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ----------------------------------------------------
// DOMAIN TABLES: TEAMS & MEMBERS
// ----------------------------------------------------
export const teams = pgTable("teams", {
  id: text("id").primaryKey(),
  eventId: text("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  joinCode: text("join_code").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const teamMembers = pgTable(
  "team_members",
  {
    teamId: text("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    joinedAt: timestamp("joined_at").notNull().defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.teamId, t.userId] }),
  })
);

// ----------------------------------------------------
// DOMAIN TABLES: SUBMISSIONS & TRACK CONNECTIONS
// ----------------------------------------------------
export const submissions = pgTable("submissions", {
  id: text("id").primaryKey(),
  teamId: text("team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  eventId: text("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  repoUrl: text("repo_url"),
  demoUrl: text("demo_url"),
  videoUrl: text("video_url"),
  status: text("status").notNull().default("draft"), // draft | submitted
  submittedAt: timestamp("submitted_at", { withTimezone: true }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const submissionTracks = pgTable(
  "submission_tracks",
  {
    submissionId: text("submission_id")
      .notNull()
      .references(() => submissions.id, { onDelete: "cascade" }),
    trackId: text("track_id")
      .notNull()
      .references(() => tracks.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.submissionId, t.trackId] }),
  })
);

// ----------------------------------------------------
// SHARED SCHEMA: JUDGING TABLES (Person B's domain)
// Note: Kept strictly aligned with specification so database schema is unified.
// ----------------------------------------------------
export const rubrics = pgTable("rubrics", {
  id: text("id").primaryKey(),
  eventId: text("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const criteria = pgTable("criteria", {
  id: text("id").primaryKey(),
  rubricId: text("rubric_id")
    .notNull()
    .references(() => rubrics.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  weight: integer("weight").notNull().default(1),
  maxScore: integer("max_score").notNull().default(10),
});

export const judgeAssignments = pgTable("judge_assignments", {
  id: text("id").primaryKey(),
  eventId: text("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  judgeId: text("judge_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  submissionId: text("submission_id")
    .notNull()
    .references(() => submissions.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const scores = pgTable("scores", {
  id: text("id").primaryKey(),
  judgeAssignmentId: text("judge_assignment_id")
    .notNull()
    .references(() => judgeAssignments.id, { onDelete: "cascade" }),
  criterionId: text("criterion_id")
    .notNull()
    .references(() => criteria.id, { onDelete: "cascade" }),
  value: integer("value").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ----------------------------------------------------
// RELATIONS
// ----------------------------------------------------
export const usersRelations = relations(users, ({ many }) => ({
  teamMembers: many(teamMembers),
  createdEvents: many(events),
  judgeAssignments: many(judgeAssignments),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  creator: one(users, {
    fields: [events.createdBy],
    references: [users.id],
  }),
  tracks: many(tracks),
  teams: many(teams),
  submissions: many(submissions),
  rubrics: many(rubrics),
  judgeAssignments: many(judgeAssignments),
}));

export const tracksRelations = relations(tracks, ({ one, many }) => ({
  event: one(events, {
    fields: [tracks.eventId],
    references: [events.id],
  }),
  submissionTracks: many(submissionTracks),
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
  event: one(events, {
    fields: [teams.eventId],
    references: [events.id],
  }),
  members: many(teamMembers),
  submissions: many(submissions),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
}));

export const submissionsRelations = relations(submissions, ({ one, many }) => ({
  team: one(teams, {
    fields: [submissions.teamId],
    references: [teams.id],
  }),
  event: one(events, {
    fields: [submissions.eventId],
    references: [events.id],
  }),
  submissionTracks: many(submissionTracks),
  judgeAssignments: many(judgeAssignments),
}));

export const submissionTracksRelations = relations(submissionTracks, ({ one }) => ({
  submission: one(submissions, {
    fields: [submissionTracks.submissionId],
    references: [submissions.id],
  }),
  track: one(tracks, {
    fields: [submissionTracks.trackId],
    references: [tracks.id],
  }),
}));
