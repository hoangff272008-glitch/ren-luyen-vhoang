import { motion } from "framer-motion";
import { Link } from "wouter";
import { 
  BookOpen, Activity, Heart, ArrowRight, Calendar, 
  CheckCircle2, Clock, Timer, TrendingUp, Sparkles, 
  RefreshCw, Copy, Download 
} from "lucide-react";
import { format, subDays } from "date-fns";
import { vi } from "date-fns/locale";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import type { DailyActivity, HealthLog, HealthGoal } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

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

function Pomodoro() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [customTime, setCustomTime] = useState("25");

  useEffect(() => {
    let interval: any;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          setIsActive(false);
          const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3");
          audio.play().catch(() => {});
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, minutes, seconds]);

  const handleSetTime = () => {
    const mins = parseInt(customTime);
    if (!isNaN(mins) && mins > 0 && mins <= 120) {
      setMinutes(mins);
      setSeconds(0);
      setIsActive(false);
    }
  };

  return (
    <Card className="glass-card overflow-hidden">
      <CardHeader className="bg-primary/10 pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Timer className="text-primary" size={20} />
          Tập trung (Pomodoro)
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 text-center">
        <div className="text-5xl font-display font-bold mb-6">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
        
        <div className="flex gap-2 mb-6">
          <Input 
            type="number" 
            value={customTime} 
            onChange={(e) => setCustomTime(e.target.value)}
            className="rounded-xl text-center"
            min="1"
            max="120"
          />
          <Button variant="outline" onClick={handleSetTime} className="rounded-xl">
            Đặt
          </Button>
        </div>

        <div className="flex gap-2 justify-center">
          <Button 
            onClick={() => setIsActive(!isActive)}
            variant={isActive ? "outline" : "default"}
            className="rounded-xl w-24"
          >
            {isActive ? "Tạm dừng" : "Bắt đầu"}
          </Button>
          <Button 
            onClick={() => { setIsActive(false); setMinutes(parseInt(customTime) || 25); setSeconds(0); }}
            variant="ghost"
            className="rounded-xl"
          >
            Đặt lại
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const today = new Date();
  const { toast } = useToast();
  const [syncKey, setSyncKey] = useState("");
  const [displayName, setDisplayName] = useState(() => localStorage.getItem("display-name") || "Việt Hoàng");

  useEffect(() => {
    const handleUpdate = () => setDisplayName(localStorage.getItem("display-name") || "Việt Hoàng");
    window.addEventListener("display-name-updated", handleUpdate);
    return () => window.removeEventListener("display-name-updated", handleUpdate);
  }, []);

  const last7Days = Array.from({ length: 7 }).map((_, i) => format(subDays(today, i), "yyyy-MM-dd")).reverse();

  const { data: quote } = useQuery({
    queryKey: [api.quotes.random.path],
    queryFn: () => fetch(api.quotes.random.path).then(res => res.json()),
    retry: false
  });

  const { data: allActivities, isLoading: activitiesLoading } = useQuery<DailyActivity[]>({
    queryKey: [api.dailyActivities.list.path, "all"],
  });

  const { data: healthLogs } = useQuery<HealthLog[]>({
    queryKey: [api.healthLogs.list.path],
  });

  const { data: healthGoals } = useQuery<HealthGoal[]>({
    queryKey: [api.healthGoals.list.path],
  });

  const createSyncKey = useMutation({
    mutationFn: () => apiRequest("POST", api.sync.create.path),
    onSuccess: (data: { key: string }) => {
      setSyncKey(data.key);
      toast({ title: "Đã tạo mã sao lưu", description: `Mã của bạn: ${data.key}` });
    }
  });

  const loadSyncData = useMutation({
    mutationFn: (key: string) => fetch(`/api/sync/${key}`).then(res => res.json()),
    onSuccess: () => {
      window.location.reload();
      toast({ title: "Đồng bộ thành công" });
    }
  });

  const activitiesByDate = last7Days.map(date => ({
    date,
    tasks: allActivities?.filter(a => a.date === date).sort((a, b) => (a.time || "").localeCompare(b.time || "")) || []
  })).filter(d => d.tasks.length > 0);

  // Stats calculation
  const completedTasks = allActivities?.filter(a => a.isDone).length || 0;
  const healthProgress = healthGoals?.length 
    ? Math.round((healthLogs?.filter(l => l.isCompleted).length || 0) / (healthGoals.length * 7) * 100)
    : 0;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen pt-32 px-4 pb-20 max-w-7xl mx-auto">
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-16">
        {/* Header & Quote */}
        <div className="text-center space-y-6">
          <motion.div variants={item}>
            <span className="px-4 py-1.5 rounded-full bg-white/50 border border-white/40 text-sm font-medium text-foreground/80 backdrop-blur-sm">
              {format(today, "EEEE, dd 'tháng' MM, yyyy", { locale: vi })}
            </span>
          </motion.div>
          <motion.h1 variants={item} className="text-4xl md:text-6xl font-display font-bold text-foreground">
            Chào {displayName}, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
              Hôm nay thế nào?
            </span>
          </motion.h1>
          {quote && (
            <motion.div variants={item} className="max-w-2xl mx-auto p-6 rounded-3xl bg-primary/5 border border-primary/10 italic text-lg text-muted-foreground relative">
              <Sparkles className="absolute -top-3 -left-3 text-amber-400" size={24} />
              "{quote.content}"
              <p className="not-italic font-bold text-primary mt-2">— {quote.author}</p>
            </motion.div>
          )}
        </div>

        {/* Sync & Backup Section */}
        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <RefreshCw size={20} className="text-primary" />
                Sao lưu dữ liệu (Sync)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Tạo mã để chuyển dữ liệu sang thiết bị khác hoặc khôi phục.</p>
              <div className="flex gap-2">
                <Button onClick={() => createSyncKey.mutate()} disabled={createSyncKey.isPending} className="rounded-xl flex-1">
                  <Download size={16} className="mr-2" /> Tạo mã mới
                </Button>
                {syncKey && (
                  <Button variant="outline" className="rounded-xl font-mono text-primary font-bold" onClick={() => {
                    navigator.clipboard.writeText(syncKey);
                    toast({ title: "Đã sao chép mã" });
                  }}>
                    {syncKey} <Copy size={14} className="ml-2" />
                  </Button>
                )}
              </div>
              <div className="flex gap-2 pt-2">
                <Input 
                  placeholder="Nhập mã 8 ký tự để đồng bộ..." 
                  className="rounded-xl"
                  id="sync-input"
                />
                <Button variant="secondary" className="rounded-xl" onClick={() => {
                  const input = document.getElementById('sync-input') as HTMLInputElement;
                  if (input.value) loadSyncData.mutate(input.value);
                }}>
                  Đồng bộ
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card className="glass-card bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-200/20">
              <CardContent className="p-6">
                <div className="p-2 w-fit rounded-lg bg-blue-500 text-white mb-4">
                  <CheckCircle2 size={20} />
                </div>
                <div className="text-3xl font-bold">{completedTasks}</div>
                <div className="text-sm text-muted-foreground">Công việc đã xong</div>
              </CardContent>
            </Card>
            <Card className="glass-card bg-gradient-to-br from-rose-500/10 to-pink-500/10 border-rose-200/20">
              <CardContent className="p-6">
                <div className="p-2 w-fit rounded-lg bg-rose-500 text-white mb-4">
                  <TrendingUp size={20} />
                </div>
                <div className="text-3xl font-bold">{healthProgress}%</div>
                <div className="text-sm text-muted-foreground">Sức khỏe tuần này</div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Features & Tools */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <Link key={idx} href={feature.href} className="group block h-full">
                <div className={cn(
                  "h-full relative overflow-hidden rounded-3xl glass-card p-6 shadow-xl",
                  feature.shadow
                )}>
                  <div className={cn("w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white mb-4 shadow-lg", feature.color)}>
                    <feature.icon size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{feature.desc}</p>
                </div>
              </Link>
            ))}
          </div>
          <Pomodoro />
        </div>

        {/* Recent Activities */}
        <motion.div variants={item} className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-600">
              <Calendar size={24} />
            </div>
            <h2 className="text-3xl font-bold font-display">Hoạt động gần đây</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {activitiesLoading ? (
              <div className="col-span-full h-48 rounded-3xl bg-white/30 animate-pulse" />
            ) : activitiesByDate.length === 0 ? (
              <Card className="col-span-full rounded-3xl border-dashed bg-transparent">
                <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Activity size={48} className="mb-4 opacity-20" />
                  <p>Chưa có dữ liệu hoạt động trong 7 ngày qua.</p>
                </CardContent>
              </Card>
            ) : (
              activitiesByDate.map((day, idx) => (
                <Card key={idx} className="rounded-3xl border-white/40 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md overflow-hidden hover:shadow-lg transition-all">
                  <CardHeader className="border-b border-white/20 bg-white/20 pb-4 px-6">
                    <CardTitle className="text-lg font-bold flex justify-between items-center">
                      <span>{format(new Date(day.date), "EEEE, dd/MM", { locale: vi })}</span>
                      <span className="text-xs font-bold px-2 py-1 rounded-full bg-amber-100 text-amber-600">{day.tasks.length} hoạt động</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-white/10">
                      {day.tasks.map((task) => (
                        <div key={task.id} className="flex items-center gap-4 p-4 hover:bg-white/30 transition-colors px-6">
                          <div className={cn("w-2 h-2 rounded-full", task.isDone ? "bg-green-500" : "bg-amber-500")} />
                          <div className="flex-1 flex items-center justify-between gap-4">
                            <span className={cn("font-medium", task.isDone && "line-through text-muted-foreground")}>{task.content}</span>
                            {task.time && <span className="text-xs font-bold text-muted-foreground flex items-center gap-1"><Clock size={12} />{task.time}</span>}
                          </div>
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
