'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, LoginRequest, RegisterRequest } from '../../../shared/types';
import { apiClient } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Check if user is logged in on app start
    const initializeAuth = async () => {
      try {
        // Only access localStorage on client side
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('token');
          if (token) {
            console.log('🔐 Initializing auth with existing token');
            apiClient.setToken(token);
            const response = await apiClient.getProfile();
            if (response.success && response.data) {
              console.log('✅ Auth initialization successful, user:', response.data.email);
              setUser(response.data);
            } else {
              console.log('❌ Invalid token during initialization, clearing');
              // Invalid token, clear it
              localStorage.removeItem('token');
              apiClient.clearToken();
            }
          } else {
            console.log('🔐 No token found during initialization');
          }
        }
      } catch (error: any) {
        console.error('Failed to initialize auth:', error);
        // Only clear token if it's a 401 (unauthorized) error, not for other errors like network issues or 500 errors
        const isUnauthorized = (error?.status === 401) ||
                              (error instanceof Error && (
                                error.message.includes('Invalid token') ||
                                error.message.includes('Access denied')
                              ));

        if (isUnauthorized) {
          console.log('🔐 Clearing invalid token due to authentication error');
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            apiClient.clearToken();
          }
        } else {
          console.log('🔐 Keeping token - error was not authentication related:', error?.status || error?.message);
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await apiClient.login(credentials);
      if (response.success && response.data) {
        const { user, token } = response.data;
        setUser(user);
        apiClient.setToken(token);
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
        }
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData: RegisterRequest) => {
    try {
      const response = await apiClient.register(userData);
      if (response.success && response.data) {
        const { user, token } = response.data;
        setUser(user);
        apiClient.setToken(token);
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
        }
      } else {
        throw new Error(response.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    apiClient.clearToken();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <AuthContext.Provider value={{ ...value, loading: true }}>
        {children}
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
