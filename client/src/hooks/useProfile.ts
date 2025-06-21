import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { apiRequest } from "@/lib/queryClient";
import type { ProfessionalProfile, OrganizerProfile } from "@shared/schema";

export function useProfile() {
  const { user, isAuthenticated } = useAuth();

  // Always fetch both profiles for authenticated users
  const { data: professionalProfile, isLoading: professionalLoading } = useQuery({
    queryKey: ["/api/profiles/professional", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      try {
        return await apiRequest(`/api/profiles/professional/${user.id}`);
      } catch (error: any) {
        if (error.message.includes("404")) return null;
        throw error;
      }
    },
    enabled: isAuthenticated && !!user?.id,
    retry: false,
  });

  const { data: organizerProfile, isLoading: organizerLoading } = useQuery({
    queryKey: ["/api/profiles/organizer", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      try {
        return await apiRequest(`/api/profiles/organizer/${user.id}`);
      } catch (error: any) {
        if (error.message.includes("404")) return null;
        throw error;
      }
    },
    enabled: isAuthenticated && !!user?.id,
    retry: false,
  });

  const currentProfile = user?.role === "professional" ? professionalProfile : organizerProfile;
  const isLoading = professionalLoading || organizerLoading;
  
  const hasCurrentProfile = !!currentProfile;
  const hasProfessionalProfile = !!professionalProfile;
  const hasOrganizerProfile = !!organizerProfile;
  const hasBothProfiles = hasProfessionalProfile && hasOrganizerProfile;
  
  const currentProfileCompletion = calculateProfileCompletion(currentProfile, user?.role);
  const professionalCompletion = calculateProfileCompletion(professionalProfile, "professional");
  const organizerCompletion = calculateProfileCompletion(organizerProfile, "organizer");

  return {
    // Current active profile (for backward compatibility)
    profile: currentProfile,
    hasProfile: hasCurrentProfile,
    profileCompletion: currentProfileCompletion,
    
    // Individual profiles for dual role support
    professionalProfile,
    organizerProfile,
    hasProfessionalProfile,
    hasOrganizerProfile,
    hasBothProfiles,
    
    // Profile completions
    professionalCompletion,
    organizerCompletion,
    
    isLoading,
  };
}

function calculateProfileCompletion(profile: ProfessionalProfile | OrganizerProfile | null, role?: string): number {
  if (!profile || !role) return 0;

  let completedFields = 0;
  let totalFields = 0;

  if (role === "professional") {
    const prof = profile as ProfessionalProfile;
    totalFields = 6; // name, location, services, hourlyRate, bio, profileImageUrl
    
    if (prof.name) completedFields++;
    if (prof.location) completedFields++;
    if (prof.services?.length > 0) completedFields++;
    if (prof.hourlyRate) completedFields++;
    if (prof.bio) completedFields++;
    if (prof.profileImageUrl) completedFields++;
  } else {
    const org = profile as OrganizerProfile;
    totalFields = 4; // name, location, eventTypes, profileImageUrl
    
    if (org.name) completedFields++;
    if (org.location) completedFields++;
    if (org.eventTypes?.length > 0) completedFields++;
    if (org.profileImageUrl) completedFields++;
  }

  return Math.round((completedFields / totalFields) * 100);
}