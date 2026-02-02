/**
 * App.tsx - Roteamento e layout principal
 * Design Philosophy: Minimalismo Corporativo
 */

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Sidebar } from "./components/Sidebar";

// Pages
import Inbox from "./pages/Inbox";
import Chat from "./pages/Chat";
import Leads from "./pages/Leads";
import Orders from "./pages/Orders";
import Inventory from "./pages/Inventory";
import Referrals from "./pages/Referrals";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

function Router() {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <Switch>
          <Route path="/" component={Inbox} />
          <Route path="/chat" component={Chat} />
          <Route path="/leads" component={Leads} />
          <Route path="/orders" component={Orders} />
          <Route path="/inventory" component={Inventory} />
          <Route path="/referrals" component={Referrals} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/404" component={NotFound} />
          {/* Final fallback route */}
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
