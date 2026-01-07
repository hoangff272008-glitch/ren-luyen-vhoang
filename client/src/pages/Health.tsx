import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { vi } from "date-fns/locale";
import { motion } from "framer-motion";
import { Heart, Plus, Trophy, CheckCircle2, Circle, Sparkles } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { insertHealthGoalSchema, type HealthGoal, type HealthLog, type InsertHealthGoal } from "@shared/schema";
import { api, buildUrl } from "@shared/routes";
import { cn } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Fun sound effect
const playSuccessSound = () => {
  const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3");
  audio.volume = 0.3;
  audio.play().catch(() => {});
};

const SparkleEffect = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {[...Array(6)].map((_, i) => (
      <div 
        key={i} 
        className="sparkle-particle"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 0.5}s`,
          backgroundColor: i % 2 === 0 ? '#fb7185' : '#fff'
        }}
      />
    ))}
  </div>
);

export default function Health() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const formattedDate = format(selectedDate, "yyyy-MM-dd");
  const { toast } = useToast();
  const [sparklingId, setSparklingId] = useState<number | null>(null);

  const { data: goals, isLoading: goalsLoading } = useQuery<HealthGoal[]>({
    queryKey: [api.healthGoals.list.path],
  });

  const { data: logs, isLoading: logsLoading } = useQuery<HealthLog[]>({
    queryKey: [api.healthLogs.list.path],
  });
  
  const createGoal = useMutation({
    mutationFn: async (data: InsertHealthGoal) => {
      return apiRequest("POST", api.healthGoals.create.path, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.healthGoals.list.path] });
      setIsGoalDialogOpen(false);
      goalForm.reset();
      toast({ title: "Đã thêm mục tiêu mới" });
    }
  });

  const updateLog = useMutation({
    mutationFn: async ({ id, goalId, date, isCompleted, notes }: { id?: number; goalId: number; date: string; isCompleted: boolean; notes?: string }) => {
      if (id) {
        return apiRequest("PUT", buildUrl(api.healthLogs.update.path, { id }), { isCompleted, notes });
      } else {
        return apiRequest("POST", api.healthLogs.create.path, { goalId, date, isCompleted, notes });
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.healthLogs.list.path] });
      if (variables.isCompleted) {
        playSuccessSound();
        setSparklingId(variables.goalId);
        setTimeout(() => setSparklingId(null), 1000);
      }
    },
  });
  
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const goalForm = useForm<InsertHealthGoal>({
    resolver: zodResolver(insertHealthGoalSchema),
    defaultValues: { title: "", description: "", frequency: "daily" }
  });

  const onGoalSubmit = (data: InsertHealthGoal) => {
    createGoal.mutate(data);
  };

  const handleToggle = (goalId: number, existingLog: any) => {
    updateLog.mutate({
      id: existingLog?.id,
      goalId,
      date: formattedDate,
      isCompleted: !existingLog?.isCompleted
    });
  };

  const handleNotes = (goalId: number, notes: string, existingLog: any) => {
    updateLog.mutate({
      id: existingLog?.id,
      goalId,
      date: formattedDate,
      isCompleted: existingLog?.isCompleted ?? false,
      notes
    });
  };

  const startOfCurrentWeek = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startOfCurrentWeek, i));

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-display font-bold flex items-center gap-3">
            <span className="p-2 rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300"><Heart size={32} /></span>
            Theo dõi sức khỏe
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">Kỷ luật hôm nay, tự do ngày mai.</p>
        </div>
        
        <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="rounded-xl h-11 px-6 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-lg shadow-rose-500/25 border-0">
              <Plus className="mr-2 h-5 w-5" /> Thêm mục tiêu
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-panel border-white/20">
            <DialogHeader>
              <DialogTitle>Thêm mục tiêu mới</DialogTitle>
            </DialogHeader>
            <form onSubmit={goalForm.handleSubmit(onGoalSubmit)} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Tên mục tiêu</Label>
                <Input {...goalForm.register("title")} placeholder="Ví dụ: Chạy bộ 5km" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Mô tả (tùy chọn)</Label>
                <Textarea {...goalForm.register("description")} placeholder="Chi tiết..." className="rounded-xl" />
              </div>
              <Button type="submit" disabled={createGoal.isPending} className="w-full rounded-xl bg-rose-500 hover:bg-rose-600">
                Lưu mục tiêu
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="glass-panel p-6 rounded-3xl flex justify-between items-center overflow-x-auto gap-4">
        {weekDays.map((date, i) => {
          const isSelected = isSameDay(date, selectedDate);
          const isToday = isSameDay(date, new Date());
          
          return (
            <button
              key={i}
              onClick={() => setSelectedDate(date)}
              className={cn(
                "flex flex-col items-center justify-center min-w-[4rem] h-24 rounded-2xl transition-all duration-200 border",
                isSelected 
                  ? "bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/30 scale-105" 
                  : "bg-white/40 dark:bg-white/5 border-transparent hover:bg-white/60 text-foreground"
              )}
            >
              <span className="text-xs uppercase font-bold mb-1 opacity-80">
                {format(date, "EEE", { locale: vi })}
              </span>
              <span className={cn("text-2xl font-display font-bold", isToday && !isSelected && "text-rose-500")}>
                {format(date, "d")}
              </span>
              {isToday && isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white mt-2" />}
              {isToday && !isSelected && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2" />}
            </button>
          );
        })}
      </div>

      <div className="space-y-4">
        {goalsLoading ? (
          <div className="h-40 rounded-3xl bg-white/30 animate-pulse" />
        ) : goals?.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground glass-panel rounded-3xl">
            <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Chưa có mục tiêu nào. Hãy thiết lập ngay!</p>
          </div>
        ) : (
          goals?.map((goal) => {
            const log = logs?.find(l => l.goalId === goal.id && l.date === formattedDate);
            const isCompleted = log?.isCompleted ?? false;
            
            return (
              <motion.div 
                key={goal.id}
                layout
                className={cn(
                  "glass-card p-6 rounded-3xl border-l-8 transition-all duration-500 relative overflow-hidden",
                  isCompleted ? "border-l-green-500 bg-green-50/50 dark:bg-green-900/10" : "border-l-rose-500"
                )}
              >
                {sparklingId === goal.id && <SparkleEffect />}
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className={cn("text-xl font-bold font-display", isCompleted && "line-through text-muted-foreground")}>
                        {goal.title}
                      </h3>
                      {isCompleted && <span className="text-green-600 bg-green-100 px-2 py-0.5 rounded-full text-xs font-bold">HOÀN THÀNH</span>}
                    </div>
                    <p className="text-muted-foreground mb-4">{goal.description || "Không có mô tả"}</p>
                    
                    <button
                      onClick={() => handleToggle(goal.id, log)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all",
                        isCompleted 
                          ? "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50" 
                          : "bg-rose-500 text-white shadow-lg shadow-rose-500/20 hover:bg-rose-600 hover:-translate-y-0.5"
                      )}
                    >
                      {isCompleted ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                      {isCompleted ? "Bỏ đánh dấu" : "Đánh dấu hoàn thành"}
                    </button>
                  </div>

                  <div className="flex-1 md:border-l md:pl-6 border-gray-200/50">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">
                      {isCompleted ? "Ghi chú (Tùy chọn)" : "Hình phạt / Lý do chưa làm"}
                    </Label>
                    <Textarea 
                      placeholder={isCompleted ? "Cảm nhận sau khi tập..." : "Nếu không làm, hình phạt là..."}
                      className={cn(
                        "min-h-[80px] bg-white/50 border-0 focus-visible:ring-1 resize-none rounded-xl",
                        !isCompleted && "bg-rose-50/50 dark:bg-rose-900/10 placeholder:text-rose-400/70"
                      )}
                      value={log?.notes || ""}
                      onChange={(e) => handleNotes(goal.id, e.target.value, log)}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
