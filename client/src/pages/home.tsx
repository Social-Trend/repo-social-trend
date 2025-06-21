import { useAuth } from "@/contexts/auth-context";
import OrganizerDashboard from "@/components/organizer-dashboard";
import ProfessionalDashboard from "@/components/professional-dashboard";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  const renderRoleBasedView = () => {
    if (!isAuthenticated || !user) {
      return <OrganizerDashboard />; // Default to organizer dashboard for non-authenticated users
    }

    if (user.role === 'professional') {
      return <ProfessionalDashboard />;
    }

    return <OrganizerDashboard />;
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderRoleBasedView()}
      </main>
    </div>
  );
}
