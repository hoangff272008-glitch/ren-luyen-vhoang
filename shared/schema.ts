import { pgTable, text, serial, integer, boolean, timestamp, varchar, index, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// --- Application Tables ---

// Study Notes
export const studyNotes = pgTable("study_notes", {
  id: serial("id").primaryKey(),
  subject: text("subject").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  importance: text("importance").default("normal"), // low, normal, high
  createdAt: timestamp("created_at").defaultNow(),
});

// Health Goals
export const healthGoals = pgTable("health_goals", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  frequency: text("frequency").default("daily"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Health Logs (Tracking)
export const healthLogs = pgTable("health_logs", {
  id: serial("id").primaryKey(),
  goalId: integer("goal_id").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD
  isCompleted: boolean("is_completed").default(false),
  notes: text("notes"), // Punishments or reflections
  createdAt: timestamp("created_at").defaultNow(),
});

// Daily Activities
export const dailyActivities = pgTable("daily_activities", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  time: text("time"), // e.g. "08:00"
  date: text("date").notNull(), // YYYY-MM-DD
  isDone: boolean("is_done").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Quotes
export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  author: text("author"),
});

// Sync Keys
export const syncKeys = pgTable("sync_keys", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 8 }).notNull().unique(),
  data: jsonb("data").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schemas
export const insertStudyNoteSchema = createInsertSchema(studyNotes).omit({ id: true, createdAt: true });
export const insertHealthGoalSchema = createInsertSchema(healthGoals).omit({ id: true, createdAt: true });
export const insertHealthLogSchema = createInsertSchema(healthLogs).omit({ id: true, createdAt: true });
export const insertDailyActivitySchema = createInsertSchema(dailyActivities).omit({ id: true, createdAt: true });
export const insertQuoteSchema = createInsertSchema(quotes).omit({ id: true });
export const insertSyncKeySchema = createInsertSchema(syncKeys).omit({ id: true, updatedAt: true });

// Types
export type StudyNote = typeof studyNotes.$inferSelect;
export type InsertStudyNote = z.infer<typeof insertStudyNoteSchema>;

export type HealthGoal = typeof healthGoals.$inferSelect;
export type InsertHealthGoal = z.infer<typeof insertHealthGoalSchema>;

export type HealthLog = typeof healthLogs.$inferSelect;
export type InsertHealthLog = z.infer<typeof insertHealthLogSchema>;

export type DailyActivity = typeof dailyActivities.$inferSelect;
export type InsertDailyActivity = z.infer<typeof insertDailyActivitySchema>;

export type Quote = typeof quotes.$inferSelect;
export type SyncKey = typeof syncKeys.$inferSelect;
