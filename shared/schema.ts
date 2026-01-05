import { pgTable, text, serial, integer, boolean, timestamp, varchar, index, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// --- Authentication Tables (Mandatory for Replit Auth) ---
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

export const users = pgTable("users", {
  id: varchar("id").primaryKey(), // Replit Auth ID is a string
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// --- Application Tables ---

// Study Notes
export const studyNotes = pgTable("study_notes", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  subject: text("subject").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  importance: text("importance").default("normal"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Health Goals
export const healthGoals = pgTable("health_goals", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  frequency: text("frequency").default("daily"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Health Logs (Tracking)
export const healthLogs = pgTable("health_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  goalId: integer("goal_id").notNull(),
  date: text("date").notNull(),
  isCompleted: boolean("is_completed").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Daily Activities
export const dailyActivities = pgTable("daily_activities", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  content: text("content").notNull(),
  time: text("time"),
  date: text("date").notNull(),
  isDone: boolean("is_done").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({ createdAt: true, updatedAt: true });
export const insertStudyNoteSchema = createInsertSchema(studyNotes).omit({ id: true, createdAt: true });
export const insertHealthGoalSchema = createInsertSchema(healthGoals).omit({ id: true, createdAt: true });
export const insertHealthLogSchema = createInsertSchema(healthLogs).omit({ id: true, createdAt: true });
export const insertDailyActivitySchema = createInsertSchema(dailyActivities).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;

export type StudyNote = typeof studyNotes.$inferSelect;
export type InsertStudyNote = z.infer<typeof insertStudyNoteSchema>;

export type HealthGoal = typeof healthGoals.$inferSelect;
export type InsertHealthGoal = z.infer<typeof insertHealthGoalSchema>;

export type HealthLog = typeof healthLogs.$inferSelect;
export type InsertHealthLog = z.infer<typeof insertHealthLogSchema>;

export type DailyActivity = typeof dailyActivities.$inferSelect;
export type InsertDailyActivity = z.infer<typeof insertDailyActivitySchema>;
