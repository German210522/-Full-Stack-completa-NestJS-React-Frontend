import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: number;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token or get user info
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // For simplicity, assume token is valid and set user from token payload
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser({ id: payload.sub, email: payload.email });
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await axios.post('http://localhost:3000/auth/login', { email, password });
    const { access_token } = response.data;
    localStorage.setItem('token', access_token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    const payload = JSON.parse(atob(access_token.split('.')[1]));
    setUser({ id: payload.sub, email: payload.email });
  };

  const register = async (email: string, password: string) => {
    const response = await axios.post('http://localhost:3000/auth/register', { email, password });
    const { access_token } = response.data;
    localStorage.setItem('token', access_token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    const payload = JSON.parse(atob(access_token.split('.')[1]));
    setUser({ id: payload.sub, email: payload.email });
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
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