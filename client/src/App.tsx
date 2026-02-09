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
import { AdminGuard } from "./components/AdminGuard";
import { useAuth } from "@/_core/hooks/useAuth";

// Pages
import Login from "./pages/Login";
import Inbox from "./pages/Inbox";
import Chat from "./pages/Chat";
import Connections from "./pages/Connections";
import Contacts from "./pages/Contacts";
import QuickReplies from "./pages/QuickReplies";
import ScheduledMessages from "./pages/ScheduledMessages";
import Leads from "./pages/Leads";
import Orders from "./pages/Orders";
import Products from "./pages/Products";
import ProductsInventory from "./pages/ProductsInventory";
import Referrals from "./pages/Referrals";
import Dashboard from "./pages/Dashboard";
import Schedule from "./pages/Schedule";
import ManagerDashboard from "./pages/ManagerDashboard";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

function Router() {
  const { user, loading } = useAuth();

  // Se ainda está carregando, mostra loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não está autenticado, mostra login
  if (!user) {
    return <Login />;
  }

  // Se está autenticado, mostra app com sidebar
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <Switch>
          <Route path="/">
            <AdminGuard><Inbox /></AdminGuard>
          </Route>
          <Route path="/chat">
            <AdminGuard><Chat /></AdminGuard>
          </Route>
          <Route path="/connections">
            <AdminGuard><Connections /></AdminGuard>
          </Route>
          <Route path="/contacts" component={Contacts} />
          <Route path="/quick-replies" component={QuickReplies} />
          <Route path="/scheduled-messages" component={ScheduledMessages} />
          <Route path="/leads">
            <AdminGuard><Leads /></AdminGuard>
          </Route>
          <Route path="/orders" component={Orders} />
          <Route path="/products" component={Products} />
          <Route path="/products-inventory" component={ProductsInventory} />
          <Route path="/referrals" component={Referrals} />
          <Route path="/schedule" component={Schedule} />
          <Route path="/dashboard">
            <AdminGuard><Dashboard /></AdminGuard>
          </Route>
          <Route path="/manager">
            <AdminGuard><ManagerDashboard /></AdminGuard>
          </Route>
          <Route path="/settings" component={Settings} />
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
      <ThemeProvider defaultTheme="light" switchable>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
