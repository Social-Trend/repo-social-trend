import { createContext, useContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
  switchRole: (newRole: "organizer" | "professional") => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);

    // Listen for storage events to update token when it changes
    const handleStorageChange = () => {
      const newToken = localStorage.getItem("token");
      setToken(newToken);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      if (!token) return null;
      
      try {
        return await apiRequest("/api/auth/me");
      } catch (error: any) {
        // Only clear token on specific auth errors, not network issues
        if (error.message.includes("401") || error.message.includes("403")) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setToken(null);
        }
        return null;
      }
    },
    enabled: !!token,
    retry: false
  });

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    window.location.reload();
  };

  const switchRole = async (newRole: "organizer" | "professional") => {
    if (!user) return;
    
    try {
      const response = await apiRequest("/api/auth/switch-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole })
      });
      
      // Update the token with the new one from the response
      if (response.token) {
        localStorage.setItem("token", response.token);
        setToken(response.token);
      }
      
      // Force a complete refresh to ensure all queries are invalidated
      // and the new role is properly reflected across the application
      window.location.reload();
    } catch (error) {
      console.error("Failed to switch role:", error);
      throw error;
    }
  };

  const value = {
    user: user || null,
    isAuthenticated: !!user && !!token,
    isLoading: isLoading && !!token,
    logout,
    switchRole,
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