import { useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { CheckSquare, Plus, Trash2, Clock, Calendar as CalendarIcon } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { api, buildUrl } from "@shared/routes";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { DailyActivity, InsertDailyActivity } from "@shared/schema";
import { cn } from "@/lib/utils";

export default function Activities() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const formattedDate = format(selectedDate, "yyyy-MM-dd");
  const { toast } = useToast();

  const { data: activities, isLoading } = useQuery<DailyActivity[]>({
    queryKey: [api.dailyActivities.list.path, { date: formattedDate }],
  });

  const createActivity = useMutation({
    mutationFn: async (data: Omit<InsertDailyActivity, "userId" | "date">) => {
      return apiRequest("POST", api.dailyActivities.create.path, { ...data, date: formattedDate });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.dailyActivities.list.path] });
      setIsAddDialogOpen(false);
      setNewActivity({ content: "", time: "" });
      toast({ title: "Đã thêm hoạt động mới" });
    },
  });

  const updateActivity = useMutation({
    mutationFn: async ({ id, isDone }: { id: number; isDone: boolean }) => {
      return apiRequest("PUT", buildUrl(api.dailyActivities.update.path, { id }), { isDone });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.dailyActivities.list.path] });
    },
  });

  const deleteActivity = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", buildUrl(api.dailyActivities.delete.path, { id }));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.dailyActivities.list.path] });
      toast({ title: "Đã xóa hoạt động" });
    },
  });

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newActivity, setNewActivity] = useState({ content: "", time: "" });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActivity.content) return;
    createActivity.mutate(newActivity);
  };

  const sortedActivities = activities?.sort((a, b) => {
    if (!a.time) return 1;
    if (!b.time) return -1;
    return a.time.localeCompare(b.time);
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-display font-bold flex items-center gap-3">
            <span className="p-2 rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300">
              <CheckSquare size={32} />
            </span>
            Hoạt động hàng ngày
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            {format(selectedDate, "eeee, dd MMMM yyyy", { locale: vi })}
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white border-0 shadow-lg shadow-amber-500/25">
              <Plus className="mr-2 h-5 w-5" /> Thêm hoạt động
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-panel">
            <DialogHeader>
              <DialogTitle>Thêm hoạt động mới</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Nội dung</Label>
                <Input 
                  value={newActivity.content} 
                  onChange={(e) => setNewActivity({ ...newActivity, content: e.target.value })}
                  placeholder="Ví dụ: Ăn sáng, Học bài..." 
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Thời gian (tùy chọn)</Label>
                <Input 
                  type="time"
                  value={newActivity.time} 
                  onChange={(e) => setNewActivity({ ...newActivity, time: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <Button type="submit" disabled={createActivity.isPending} className="w-full rounded-xl bg-amber-500 hover:bg-amber-600">
                Thêm vào danh sách
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4 relative before:absolute before:inset-0 before:left-8 before:w-0.5 before:bg-gradient-to-b before:from-amber-500/50 before:via-orange-500/50 before:to-transparent before:z-0">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-24 rounded-2xl bg-white/30 animate-pulse ml-12" />)}
          </div>
        ) : sortedActivities?.length === 0 ? (
          <div className="text-center py-20 glass-panel rounded-3xl ml-12">
            <CalendarIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-muted-foreground">Chưa có hoạt động nào cho ngày này.</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {sortedActivities?.map((activity) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative z-10 flex items-start gap-6 group"
              >
                <div className={cn(
                  "mt-6 w-4 h-4 rounded-full border-4 border-background transition-colors duration-300 shrink-0",
                  activity.isDone ? "bg-green-500" : "bg-amber-500"
                )} />
                
                <Card className={cn(
                  "flex-1 rounded-2xl border-0 shadow-sm transition-all duration-300 hover:shadow-md",
                  activity.isDone ? "bg-green-50/50 dark:bg-green-900/10 opacity-75" : "bg-card/80 backdrop-blur-sm"
                )}>
                  <CardContent className="p-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <Checkbox 
                        checked={activity.isDone || false} 
                        onCheckedChange={(checked) => updateActivity.mutate({ id: activity.id, isDone: !!checked })}
                        className="h-6 w-6 rounded-lg border-2"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          {activity.time && (
                            <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300 px-2 py-0.5 rounded-full">
                              <Clock size={12} />
                              {activity.time}
                            </span>
                          )}
                          <p className={cn(
                            "text-lg font-semibold transition-all duration-300",
                            activity.isDone && "line-through text-muted-foreground"
                          )}>
                            {activity.content}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                      onClick={() => deleteActivity.mutate(activity.id)}
                    >
                      <Trash2 size={18} />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
