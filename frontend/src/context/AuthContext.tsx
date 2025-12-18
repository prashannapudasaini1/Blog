import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authAPI } from '../services/api';
import type { Token, User, Role } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  userRole: Role | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (token) {
      // Decode token to get user info (simplified - in production, verify the token)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ id: payload.user_id, email: '', role: undefined });
      } catch (e) {
        console.error('Error decoding token:', e);
      }
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const response: Token = await authAPI.login({ username: email, password });
    setToken(response.access_token);
    localStorage.setItem('token', response.access_token);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  const isAuthenticated = !!token;
  const userRole = user?.role || null;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated, userRole }}>
      {children}
    </AuthContext.Provider>
  );
};

