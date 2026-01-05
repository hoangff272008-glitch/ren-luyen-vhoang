import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Replit Auth
  await setupAuth(app);
  registerAuthRoutes(app);

  // --- Protected Routes ---

  // --- Study Notes ---
  app.get(api.studyNotes.list.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const notes = await storage.getStudyNotes(userId);
    res.json(notes);
  });

  app.post(api.studyNotes.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const input = api.studyNotes.create.input.parse(req.body);
      const note = await storage.createStudyNote(userId, input);
      res.status(201).json(note);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.studyNotes.delete.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    await storage.deleteStudyNote(userId, Number(req.params.id));
    res.status(204).send();
  });

  // --- Health Goals ---
  app.get(api.healthGoals.list.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const goals = await storage.getHealthGoals(userId);
    res.json(goals);
  });

  app.post(api.healthGoals.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const input = api.healthGoals.create.input.parse(req.body);
      const goal = await storage.createHealthGoal(userId, input);
      res.status(201).json(goal);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.healthGoals.delete.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    await storage.deleteHealthGoal(userId, Number(req.params.id));
    res.status(204).send();
  });

  // --- Health Logs ---
  app.get(api.healthLogs.list.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const goalId = req.query.goalId ? Number(req.query.goalId) : undefined;
    const logs = await storage.getHealthLogs(userId, goalId);
    res.json(logs);
  });

  app.post(api.healthLogs.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const input = api.healthLogs.create.input.parse(req.body);
      const log = await storage.createHealthLog(userId, input);
      res.status(201).json(log);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.healthLogs.update.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const input = api.healthLogs.update.input.parse(req.body);
      const log = await storage.updateHealthLog(userId, Number(req.params.id), input);
      res.json(log);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // --- Daily Activities ---
  app.get(api.dailyActivities.list.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const date = typeof req.query.date === 'string' ? req.query.date : undefined;
    const activities = await storage.getDailyActivities(userId, date);
    res.json(activities);
  });

  app.post(api.dailyActivities.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const input = api.dailyActivities.create.input.parse(req.body);
      const activity = await storage.createDailyActivity(userId, input);
      res.status(201).json(activity);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.dailyActivities.update.path, isAuthenticated, async (req: any, res) => {
     try {
      const userId = req.user.claims.sub;
      const input = api.dailyActivities.update.input.parse(req.body);
      const activity = await storage.updateDailyActivity(userId, Number(req.params.id), input);
      res.json(activity);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.dailyActivities.delete.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    await storage.deleteDailyActivity(userId, Number(req.params.id));
    res.status(204).send();
  });

  return httpServer;
}
