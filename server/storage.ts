import { 
  studyNotes, healthGoals, healthLogs, dailyActivities,
  type StudyNote, type InsertStudyNote,
  type HealthGoal, type InsertHealthGoal,
  type HealthLog, type InsertHealthLog,
  type DailyActivity, type InsertDailyActivity
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Study Notes
  getStudyNotes(): Promise<StudyNote[]>;
  createStudyNote(note: InsertStudyNote): Promise<StudyNote>;
  deleteStudyNote(id: number): Promise<void>;

  // Health Goals
  getHealthGoals(): Promise<HealthGoal[]>;
  createHealthGoal(goal: InsertHealthGoal): Promise<HealthGoal>;

  // Health Logs
  getHealthLogs(goalId?: number): Promise<HealthLog[]>;
  createHealthLog(log: InsertHealthLog): Promise<HealthLog>;
  updateHealthLog(id: number, updates: Partial<InsertHealthLog>): Promise<HealthLog>;

  // Daily Activities
  getDailyActivities(date?: string): Promise<DailyActivity[]>;
  createDailyActivity(activity: InsertDailyActivity): Promise<DailyActivity>;
  updateDailyActivity(id: number, updates: Partial<InsertDailyActivity>): Promise<DailyActivity>;
  deleteDailyActivity(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Study Notes
  async getStudyNotes(): Promise<StudyNote[]> {
    return await db.select().from(studyNotes).orderBy(desc(studyNotes.createdAt));
  }

  async createStudyNote(note: InsertStudyNote): Promise<StudyNote> {
    const [newNote] = await db.insert(studyNotes).values(note).returning();
    return newNote;
  }

  async deleteStudyNote(id: number): Promise<void> {
    await db.delete(studyNotes).where(eq(studyNotes.id, id));
  }

  // Health Goals
  async getHealthGoals(): Promise<HealthGoal[]> {
    return await db.select().from(healthGoals).orderBy(healthGoals.id);
  }

  async createHealthGoal(goal: InsertHealthGoal): Promise<HealthGoal> {
    const [newGoal] = await db.insert(healthGoals).values(goal).returning();
    return newGoal;
  }

  // Health Logs
  async getHealthLogs(goalId?: number): Promise<HealthLog[]> {
    if (goalId) {
      return await db.select().from(healthLogs).where(eq(healthLogs.goalId, goalId)).orderBy(desc(healthLogs.date));
    }
    return await db.select().from(healthLogs).orderBy(desc(healthLogs.date));
  }

  async createHealthLog(log: InsertHealthLog): Promise<HealthLog> {
    const [newLog] = await db.insert(healthLogs).values(log).returning();
    return newLog;
  }

  async updateHealthLog(id: number, updates: Partial<InsertHealthLog>): Promise<HealthLog> {
    const [updatedLog] = await db.update(healthLogs)
      .set(updates)
      .where(eq(healthLogs.id, id))
      .returning();
    return updatedLog;
  }

  // Daily Activities
  async getDailyActivities(date?: string): Promise<DailyActivity[]> {
    if (date) {
      return await db.select().from(dailyActivities).where(eq(dailyActivities.date, date)).orderBy(dailyActivities.time);
    }
    return await db.select().from(dailyActivities).orderBy(desc(dailyActivities.date), dailyActivities.time);
  }

  async createDailyActivity(activity: InsertDailyActivity): Promise<DailyActivity> {
    const [newActivity] = await db.insert(dailyActivities).values(activity).returning();
    return newActivity;
  }

  async updateDailyActivity(id: number, updates: Partial<InsertDailyActivity>): Promise<DailyActivity> {
    const [updatedActivity] = await db.update(dailyActivities)
      .set(updates)
      .where(eq(dailyActivities.id, id))
      .returning();
    return updatedActivity;
  }

  async deleteDailyActivity(id: number): Promise<void> {
    await db.delete(dailyActivities).where(eq(dailyActivities.id, id));
  }
}

export const storage = new DatabaseStorage();
