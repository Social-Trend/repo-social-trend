import OrganizerProfileForm from "@/components/profile/organizer-profile-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestOnboarding() {
  // Test with hardcoded values to bypass auth issues
  const testUserId = 1;
  
  const handleSuccess = () => {
    console.log("Profile created successfully!");
  };

  const handleCancel = () => {
    console.log("Profile creation cancelled");
  };

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