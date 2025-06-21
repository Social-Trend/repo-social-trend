import { useState } from "react";
import OrganizerProfileForm from "@/components/profile/organizer-profile-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function TestOnboarding() {
  const [showForm, setShowForm] = useState(false);
  const testUserId = 1;
  
  const handleSuccess = () => {
    console.log("Profile created successfully!");
    alert("Profile created successfully! You can now go back to the main app.");
    // Redirect to home after successful profile creation
    window.location.href = "/";
  };

  const handleCancel = () => {
    console.log("Profile creation cancelled");
    setShowForm(false);
  };

  if (!showForm) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Profile Form Test</CardTitle>
              <CardDescription>
                This bypasses authentication to test the profile creation form directly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                First, you need to be logged in to create a profile. Please log in using the "Sign up/Log in" button in the navigation, then come back here.
              </p>
              <Button onClick={() => setShowForm(true)} className="w-full">
                Show Profile Creation Form
              </Button>
              <Button onClick={() => window.location.href = "/"} variant="outline" className="w-full">
                Go Back to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
            Test Profile Form
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Direct test of the organizer profile form
          </p>
        </div>

        <OrganizerProfileForm
          userId={testUserId}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}