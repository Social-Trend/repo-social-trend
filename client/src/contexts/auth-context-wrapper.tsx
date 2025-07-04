import React, { createContext, useContext } from 'react';
import { useSimpleAuth } from './simple-auth-context';

interface User {
  id: string;
  email: string;
  role: 'organizer' | 'professional';
  isEmailVerified: boolean;
  emailVerificationToken: string | null;
  emailVerificationExpires: Date | null;
  passwordResetToken: string | null;
  passwordResetExpires: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasToken: boolean;
  logout: () => void;
  switchRole: (role: 'organizer' | 'professional') => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const simpleAuth = useSimpleAuth();
  
  const contextValue: AuthContextType = {
    user: simpleAuth.user,
    isAuthenticated: simpleAuth.isAuthenticated,
    isLoading: simpleAuth.isLoading,
    hasToken: simpleAuth.hasToken,
    logout: simpleAuth.logout,
    switchRole: simpleAuth.switchRole,
    checkAuth: simpleAuth.checkAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};