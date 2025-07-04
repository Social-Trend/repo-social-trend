import { createContext, useContext, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
  switchRole: (newRole: "organizer" | "professional") => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  // Check authentication on mount and whenever token changes
  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    console.log("AuthProvider - Checking auth with token:", token ? "Present" : "None");
    
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const userData = await apiRequest("/api/auth/me");
      console.log("AuthProvider - User authenticated:", userData);
      setUser(userData);
    } catch (error: any) {
      console.error("AuthProvider - Auth check failed:", error);
      console.error("AuthProvider - Error details:", {
        message: error.message,
        status: error.status,
        response: error.response
      });
      
      // Only clear token on actual auth errors, not network issues
      if (error.message?.includes("401") || error.message?.includes("403") || error.status === 401 || error.status === 403) {
        console.warn("AuthProvider - Clearing token due to authentication error");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      } else {
        console.warn("AuthProvider - Network or other error, keeping token for retry");
        // Don't clear the token for network errors
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
    
    // Listen for auth token changes
    const handleAuthChange = () => {
      console.log("AuthProvider - Auth token changed, rechecking...");
      checkAuth();
    };

    window.addEventListener('auth-token-changed', handleAuthChange);
    return () => {
      window.removeEventListener('auth-token-changed', handleAuthChange);
    };
  }, []);

  const refreshAuth = async () => {
    await checkAuth();
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.reload();
  };

  const switchRole = async (newRole: "organizer" | "professional") => {
    if (!user) return;
    
    try {
      const response = await apiRequest("/api/auth/switch-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      
      // Update the token in localStorage
      localStorage.setItem("token", response.token);
      
      // Refresh auth to get updated user data
      await refreshAuth();
      
    } catch (error: any) {
      console.error("Role switch failed:", error);
      throw error;
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    logout,
    switchRole,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}