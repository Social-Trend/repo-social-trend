import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SimpleAuthProvider, useSimpleAuth } from "@/contexts/simple-auth-context";

// Force clear invalid tokens on app initialization
const clearInvalidTokens = () => {
  const token = localStorage.getItem('authToken');
  if (token && token.split('.').length !== 3) {
    console.log('App initialization: Clearing invalid token format');
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  }
};

// Run token cleanup immediately
clearInvalidTokens();
import { AuthProvider } from "@/contexts/auth-context";
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
import { ExitIntentProvider, useExitIntent } from "@/contexts/exit-intent-context";
import { useEffect } from "react";

function Router() {
  const { isAuthenticated, isLoading } = useSimpleAuth();
  
  // Direct token check for debugging
  const hasToken = localStorage.getItem("token");
  console.log("Router - Auth status:", { isAuthenticated, isLoading, hasToken: !!hasToken });
  const { showExitIntent, hasShownExitIntent, triggerExitIntent, closeExitIntent, proceedWithLogout } = useExitIntent();

  // Exit intent detection - only on browser close attempts
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!hasShownExitIntent && isAuthenticated) {
        // Show exit intent modal instead of browser's default dialog
        e.preventDefault();
        triggerExitIntent();
        return e.returnValue = '';
      }
    };

    if (isAuthenticated) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasShownExitIntent, isAuthenticated, triggerExitIntent]);

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
        onClose={closeExitIntent}
        onProceedWithLogout={proceedWithLogout}
      />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SimpleAuthProvider>
        <AuthProvider>
          <ExitIntentProvider>
            <TooltipProvider>
              <Router />
              <Toaster />
            </TooltipProvider>
          </ExitIntentProvider>
        </AuthProvider>
      </SimpleAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
