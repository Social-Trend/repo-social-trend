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
import AdminFeedback from "@/pages/admin-feedback";
import NotFound from "@/pages/not-found";
import FloatingFeedbackButton from "@/components/feedback/floating-feedback-button";
import ExitIntentModal from "@/components/feedback/exit-intent-modal";
import { useState, useEffect } from "react";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [showExitIntent, setShowExitIntent] = useState(false);
  const [hasShownExitIntent, setHasShownExitIntent] = useState(false);

  // Exit intent detection
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (
        !hasShownExitIntent &&
        e.clientY <= 0 &&
        e.relatedTarget === null
      ) {
        setShowExitIntent(true);
        setHasShownExitIntent(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [hasShownExitIntent]);

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
        <Route path="/admin/feedback" component={AdminFeedback} />
        <Route component={NotFound} />
      </Switch>
      
      {/* Feedback System */}
      <FloatingFeedbackButton />
      <ExitIntentModal 
        isOpen={showExitIntent} 
        onClose={() => setShowExitIntent(false)} 
      />
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
