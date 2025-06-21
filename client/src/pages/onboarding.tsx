import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import { useProfile } from "@/hooks/useProfile";
import ProfessionalProfileForm from "@/components/profile/professional-profile-form";
import OrganizerProfileForm from "@/components/profile/organizer-profile-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Users, Briefcase, ArrowRight } from "lucide-react";

export default function Onboarding() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  const handleProfileSuccess = () => {
    setLocation("/");
  };

  const handleSkip = () => {
    setLocation("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    console.log("Onboarding - redirecting due to auth failure");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4">Authentication required</p>
          <p className="text-sm text-gray-600 mb-4">Please log in to create your profile</p>
          <button 
            onClick={() => setLocation("/")} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  console.log("Onboarding - rendering form for user:", user.email, "role:", user.role);



  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-500 mr-3" />
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
              Welcome to SocialTend!
            </h1>
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-2">
            Hi {user.firstName || user.email}! Let's set up your profile to get started.
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-slate-500">
            {user.role === "professional" ? (
              <>
                <Briefcase className="h-4 w-4" />
                <span>Professional Account</span>
              </>
            ) : (
              <>
                <Users className="h-4 w-4" />
                <span>Organizer Account</span>
              </>
            )}
          </div>
        </div>

        {/* Onboarding Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <span className="ml-2 text-sm font-medium text-green-600">Account Created</span>
            </div>
            <div className="w-8 h-0.5 bg-slate-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">2</span>
              </div>
              <span className="ml-2 text-sm font-medium text-primary">Profile Setup</span>
            </div>
            <div className="w-8 h-0.5 bg-slate-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center">
                <span className="text-slate-600 font-semibold text-sm">3</span>
              </div>
              <span className="ml-2 text-sm font-medium text-slate-600">Get Started</span>
            </div>
          </div>
        </div>

        {/* Profile Creation Form */}
        <div className="mb-8">
          {user.role === "professional" ? (
            <ProfessionalProfileForm
              userId={user.id}
              onSuccess={handleProfileSuccess}
              onCancel={handleSkip}
            />
          ) : (
            <OrganizerProfileForm
              userId={user.id}
              onSuccess={handleProfileSuccess}
              onCancel={handleSkip}
            />
          )}
        </div>

        {/* Benefits Card */}
        <Card className="mt-8 max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center">
              {user.role === "professional" 
                ? "Why complete your professional profile?" 
                : "Why complete your organizer profile?"
              }
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user.role === "professional" ? (
                <>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Get More Bookings</h4>
                      <p className="text-sm text-slate-600">Complete profiles get 3x more inquiries</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Build Trust</h4>
                      <p className="text-sm text-slate-600">Photos and bios help clients choose you</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Set Your Rates</h4>
                      <p className="text-sm text-slate-600">Display pricing to attract right clients</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Show Expertise</h4>
                      <p className="text-sm text-slate-600">Highlight your skills and experience</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Find Better Matches</h4>
                      <p className="text-sm text-slate-600">Get recommendations based on your events</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Save Time</h4>
                      <p className="text-sm text-slate-600">Pre-filled contact forms for faster booking</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Track History</h4>
                      <p className="text-sm text-slate-600">Keep records of your past events and hires</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Build Network</h4>
                      <p className="text-sm text-slate-600">Connect with trusted professionals</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}