import { Calendar, Users, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UserType } from "@/pages/home";

interface NavigationProps {
  userType: UserType;
  onUserTypeChange: (type: UserType) => void;
}

export default function Navigation({ userType, onUserTypeChange }: NavigationProps) {
  return (
    <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Calendar className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-slate-800">SocialTend</h1>
          </div>

          {/* User Type Toggle */}
          <div className="flex items-center space-x-4">
            <div className="bg-slate-100 p-1 rounded-lg flex" role="tablist" aria-label="User type selection">
              <Button
                variant={userType === "organizer" ? "default" : "ghost"}
                size="sm"
                onClick={() => onUserTypeChange("organizer")}
                className={`
                  px-4 py-2 text-sm font-medium rounded-md transition-all duration-200
                  ${userType === "organizer" 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-slate-600 hover:text-slate-800 hover:bg-slate-200"
                  }
                `}
                role="tab"
                aria-selected={userType === "organizer"}
              >
                <Users className="h-4 w-4 mr-2" />
                Event Organizer
              </Button>
              <Button
                variant={userType === "professional" ? "default" : "ghost"}
                size="sm"
                onClick={() => onUserTypeChange("professional")}
                className={`
                  px-4 py-2 text-sm font-medium rounded-md transition-all duration-200
                  ${userType === "professional" 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-slate-600 hover:text-slate-800 hover:bg-slate-200"
                  }
                `}
                role="tab"
                aria-selected={userType === "professional"}
              >
                <Building className="h-4 w-4 mr-2" />
                Hospitality Professional
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
