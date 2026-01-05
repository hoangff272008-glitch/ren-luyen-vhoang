import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Plus, Clock, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useDailyActivities, useCreateDailyActivity, useUpdateDailyActivity, useDeleteDailyActivity } from "@/hooks/use-daily-activities";
import { insertDailyActivitySchema, type InsertDailyActivity } from "@shared/schema";
import { cn } from "@/lib/utils";

export default function Activities() {
  const today = format(new Date(), "yyyy-MM-dd");
  const { data: activities, isLoading } = useDailyActivities(today);
  const createMutation = useCreateDailyActivity();
  const updateMutation = useUpdateDailyActivity();
  const deleteMutation = useDeleteDailyActivity();

  const form = useForm<InsertDailyActivity>({
    resolver: zodResolver(insertDailyActivitySchema),
    defaultValues: { content: "", time: "", date: today, isDone: false }
  });

  const onSubmit = (data: InsertDailyActivity) => {
    createMutation.mutate(data, {
      onSuccess: () => form.reset({ ...data, content: "", time: "" })
    });
  };

  const sortedActivities = activities?.sort((a, b) => {
    if (!a.time) return 1;
    if (!b.time) return -1;
    return a.time.localeCompare(b.time);
  });

  return (
    <div className="min-h-screen pt-32 px-4 pb-20 max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-display font-bold flex items-center justify-center gap-3 mb-2">
          <span className="p-2 rounded-xl bg-amber-100 text-amber-600"><Activity size={32} /></span>
          Hoạt động mỗi ngày
        </h1>
        <p className="text-muted-foreground text-lg">
          {format(new Date(), "EEEE, dd 'tháng' MM, yyyy", { locale: vi })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Input Column */}
        <div className="md:col-span-1">
          <div className="glass-panel p-6 rounded-3xl sticky top-24">
            <h2 className="text-lg font-bold mb-4">Thêm hoạt động</h2>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Input 
                  type="time" 
                  {...form.register("time")} 
                  className="rounded-xl bg-white/50" 
                />
              </div>
              <div>
                <Input 
                  {...form.register("content")} 
                  placeholder="Làm gì..." 
                  className="rounded-xl bg-white/50" 
                />
                {form.formState.errors.content && (
                  <p className="text-red-500 text-xs mt-1">{form.formState.errors.content.message}</p>
                )}
              </div>
              <Button type="submit" disabled={createMutation.isPending} className="w-full rounded-xl bg-amber-500 hover:bg-amber-600 text-white">
                <Plus className="mr-2 h-4 w-4" /> Thêm
              </Button>
            </form>
          </div>
        </div>

        {/* Timeline Column */}
        <div className="md:col-span-2">
          <div className="glass-panel p-6 rounded-3xl min-h-[400px]">
            {isLoading ? (
              <div className="space-y-4">
                {[1,2,3].map(i => <div key={i} className="h-16 bg-black/5 rounded-xl animate-pulse" />)}
              </div>
            ) : sortedActivities?.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-60">
                <p>Trống trơn...</p>
                <p className="text-sm">Hãy thêm kế hoạch cho hôm nay!</p>
              </div>
            ) : (
              <div className="space-y-4 relative">
                {/* Timeline Line */}
                <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-gray-200 dark:bg-white/10 -z-10" />
                
                <AnimatePresence>
                  {sortedActivities?.map((activity) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-2xl border transition-all hover:shadow-md bg-white/80 dark:bg-black/20",
                        activity.isDone ? "opacity-60 border-transparent bg-gray-50/50" : "border-white/40"
                      )}
                    >
                      <Checkbox 
                        checked={activity.isDone || false}
                        onCheckedChange={(checked) => updateMutation.mutate({ id: activity.id, isDone: !!checked })}
                        className="w-6 h-6 rounded-full border-2 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wide mb-0.5">
                          <Clock size={12} />
                          {activity.time || "Mọi lúc"}
                        </div>
                        <p className={cn("font-medium text-lg", activity.isDone && "line-through text-muted-foreground")}>
                          {activity.content}
                        </p>
                      </div>

                      <button 
                        onClick={() => deleteMutation.mutate(activity.id)}
                        className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
