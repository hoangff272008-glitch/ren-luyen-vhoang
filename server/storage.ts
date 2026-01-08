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
  getStudyNotes(): Promise<StudyNote[]>;
  createStudyNote(note: InsertStudyNote): Promise<StudyNote>;
  deleteStudyNote(id: number): Promise<void>;

  // Health Goals
  getHealthGoals(): Promise<HealthGoal[]>;
  createHealthGoal(goal: InsertHealthGoal): Promise<HealthGoal>;
  deleteHealthGoal(id: number): Promise<void>;

  // Health Logs
  getHealthLogs(goalId?: number): Promise<HealthLog[]>;
  createHealthLog(log: InsertHealthLog): Promise<HealthLog>;
  updateHealthLog(id: number, updates: Partial<InsertHealthLog>): Promise<HealthLog>;

  // Daily Activities
  getDailyActivities(date?: string): Promise<DailyActivity[]>;
  createDailyActivity(activity: InsertDailyActivity): Promise<DailyActivity>;
  updateDailyActivity(id: number, updates: Partial<InsertDailyActivity>): Promise<DailyActivity>;
  deleteDailyActivity(id: number): Promise<void>;

  // Sync & Quotes
  getRandomQuote(): Promise<any>;
  createSyncKey(data: any): Promise<string>;
  getSyncData(key: string): Promise<any>;
  getAllData(): Promise<any>;
  restoreData(data: any): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // ... existing methods ...

  async getRandomQuote(): Promise<any> {
    const defaultQuotes = [
      { content: "Hành trình vạn dặm bắt đầu từ một bước chân nhỏ bé.", author: "Lão Tử" },
      { content: "Kỷ luật là cầu nối giữa mục tiêu và thành tựu.", author: "Jim Rohn" },
      { content: "Đừng chờ đợi cơ hội thuận lợi, hãy tự tạo ra nó.", author: "George Bernard Shaw" },
      { content: "Học tập là hạt giống của kiến thức, kiến thức là hạt giống của hạnh phúc.", author: "Ngạn ngữ" }
    ];
    return defaultQuotes[Math.floor(Math.random() * defaultQuotes.length)];
  }

  async getAllData(): Promise<any> {
    const notes = await this.getStudyNotes();
    const goals = await this.getHealthGoals();
    const logs = await this.getHealthLogs();
    const activities = await this.getDailyActivities();
    return { notes, goals, logs, activities };
  }

  async createSyncKey(data: any): Promise<string> {
    const key = Math.random().toString(36).substring(2, 10).toUpperCase();
    await db.insert(syncKeys).values({ key, data });
    return key;
  }

  async getSyncData(key: string): Promise<any> {
    const [result] = await db.select().from(syncKeys).where(eq(syncKeys.key, key));
    return result?.data;
  }

  async restoreData(data: any): Promise<void> {
    // Basic restore logic - in a real app we'd handle conflicts
    if (data.notes) {
      await db.delete(studyNotes);
      if (data.notes.length > 0) await db.insert(studyNotes).values(data.notes);
    }
    if (data.goals) {
      await db.delete(healthGoals);
      if (data.goals.length > 0) await db.insert(healthGoals).values(data.goals);
    }
    // ... continue for other tables
  }
}
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

  async deleteHealthGoal(id: number): Promise<void> {
    await db.delete(healthGoals).where(eq(healthGoals.id, id));
  }

  // Health Logs
  async getHealthLogs(goalId?: number): Promise<HealthLog[]> {
    const conditions = [];
    if (goalId) conditions.push(eq(healthLogs.goalId, goalId));
    
    if (conditions.length > 0) {
      return await db.select().from(healthLogs).where(and(...conditions)).orderBy(desc(healthLogs.date));
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
    const conditions = [];
    if (date) conditions.push(eq(dailyActivities.date, date));
    
    if (conditions.length > 0) {
      return await db.select().from(dailyActivities).where(and(...conditions)).orderBy(dailyActivities.time);
    }
    return await db.select().from(dailyActivities).orderBy(dailyActivities.time);
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
