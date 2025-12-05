import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAppConfig } from '@/config/appConfig';

interface AuthContextType {
  isAuthenticated: boolean;
  error: string | null;
  attemptLogin: (pin: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'tarifa_auth_session';

function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar sesion existente al cargar
  useEffect(() => {
    if (isLocalStorageAvailable()) {
      const session = localStorage.getItem(STORAGE_KEY);
      if (session === 'authenticated') {
        setIsAuthenticated(true);
      }
    }
    setIsLoading(false);
  }, []);

  const attemptLogin = (pin: string): boolean => {
    const config = getAppConfig();

    if (pin === config.pinCode) {
      setIsAuthenticated(true);
      setError(null);

      // Guardar sesion (iOS Safari safe)
      if (isLocalStorageAvailable()) {
        try {
          localStorage.setItem(STORAGE_KEY, 'authenticated');
        } catch {
          // Silent fail for private browsing
        }
      }
      return true;
    } else {
      setError('PIN incorrecto');
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    if (isLocalStorageAvailable()) {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, error, attemptLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
