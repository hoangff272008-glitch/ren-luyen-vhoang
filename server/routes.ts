import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // --- Study Notes ---
  app.get(api.studyNotes.list.path, async (req, res) => {
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
  app.get(api.healthGoals.list.path, async (req, res) => {
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

  app.delete(api.healthGoals.delete.path, async (req, res) => {
    await storage.deleteHealthGoal(Number(req.params.id));
    res.status(204).send();
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

  // --- Quotes ---
  app.get(api.quotes.random.path, async (req, res) => {
    const quote = await storage.getRandomQuote();
    res.json(quote);
  });

  // --- Sync ---
  app.post(api.sync.create.path, async (req, res) => {
    const data = await storage.getAllData();
    const key = await storage.createSyncKey(data);
    res.status(201).json({ key });
  });

  app.get(api.sync.load.path, async (req, res) => {
    const data = await storage.getSyncData(req.params.key);
    if (!data) return res.status(404).json({ message: "Không tìm thấy mã khóa" });
    await storage.restoreData(data);
    res.json({ message: "Đồng bộ thành công" });
  });

  return httpServer;
}
