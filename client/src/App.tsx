import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Dashboard from "@/pages/Dashboard";
import Study from "@/pages/Study";
import Health from "@/pages/Health";
import Activities from "@/pages/Activities";
import NotFound from "@/pages/not-found";

import { WelcomeOverlay } from "@/components/WelcomeOverlay";
import { MusicPlayer } from "@/components/MusicPlayer";
import { Navigation } from "@/components/Navigation";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/study" component={Study} />
      <Route path="/health" component={Health} />
      <Route path="/activities" component={Activities} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-fixed bg-cover selection:bg-primary selection:text-white">
          <WelcomeOverlay />
          <Navigation />
          <Router />
          <MusicPlayer />
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
