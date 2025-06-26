import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import Navigation from "@/components/navigation";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Professionals from "@/pages/professionals";
import Messages from "@/pages/messages";
import Onboarding from "@/pages/onboarding";
import TestOnboarding from "@/pages/test-onboarding";
import Requests from "@/pages/requests";
import PaymentCheckout from "@/pages/payment-checkout";
import Demo from "@/pages/demo";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {isAuthenticated && <Navigation />}
      <Switch>
        <Route path="/" component={isAuthenticated ? Home : Landing} />
        <Route path="/professionals" component={Professionals} />
        <Route path="/messages" component={Messages} />
        <Route path="/requests" component={Requests} />
        <Route path="/onboarding" component={Onboarding} />
        <Route path="/test-onboarding" component={TestOnboarding} />
        <Route path="/payment-checkout" component={PaymentCheckout} />
        <Route path="/demo" component={Demo} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
