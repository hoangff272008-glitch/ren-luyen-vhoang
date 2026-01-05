import { motion } from "framer-motion";
import { Link } from "wouter";
import { BookOpen, Activity, Heart, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

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
        className="space-y-12"
      >
        <div className="text-center space-y-4">
          <motion.div variants={item}>
            <span className="px-4 py-1.5 rounded-full bg-white/50 border border-white/40 text-sm font-medium text-foreground/80 backdrop-blur-sm">
              {format(new Date(), "EEEE, dd 'tháng' MM, yyyy", { locale: vi })}
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
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.color} opacity-20 blur-3xl rounded-full transform translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-500`} />
                
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
      </motion.div>
    </div>
  );
}
