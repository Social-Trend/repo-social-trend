import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ArrowLeftRight, User, Briefcase, Plus, Check } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useProfile } from "@/hooks/useProfile";
import { Link } from "wouter";

export default function RoleSwitcher() {
  const { user, switchRole } = useAuth();
  const { 
    hasProfessionalProfile, 
    hasOrganizerProfile, 
    hasBothProfiles,
    professionalCompletion,
    organizerCompletion 
  } = useProfile();
  const [isLoading, setIsLoading] = useState(false);

  // Only show role switcher if user has profiles for both roles
  // or if they have at least one profile and can create the other
  if (!user || (!hasProfessionalProfile && !hasOrganizerProfile)) return null;

  const handleRoleSwitch = async (newRole: "organizer" | "professional") => {
    if (newRole === user.role || isLoading) return;
    
    setIsLoading(true);
    try {
      await switchRole(newRole);
    } catch (error) {
      console.error("Failed to switch role:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCompletionBadge = (role: "organizer" | "professional") => {
    const completion = role === "organizer" ? organizerCompletion : professionalCompletion;
    const hasProfile = role === "organizer" ? hasOrganizerProfile : hasProfessionalProfile;
    
    if (!hasProfile) {
      return <Badge variant="outline" className="ml-2 text-xs">Not Created</Badge>;
    }
    
    if (completion === 100) {
      return <Badge variant="secondary" className="ml-2 text-xs bg-green-100 text-green-800">Complete</Badge>;
    }
    
    return <Badge variant="outline" className="ml-2 text-xs">{completion}%</Badge>;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          {user.role === "organizer" ? (
            <User className="h-4 w-4" />
          ) : (
            <Briefcase className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">{user.role === "organizer" ? "Event Organizer" : "Professional Tender"}</span>
          <ArrowLeftRight className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="p-2">
          <p className="text-sm font-medium text-gray-900 mb-1">
            {hasBothProfiles ? "Switch Role" : "Your Role"}
          </p>
          <p className="text-xs text-gray-500">
            {hasBothProfiles 
              ? "You have both profiles. Switch between them anytime."
              : hasProfessionalProfile && !hasOrganizerProfile
                ? "You're a Professional Tender. Create an Organizer profile to switch roles."
                : hasOrganizerProfile && !hasProfessionalProfile
                  ? "You're an Event Organizer. Create a Professional profile to switch roles."
                  : "Create profiles for both roles to switch easily."
            }
          </p>
        </div>
        
        <DropdownMenuSeparator />
        
        {/* Only show role switching options if user has both profiles */}
        {hasBothProfiles ? (
          <>
            {/* Organizer Role */}
            <DropdownMenuItem
              onClick={() => handleRoleSwitch("organizer")}
              disabled={isLoading}
              className="flex items-center justify-between p-3"
            >
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Event Organizer</span>
                {user.role === "organizer" && <Check className="h-4 w-4 text-green-600" />}
              </div>
              {getCompletionBadge("organizer")}
            </DropdownMenuItem>

            {/* Professional Role */}
            <DropdownMenuItem
              onClick={() => handleRoleSwitch("professional")}
              disabled={isLoading}
              className="flex items-center justify-between p-3"
            >
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                <span>Professional Tender</span>
                {user.role === "professional" && <Check className="h-4 w-4 text-green-600" />}
              </div>
              {getCompletionBadge("professional")}
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
          </>
        ) : (
          <>
            {/* Show current role status for single-role users */}
            <div className="p-3 bg-gray-50 rounded-md mx-2 mb-2">
              <div className="flex items-center gap-2">
                {user.role === "organizer" ? (
                  <User className="h-4 w-4 text-blue-600" />
                ) : (
                  <Briefcase className="h-4 w-4 text-green-600" />
                )}
                <span className="text-sm font-medium">
                  {user.role === "organizer" ? "Event Organizer" : "Professional Tender"}
                </span>
                <Check className="h-4 w-4 text-green-600" />
              </div>
              {getCompletionBadge(user.role as "organizer" | "professional")}
            </div>
          </>
        )}

        <DropdownMenuSeparator />

        {/* Create Profile Actions */}
        {!hasOrganizerProfile && (
          <DropdownMenuItem asChild>
            <Link href="/onboarding" className="flex items-center gap-2 p-3 text-blue-600">
              <Plus className="h-4 w-4" />
              <span>Create Organizer Profile</span>
            </Link>
          </DropdownMenuItem>
        )}

        {!hasProfessionalProfile && (
          <DropdownMenuItem asChild>
            <Link href="/onboarding" className="flex items-center gap-2 p-3 text-blue-600">
              <Plus className="h-4 w-4" />
              <span>Create Professional Profile</span>
            </Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}