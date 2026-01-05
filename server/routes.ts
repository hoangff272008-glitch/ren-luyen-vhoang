import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { format } from "date-fns";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // --- Study Notes ---
  app.get(api.studyNotes.list.path, async (_req, res) => {
    const notes = await storage.getStudyNotes();
    res.json(notes);
  });

  app.post(api.studyNotes.create.path, async (req, res) => {
    try {
      const input = api.studyNotes.create.input.parse(req.body);
      const note = await storage.createStudyNote(input);
      res.status(201).json(note);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.studyNotes.delete.path, async (req, res) => {
    await storage.deleteStudyNote(Number(req.params.id));
    res.status(204).send();
  });

  // --- Health Goals ---
  app.get(api.healthGoals.list.path, async (_req, res) => {
    const goals = await storage.getHealthGoals();
    res.json(goals);
  });

  app.post(api.healthGoals.create.path, async (req, res) => {
    try {
      const input = api.healthGoals.create.input.parse(req.body);
      const goal = await storage.createHealthGoal(input);
      res.status(201).json(goal);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // --- Health Logs ---
  app.get(api.healthLogs.list.path, async (req, res) => {
    const goalId = req.query.goalId ? Number(req.query.goalId) : undefined;
    const logs = await storage.getHealthLogs(goalId);
    res.json(logs);
  });

  app.post(api.healthLogs.create.path, async (req, res) => {
    try {
      const input = api.healthLogs.create.input.parse(req.body);
      const log = await storage.createHealthLog(input);
      res.status(201).json(log);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.healthLogs.update.path, async (req, res) => {
    try {
      const input = api.healthLogs.update.input.parse(req.body);
      const log = await storage.updateHealthLog(Number(req.params.id), input);
      res.json(log);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // --- Daily Activities ---
  app.get(api.dailyActivities.list.path, async (req, res) => {
    const date = typeof req.query.date === 'string' ? req.query.date : undefined;
    const activities = await storage.getDailyActivities(date);
    res.json(activities);
  });

  app.post(api.dailyActivities.create.path, async (req, res) => {
    try {
      const input = api.dailyActivities.create.input.parse(req.body);
      const activity = await storage.createDailyActivity(input);
      res.status(201).json(activity);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.dailyActivities.update.path, async (req, res) => {
     try {
      const input = api.dailyActivities.update.input.parse(req.body);
      const activity = await storage.updateDailyActivity(Number(req.params.id), input);
      res.json(activity);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.dailyActivities.delete.path, async (req, res) => {
    await storage.deleteDailyActivity(Number(req.params.id));
    res.status(204).send();
  });

  // Seed Data if empty
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const goals = await storage.getHealthGoals();
  if (goals.length === 0) {
    console.log("Seeding database...");
    const goal1 = await storage.createHealthGoal({
      title: "Chạy bộ 30 phút",
      description: "Mỗi sáng sớm tại công viên",
      frequency: "daily"
    });
    const goal2 = await storage.createHealthGoal({
      title: "Uống 2 lít nước",
      description: "Chia đều trong ngày",
      frequency: "daily"
    });

    await storage.createStudyNote({
      subject: "Toán Cao Cấp",
      title: "Ôn tập chương Ma trận",
      content: "Cần xem lại cách tính định thức và ma trận nghịch đảo.",
      importance: "high"
    });

    await storage.createStudyNote({
      subject: "Tiếng Anh",
      title: "Từ vựng Unit 5",
      content: "Học 20 từ mới về chủ đề Môi trường.",
      importance: "normal"
    });

    const today = format(new Date(), 'yyyy-MM-dd');
    await storage.createDailyActivity({
      content: "Thức dậy & Vệ sinh cá nhân",
      time: "06:00",
      date: today,
      isDone: true
    });
    await storage.createDailyActivity({
      content: "Ăn sáng",
      time: "06:30",
      date: today,
      isDone: true
    });
    await storage.createDailyActivity({
      content: "Đi học",
      time: "07:00",
      date: today,
      isDone: false
    });
    
    // Seed a log
    await storage.createHealthLog({
      goalId: goal1.id,
      date: today,
      isCompleted: false,
      notes: "Hôm nay dậy muộn, phạt hít đất 20 cái!"
    });

    console.log("Database seeded!");
  }
}
