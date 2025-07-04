import React, { createContext, useContext, useState, useEffect } from 'react';

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

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasToken: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  switchRole: (role: 'organizer' | 'professional') => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function SimpleAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const hasToken = !!localStorage.getItem('authToken');
  const isAuthenticated = !!user;

  // Simple auth check function
  const checkAuth = async () => {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      console.log('Checking auth with token:', token.substring(0, 20) + '...');
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Auth check response:', response.status);
      
      if (response.ok) {
        const userData = await response.json();
        console.log('Auth successful, user:', userData);
        setUser(userData);
      } else {
        // Clear invalid tokens immediately
        console.log('Auth check failed, clearing token:', response.status);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setUser(null);
        // Force page reload to clear all cached state
        window.location.reload();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Also clear token on network errors to be safe
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setUser(null);
      // Force page reload to clear all cached state
      window.location.reload();
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const { token, user } = await response.json();
    
    // Store auth data
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    // Set user state
    setUser(user);
    
    // Force page reload to ensure clean state
    window.location.href = '/';
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/';
  };

  // Switch role function
  const switchRole = async (role: 'organizer' | 'professional') => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    const response = await fetch('/api/auth/switch-role', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role }),
    });

    if (response.ok) {
      const { token: newToken, user: updatedUser } = await response.json();
      localStorage.setItem('authToken', newToken);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  // Check auth on mount
  useEffect(() => {
    // Force clear any existing bad tokens first
    const token = localStorage.getItem('authToken');
    if (token) {
      console.log('Found existing token:', token);
      // Check if token looks valid (JWT format)
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.log('Invalid token format, clearing immediately...');
        localStorage.clear(); // Clear all localStorage
        sessionStorage.clear(); // Clear all sessionStorage
        setUser(null);
        setIsLoading(false);
        // Force page reload to ensure clean state
        window.location.reload();
        return;
      }
    }
    
    checkAuth();
  }, []);

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    hasToken,
    login,
    logout,
    switchRole,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useSimpleAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useSimpleAuth must be used within a SimpleAuthProvider');
  }
  return context;
};