import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertHealthGoal, type InsertHealthLog } from "@shared/schema";

// --- GOALS ---
export function useHealthGoals() {
  return useQuery({
    queryKey: [api.healthGoals.list.path],
    queryFn: async () => {
      const res = await fetch(api.healthGoals.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch goals");
      return api.healthGoals.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateHealthGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertHealthGoal) => {
      const res = await fetch(api.healthGoals.create.path, {
        method: api.healthGoals.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create goal");
      return api.healthGoals.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.healthGoals.list.path] }),
  });
}

// --- LOGS ---
export function useHealthLogs(params?: { date?: string; goalId?: number }) {
  return useQuery({
    queryKey: [api.healthLogs.list.path, params],
    queryFn: async () => {
      // Build query string manually since backend expects optional params
      const queryParams = new URLSearchParams();
      if (params?.date) queryParams.append("date", params.date);
      if (params?.goalId) queryParams.append("goalId", params.goalId.toString());
      
      const url = `${api.healthLogs.list.path}?${queryParams.toString()}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch logs");
      return api.healthLogs.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateHealthLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertHealthLog) => {
      // Ensure IDs are numbers
      const payload = { ...data, goalId: Number(data.goalId) };
      const res = await fetch(api.healthLogs.create.path, {
        method: api.healthLogs.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create log");
      return api.healthLogs.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.healthLogs.list.path] }),
  });
}

export function useUpdateHealthLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertHealthLog>) => {
      const url = buildUrl(api.healthLogs.update.path, { id });
      const res = await fetch(url, {
        method: api.healthLogs.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update log");
      return api.healthLogs.update.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.healthLogs.list.path] }),
  });
}
