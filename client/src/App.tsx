import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { api } from "@shared/routes";
import { Button } from "@/components/ui/button";
import { Loader2, LogIn } from "lucide-react";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Study from "@/pages/Study";
import Health from "@/pages/Health";
import Activities from "@/pages/Activities";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/study" component={Study} />
      <Route path="/health" component={Health} />
      <Route path="/activities" component={Activities} />
      <Route component={NotFound} />
    </Switch>
  );
}

function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="max-w-md w-full text-center space-y-8 bg-card p-8 rounded-lg shadow-lg border">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Việt Hoàng Productivity</h1>
          <p className="text-muted-foreground">Vui lòng đăng nhập để tiếp tục quản lý công việc và sức khỏe</p>
        </div>
        <Button size="lg" className="w-full" onClick={() => window.location.href = '/login'}>
          <LogIn className="mr-2 h-5 w-5" />
          Đăng nhập với Replit
        </Button>
      </div>
    </div>
  );
}

function AppContent() {
  const { data: user, isLoading } = useQuery({
    queryKey: [api.auth.user.path],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const style = {
    "--sidebar-width": "18rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full bg-background overflow-hidden">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center justify-between p-4 border-b h-16 shrink-0 bg-card/50 backdrop-blur-sm z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h2 className="text-lg font-semibold truncate">Việt Hoàng</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:inline-block">Xin chào, {user.firstName || 'Người dùng'}</span>
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8">
            <Router />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContent />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
