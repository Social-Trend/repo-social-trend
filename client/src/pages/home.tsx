import { useState } from "react";
import Navigation from "@/components/navigation";
import OrganizerView from "@/components/organizer-view";
import ProfessionalView from "@/components/professional-view";

export type UserType = "organizer" | "professional";

export default function Home() {
  const [userType, setUserType] = useState<UserType>("organizer");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navigation userType={userType} onUserTypeChange={setUserType} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {userType === "organizer" ? (
          <OrganizerView />
        ) : (
          <ProfessionalView />
        )}
      </main>
    </div>
  );
}
