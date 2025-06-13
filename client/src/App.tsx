import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Navigation from "./components/navigation";
import Home from "./pages/home";
import Professionals from "./pages/professionals";
import CreateProfessionalProfile from "./components/create-professional-profile";
import NotFound from "./pages/not-found";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        <Navigation />
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/professionals" component={Professionals} />
          <Route path="/create-profile" component={CreateProfessionalProfile} />
          <Route component={NotFound} />
        </Switch>
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default App;