import React, { createContext, useContext, useState, useEffect } from 'react';
import { IUser } from '../types.ts';
import { authApi } from '../api/api.ts';

interface AuthContextType {
  user: IUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  quickLogin: (role: 'admin' | 'president' | 'membre') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('denc_token'));
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      if (localStorage.getItem('denc_token')) {
        const res = await authApi.getMe();
        if (res.user) {
          setUser(res.user);
        }
      }
    } catch {
      localStorage.removeItem('denc_token');
      localStorage.removeItem('denc_user');
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('denc_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        // ignore
      }
    }
    refreshUser();
  }, []);

  const login = async (email: string, motDePasse: string) => {
    setLoading(true);
    try {
      const res = await authApi.login({ email, motDePasse });
      setUser(res.user);
      setToken(res.token);
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: any) => {
    setLoading(true);
    try {
      const res = await authApi.register(data);
      setUser(res.user);
      setToken(res.token);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      setToken(null);
    }
  };

  const quickLogin = async (role: 'admin' | 'president' | 'membre') => {
    const creds = {
      admin: { email: 'admin@dencxaalis.sn', motDePasse: 'passer123' },
      president: { email: 'awa.diallo@dencxaalis.sn', motDePasse: 'passer123' },
      membre: { email: 'fatou.sow@dencxaalis.sn', motDePasse: 'passer123' },
    };

    await login(creds[role].email, creds[role].motDePasse);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        refreshUser,
        quickLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
