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

  useEffect(() => {
    // Check if user is logged in on app start
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          apiClient.setToken(token);
          const response = await apiClient.getProfile();
          if (response.success && response.data) {
            setUser(response.data);
          } else {
            // Invalid token, clear it
            localStorage.removeItem('token');
            apiClient.clearToken();
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        // Clear invalid token
        localStorage.removeItem('token');
        apiClient.clearToken();
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
        localStorage.setItem('token', token);
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
        localStorage.setItem('token', token);
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
    localStorage.removeItem('token');
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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
