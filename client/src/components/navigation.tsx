import { Calendar, Users, Building, Search, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import GoogleAuthButton from "@/components/google-auth-button";
import type { UserType } from "@/pages/home";

interface NavigationProps {
  userType: UserType;
  onUserTypeChange: (type: UserType) => void;
}

export default function Navigation({ userType, onUserTypeChange }: NavigationProps) {
  const [location] = useLocation();

  return (
    <header className="bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link href="/">
              <div className="flex items-center space-x-3 cursor-pointer">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-primary-foreground" />
                </div>
                <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">SocialTend</h1>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/">
              <Button 
                variant={location === "/" ? "secondary" : "ghost"}
                size="sm"
                className="text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              >
                Home
              </Button>
            </Link>
            <Link href="/professionals">
              <Button 
                variant={location === "/professionals" ? "secondary" : "ghost"}
                size="sm"
                className="text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              >
                <Search className="h-4 w-4 mr-2" />
                Browse Professionals
              </Button>
            </Link>
            <Link href="/messages">
              <Button 
                variant={location === "/messages" ? "secondary" : "ghost"}
                size="sm"
                className="text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Messages
              </Button>
            </Link>
          </div>

          {/* User Type Toggle and Auth */}
          <div className="flex items-center space-x-2">
            <Button
              variant={userType === "organizer" ? "default" : "ghost"}
              size="sm"
              onClick={() => onUserTypeChange("organizer")}
              className={`
                px-3 py-2 text-sm font-medium rounded-md transition-all duration-200
                ${userType === "organizer" 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
                }
              `}
            >
              <Users className="h-4 w-4 mr-2" />
              Event Organizer
            </Button>
            <Button
              variant={userType === "professional" ? "default" : "ghost"}
              size="sm"
              onClick={() => onUserTypeChange("professional")}
              className={`
                px-3 py-2 text-sm font-medium rounded-md transition-all duration-200
                ${userType === "professional" 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
                }
              `}
            >
              <Building className="h-4 w-4 mr-2" />
              Professional
            </Button>
            <GoogleAuthButton />
          </div>
        </div>
      </div>
    </header>
  );
}
