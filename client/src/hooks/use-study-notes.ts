import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertStudyNote } from "@shared/schema";

export function useStudyNotes() {
  return useQuery({
    queryKey: [api.studyNotes.list.path],
    queryFn: async () => {
      const res = await fetch(api.studyNotes.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch notes");
      return api.studyNotes.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateStudyNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertStudyNote) => {
      const res = await fetch(api.studyNotes.create.path, {
        method: api.studyNotes.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create note");
      return api.studyNotes.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.studyNotes.list.path] }),
  });
}

export function useDeleteStudyNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.studyNotes.delete.path, { id });
      const res = await fetch(url, { method: api.studyNotes.delete.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete note");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.studyNotes.list.path] }),
  });
}
