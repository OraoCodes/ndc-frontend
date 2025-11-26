// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { api, User } from '@/lib/api';

// Define only the standard JWT fields we need
interface JWTPayload {
  exp?: number;
  iat?: number;
  // add other standard fields if you use them (sub, aud, etc.)
}

// Do NOT intersect with User here — we’ll decode as any first, then assert safely
const AuthContext = createContext<{
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (formData: any) => Promise<void>;
  logout: () => void;
  loading: boolean;
} | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      setLoading(false);
      return;
    }

    try {
      // Decode without strict typing first
      const decoded = jwtDecode(storedToken) as any;

      const now = Date.now() / 1000;

      // Safe exp check
      if (typeof decoded.exp === 'number' && decoded.exp < now) {
        localStorage.removeItem('token');
      } else {
        setToken(storedToken);
        // Only pick fields that actually exist in your User type
        setUser(decoded as User);
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error('Invalid token', err);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { token: newToken, user: loggedInUser } = await api.login({ email, password });
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(loggedInUser);
      setIsAuthenticated(true);
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData: any) => {
    setLoading(true);
    try {
      const { token: newToken, user: newUser } = await api.register(formData);
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(newUser);
      setIsAuthenticated(true);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        token,
        login,
        register,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};