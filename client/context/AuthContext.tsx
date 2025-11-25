import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode'; // Correct import for jwt-decode
import { api, User } from '@/lib/api'; // Assuming User interface is exported from api.ts
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (formData: any) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const decodedUser = jwtDecode<User>(storedToken);
        // You might want to add token expiration check here
        setToken(storedToken);
        setUser(decodedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Failed to decode token or token is invalid", error);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await api.login({ email, password });
      localStorage.setItem('token', response.token);
      setToken(response.token);
      setUser(response.user);
      setIsAuthenticated(true);
      navigate('/dashboard'); // Redirect to dashboard after login
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (formData: any) => {
    setLoading(true);
    try {
      const response = await api.register(formData);
      localStorage.setItem('token', response.token);
      setToken(response.token);
      setUser(response.user);
      setIsAuthenticated(true);
      navigate('/dashboard'); // Redirect after registration, perhaps to login page or dashboard
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login'); // Redirect to login page after logout
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, token, login: handleLogin, register: handleRegister, logout: handleLogout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
