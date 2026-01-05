import { Link, useLocation } from "wouter";
import { BookOpen, Activity, Heart, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/study", label: "Học tập", icon: BookOpen },
  { href: "/health", label: "Sức khỏe", icon: Heart },
  { href: "/activities", label: "Hoạt động", icon: Activity },
];

export function Navigation() {
  const [location] = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-30 flex justify-center p-4 pointer-events-none">
      <div className="glass-panel rounded-full px-2 py-2 flex gap-1 pointer-events-auto shadow-2xl ring-1 ring-white/20">
        {NAV_ITEMS.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "relative flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-300 font-medium text-sm md:text-base group",
                isActive 
                  ? "text-white" 
                  : "text-muted-foreground hover:text-foreground hover:bg-white/40 dark:hover:bg-white/10"
              )}
            >
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full -z-10 shadow-lg" />
              )}
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              <span className={cn(isActive ? "opacity-100" : "opacity-0 md:opacity-100 transition-opacity")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
