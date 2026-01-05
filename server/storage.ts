import { 
  studyNotes, healthGoals, healthLogs, dailyActivities,
  type StudyNote, type InsertStudyNote,
  type HealthGoal, type InsertHealthGoal,
  type HealthLog, type InsertHealthLog,
  type DailyActivity, type InsertDailyActivity
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // Study Notes
  getStudyNotes(userId: string): Promise<StudyNote[]>;
  createStudyNote(userId: string, note: Omit<InsertStudyNote, 'userId'>): Promise<StudyNote>;
  deleteStudyNote(userId: string, id: number): Promise<void>;

  // Health Goals
  getHealthGoals(userId: string): Promise<HealthGoal[]>;
  createHealthGoal(userId: string, goal: Omit<InsertHealthGoal, 'userId'>): Promise<HealthGoal>;
  deleteHealthGoal(userId: string, id: number): Promise<void>;

  // Health Logs
  getHealthLogs(userId: string, goalId?: number): Promise<HealthLog[]>;
  createHealthLog(userId: string, log: Omit<InsertHealthLog, 'userId'>): Promise<HealthLog>;
  updateHealthLog(userId: string, id: number, updates: Partial<Omit<InsertHealthLog, 'userId'>>): Promise<HealthLog>;

  // Daily Activities
  getDailyActivities(userId: string, date?: string): Promise<DailyActivity[]>;
  createDailyActivity(userId: string, activity: Omit<InsertDailyActivity, 'userId'>): Promise<DailyActivity>;
  updateDailyActivity(userId: string, id: number, updates: Partial<Omit<InsertDailyActivity, 'userId'>>): Promise<DailyActivity>;
  deleteDailyActivity(userId: string, id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Study Notes
  async getStudyNotes(userId: string): Promise<StudyNote[]> {
    return await db.select().from(studyNotes).where(eq(studyNotes.userId, userId)).orderBy(desc(studyNotes.createdAt));
  }

  async createStudyNote(userId: string, note: Omit<InsertStudyNote, 'userId'>): Promise<StudyNote> {
    const [newNote] = await db.insert(studyNotes).values({ ...note, userId }).returning();
    return newNote;
  }

  async deleteStudyNote(userId: string, id: number): Promise<void> {
    await db.delete(studyNotes).where(and(eq(studyNotes.id, id), eq(studyNotes.userId, userId)));
  }

  // Health Goals
  async getHealthGoals(userId: string): Promise<HealthGoal[]> {
    return await db.select().from(healthGoals).where(eq(healthGoals.userId, userId)).orderBy(healthGoals.id);
  }

  async createHealthGoal(userId: string, goal: Omit<InsertHealthGoal, 'userId'>): Promise<HealthGoal> {
    const [newGoal] = await db.insert(healthGoals).values({ ...goal, userId }).returning();
    return newGoal;
  }

  async deleteHealthGoal(userId: string, id: number): Promise<void> {
    await db.delete(healthGoals).where(and(eq(healthGoals.id, id), eq(healthGoals.userId, userId)));
  }

  // Health Logs
  async getHealthLogs(userId: string, goalId?: number): Promise<HealthLog[]> {
    const conditions = [eq(healthLogs.userId, userId)];
    if (goalId) conditions.push(eq(healthLogs.goalId, goalId));
    return await db.select().from(healthLogs).where(and(...conditions)).orderBy(desc(healthLogs.date));
  }

  async createHealthLog(userId: string, log: Omit<InsertHealthLog, 'userId'>): Promise<HealthLog> {
    const [newLog] = await db.insert(healthLogs).values({ ...log, userId }).returning();
    return newLog;
  }

  async updateHealthLog(userId: string, id: number, updates: Partial<Omit<InsertHealthLog, 'userId'>>): Promise<HealthLog> {
    const [updatedLog] = await db.update(healthLogs)
      .set(updates)
      .where(and(eq(healthLogs.id, id), eq(healthLogs.userId, userId)))
      .returning();
    return updatedLog;
  }

  // Daily Activities
  async getDailyActivities(userId: string, date?: string): Promise<DailyActivity[]> {
    const conditions = [eq(dailyActivities.userId, userId)];
    if (date) conditions.push(eq(dailyActivities.date, date));
    return await db.select().from(dailyActivities).where(and(...conditions)).orderBy(dailyActivities.time);
  }

  async createDailyActivity(userId: string, activity: Omit<InsertDailyActivity, 'userId'>): Promise<DailyActivity> {
    const [newActivity] = await db.insert(dailyActivities).values({ ...activity, userId }).returning();
    return newActivity;
  }

  async updateDailyActivity(userId: string, id: number, updates: Partial<Omit<InsertDailyActivity, 'userId'>>): Promise<DailyActivity> {
    const [updatedActivity] = await db.update(dailyActivities)
      .set(updates)
      .where(and(eq(dailyActivities.id, id), eq(dailyActivities.userId, userId)))
      .returning();
    return updatedActivity;
  }

  async deleteDailyActivity(userId: string, id: number): Promise<void> {
    await db.delete(dailyActivities).where(and(eq(dailyActivities.id, id), eq(dailyActivities.userId, userId)));
  }
}

export const storage = new DatabaseStorage();
