import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertDailyActivity } from "@shared/schema";

export function useDailyActivities(date?: string) {
  return useQuery({
    queryKey: [api.dailyActivities.list.path, date],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (date) queryParams.append("date", date);
      
      const url = `${api.dailyActivities.list.path}?${queryParams.toString()}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch activities");
      return api.dailyActivities.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateDailyActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertDailyActivity) => {
      const res = await fetch(api.dailyActivities.create.path, {
        method: api.dailyActivities.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create activity");
      return api.dailyActivities.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.dailyActivities.list.path] }),
  });
}

export function useUpdateDailyActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertDailyActivity>) => {
      const url = buildUrl(api.dailyActivities.update.path, { id });
      const res = await fetch(url, {
        method: api.dailyActivities.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update activity");
      return api.dailyActivities.update.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.dailyActivities.list.path] }),
  });
}

export function useDeleteDailyActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.dailyActivities.delete.path, { id });
      const res = await fetch(url, { method: api.dailyActivities.delete.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete activity");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.dailyActivities.list.path] }),
  });
}
