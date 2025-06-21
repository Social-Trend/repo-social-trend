import { Calendar, Search, MessageCircle, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import { useProfile } from "@/hooks/useProfile";
import AuthModal from "@/components/auth/auth-modal";
import RoleSwitcher from "@/components/role-switcher";

interface NavigationProps {}

export default function Navigation({}: NavigationProps) {
  const [location] = useLocation();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { hasProfile, profileCompletion } = useProfile();

  const getUserInitials = (user: any) => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.firstName) {
      return user.firstName[0].toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

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

          {/* Auth Section */}
          <div className="flex items-center space-x-3">
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            ) : isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.profileImageUrl || undefined} alt={user.email} />
                      <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem className="flex flex-col items-start">
                    <div className="font-medium">{user.firstName || user.email}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                    {isAuthenticated && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {hasProfile 
                          ? `Profile ${profileCompletion}% complete`
                          : "Profile not created"
                        }
                      </div>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    // Use window.location to ensure auth state is preserved
                    if (isAuthenticated && user) {
                      window.location.href = "/onboarding";
                    } else {
                      window.location.reload(); // Refresh to fix auth state
                    }
                  }}>
                    <User className="mr-2 h-4 w-4" />
                    <span>
                      {hasProfile ? "Edit Profile" : "Create Profile"}
                    </span>
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <AuthModal defaultTab="login" defaultRole="organizer">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  >
                    Sign up/ Log in
                  </Button>
                </AuthModal>
                <AuthModal defaultTab="register" defaultRole="professional">
                  <Button 
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Become a Tender
                  </Button>
                </AuthModal>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
