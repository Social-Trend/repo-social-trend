import { Calendar, Search, MessageCircle, LogOut, User, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { useProfile } from "@/hooks/useProfile";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { apiRequest } from "@/lib/queryClient";
import AuthModal from "@/components/auth/auth-modal";
import RoleSwitcher from "@/components/role-switcher";
import { Badge } from "@/components/ui/badge";
import ChatModal from "@/components/chat-modal";
import type { Conversation } from "@shared/schema";

interface NavigationProps {}

export default function Navigation({}: NavigationProps) {
  const [location] = useLocation();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { hasProfile, profileCompletion } = useProfile();
  const { unreadCount, hasUnreadMessages, resetNotifications, clearNotificationForConversation } = useUnreadMessages();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Fetch conversations for the Messages button
  const { data: conversations = [] } = useQuery({
    queryKey: ["/api/conversations", { userId: user?.id }],
    queryFn: () => apiRequest("/api/conversations"),
    enabled: isAuthenticated && !!user,
  });

  const getUserInitials = (user: any) => {
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  return (
    <>
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

            {/* Navigation Menu */}
            <div className="flex items-center space-x-1">
              <Link href="/">
                <Button 
                  variant={location === "/" ? "secondary" : "ghost"}
                  size="sm"
                  className="text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Home
                </Button>
              </Link>
              
              {user?.role !== "professional" && (
                <Link href="/professionals">
                  <Button 
                    variant={location === "/professionals" ? "secondary" : "ghost"}
                    size="sm"
                    className="text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Find Professionals
                  </Button>
                </Link>
              )}
              
              <Button 
                variant="ghost"
                size="sm"
                className="text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 relative"
                onClick={() => {
                  if (conversations.length > 0) {
                    const firstConversation = conversations[0];
                    setSelectedConversation(firstConversation);
                    setIsChatOpen(true);
                    clearNotificationForConversation(firstConversation.id);
                  } else {
                    // If no conversations, navigate to messages page
                    window.location.href = '/messages';
                  }
                }}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Messages
                {hasUnreadMessages && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </Button>
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
                        <AvatarImage src={user.profileImageUrl || ""} alt={user.email || ""} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getUserInitials(user)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground">Role: {user.role === "professional" ? "Professional Tender" : "Event Organizer"}</p>
                      </div>
                    </div>
                    
                    <DropdownMenuSeparator />
                    
                    <RoleSwitcher />
                    
                    <DropdownMenuSeparator />
                    
                    {/* Profile completion indicator */}
                    {hasProfile && profileCompletion < 100 && (
                      <>
                        <div className="px-2 py-1.5">
                          <div className="text-xs text-muted-foreground mb-1">Profile: {Math.round(profileCompletion)}% complete</div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-primary h-1.5 rounded-full transition-all duration-300" 
                              style={{ width: `${profileCompletion}%` }}
                            ></div>
                          </div>
                        </div>
                        <DropdownMenuSeparator />
                      </>
                    )}

                    <DropdownMenuItem onClick={() => {
                      if (hasProfile) {
                        if (user?.role === "professional") {
                          window.location.href = "/professional-dashboard";
                        } else {
                          window.location.href = "/organizer-dashboard";
                        }
                      } else {
                        window.location.reload(); // Refresh to fix auth state
                      }
                    }}>
                      <User className="mr-2 h-4 w-4" />
                      <span>
                        {hasProfile ? "Edit Profile" : "Create Profile"}
                      </span>
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => {
                      resetNotifications();
                      console.log('Notifications reset');
                    }}>
                      <MessageCircle className="mr-2 h-4 w-4" />
                      <span>Reset Notifications</span>
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

      {/* Chat Modal */}
      {isAuthenticated && (
        <ChatModal
          conversation={selectedConversation}
          isOpen={isChatOpen}
          onClose={() => {
            setIsChatOpen(false);
            setSelectedConversation(null);
          }}
        />
      )}
    </>
  );
}