import { motion } from "framer-motion";
import { Link } from "wouter";
import { BookOpen, Activity, Heart, ArrowRight, Calendar, CheckCircle2, Clock } from "lucide-react";
import { format, subDays, startOfDay } from "date-fns";
import { vi } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import type { DailyActivity } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "Ghi chú học tập",
    desc: "Sắp xếp kiến thức rõ ràng & dễ hiểu",
    icon: BookOpen,
    href: "/study",
    color: "from-blue-500 to-cyan-500",
    shadow: "shadow-blue-500/20"
  },
  {
    title: "Theo dõi sức khỏe",
    desc: "Mục tiêu, hình phạt & kỷ luật bản thân",
    icon: Heart,
    href: "/health",
    color: "from-rose-500 to-pink-500",
    shadow: "shadow-rose-500/20"
  },
  {
    title: "Hoạt động mỗi ngày",
    desc: "Timeline công việc & check-list",
    icon: Activity,
    href: "/activities",
    color: "from-amber-400 to-orange-500",
    shadow: "shadow-orange-500/20"
  }
];

export default function Dashboard() {
  const today = new Date();
  const last7Days = Array.from({ length: 7 }).map((_, i) => format(subDays(today, i), "yyyy-MM-dd")).reverse();

  const { data: allActivities, isLoading } = useQuery<DailyActivity[]>({
    queryKey: [api.dailyActivities.list.path, "all"],
    queryFn: async () => {
      const res = await fetch(api.dailyActivities.list.path);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    }
  });

  const activitiesByDate = last7Days.map(date => ({
    date,
    tasks: allActivities?.filter(a => a.date === date).sort((a, b) => (a.time || "").localeCompare(b.time || "")) || []
  })).filter(d => d.tasks.length > 0);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen pt-32 px-4 pb-20 max-w-7xl mx-auto">
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-16"
      >
        <div className="text-center space-y-4">
          <motion.div variants={item}>
            <span className="px-4 py-1.5 rounded-full bg-white/50 border border-white/40 text-sm font-medium text-foreground/80 backdrop-blur-sm">
              {format(today, "EEEE, dd 'tháng' MM, yyyy", { locale: vi })}
            </span>
          </motion.div>
          <motion.h1 variants={item} className="text-4xl md:text-6xl font-display font-bold text-foreground">
            Trung tâm kiểm soát <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
              Cuộc sống của bạn
            </span>
          </motion.h1>
          <motion.p variants={item} className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Quản lý việc học, sức khỏe và thói quen hàng ngày trong một giao diện đẹp mắt.
          </motion.p>
        </div>

        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, idx) => (
            <Link key={idx} href={feature.href} className="group block h-full">
              <div className={`h-full relative overflow-hidden rounded-3xl bg-white/60 dark:bg-zinc-900/60 border border-white/40 dark:border-white/10 p-8 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 shadow-xl hover:shadow-2xl ${feature.shadow}`}>
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.color} opacity-20 blur-3xl rounded-full transform translate-x(10) -translate-y(10) group-hover:scale-150 transition-transform duration-500`} />
                
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-6 shadow-lg group-hover:shadow-xl transition-all`}>
                  <feature.icon size={28} />
                </div>
                
                <h3 className="text-2xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-muted-foreground text-lg mb-8">{feature.desc}</p>
                
                <div className="flex items-center gap-2 font-semibold text-sm uppercase tracking-wider text-primary group-hover:gap-4 transition-all">
                  Truy cập <ArrowRight size={16} />
                </div>
              </div>
            </Link>
          ))}
        </motion.div>

        {/* Hoạt động gần đây */}
        <motion.div variants={item} className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-600">
              <Calendar size={24} />
            </div>
            <h2 className="text-3xl font-bold font-display">Hoạt động gần đây</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {isLoading ? (
              <div className="col-span-full h-48 rounded-3xl bg-white/30 animate-pulse" />
            ) : activitiesByDate.length === 0 ? (
              <Card className="col-span-full rounded-3xl border-dashed bg-transparent">
                <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Activity size={48} className="mb-4 opacity-20" />
                  <p>Chưa có dữ liệu hoạt động trong 7 ngày qua.</p>
                  <Link href="/activities" className="mt-4 text-primary font-bold hover:underline">Bắt đầu lên lịch ngay</Link>
                </CardContent>
              </Card>
            ) : (
              activitiesByDate.map((day, idx) => (
                <Card key={idx} className="rounded-3xl border-white/40 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md overflow-hidden hover:shadow-lg transition-all">
                  <CardHeader className="border-b border-white/20 bg-white/20 pb-4">
                    <CardTitle className="text-lg font-bold flex justify-between items-center">
                      <span>{format(new Date(day.date), "EEEE, dd/MM", { locale: vi })}</span>
                      <span className="text-xs font-bold px-2 py-1 rounded-full bg-amber-100 text-amber-600">{day.tasks.length} hoạt động</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-white/10">
                      {day.tasks.map((task) => (
                        <div key={task.id} className="flex items-center gap-4 p-4 hover:bg-white/30 transition-colors">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            task.isDone ? "bg-green-500" : "bg-amber-500"
                          )} />
                          <div className="flex-1 flex items-center justify-between gap-4">
                            <span className={cn(
                              "font-medium",
                              task.isDone && "line-through text-muted-foreground"
                            )}>
                              {task.content}
                            </span>
                            {task.time && (
                              <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                                <Clock size={12} />
                                {task.time}
                              </span>
                            )}
                          </div>
                          {task.isDone && <CheckCircle2 size={16} className="text-green-500" />}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
