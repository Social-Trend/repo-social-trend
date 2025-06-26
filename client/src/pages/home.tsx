import { useAuth } from "@/contexts/auth-context";
import OrganizerDashboard from "@/components/organizer-dashboard";
import ProfessionalDashboard from "@/components/professional-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, UserPlus, ArrowRight } from "lucide-react";
import { Link } from "wouter";

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
        {/* New Features Demo Section */}
        <div className="mb-8">
          <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                🎉 New Enhanced Features Available!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="bg-white/80">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <MessageCircle className="h-6 w-6 text-blue-600" />
                      <h3 className="font-semibold text-gray-900">Enhanced Chat Interface</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      WhatsApp-style messaging with bubbles, typing indicators, and modern design
                    </p>
                    <Link href="/messages">
                      <Button size="sm" className="w-full">
                        Try Enhanced Chat <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
                
                <Card className="bg-white/80">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <UserPlus className="h-6 w-6 text-green-600" />
                      <h3 className="font-semibold text-gray-900">Quick Onboarding</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Streamlined 3-step signup process - 70% faster than before
                    </p>
                    <Link href="/test-onboarding">
                      <Button size="sm" variant="outline" className="w-full">
                        View Quick Setup <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
              
              <div className="text-xs text-blue-700 bg-blue-100 p-2 rounded-md">
                💡 <strong>Enhanced Chat:</strong> Go to Messages and click any conversation to see the new interface
              </div>
            </CardContent>
          </Card>
        </div>

        {renderRoleBasedView()}
      </main>
    </div>
  );
}
