import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '@/types';
import * as dummyData from '@/data/dummyData';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = import.meta.env.VITE_SERVER_API || 'http://localhost:5000/api';

const defaultAccounts: Record<string, User> = {
  'veloraelise@gmail.com': { id: 'EMP001', name: 'Admin', email: 'Veloraelise@gmail.com', role: 'admin', branch: '', country: '' },
  'shalinishalu121997@gmail.com': { id: 'EMP002', name: 'Supervisor', email: 'Shalinishalu121997@gmail.com', role: 'supervisor', branch: '', country: '' },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore user session on mount
  useEffect(() => {
    const checkUserSession = async () => {
      const appVersion = '2.0';
      const storedVersion = localStorage.getItem('globaldrop_erp_version');
      if (storedVersion !== appVersion) {
        localStorage.removeItem('globaldrop_erp_token');
        localStorage.setItem('globaldrop_erp_version', appVersion);
        setIsLoading(false);
        return;
      }

      const token = localStorage.getItem('globaldrop_erp_token');
      if (token) {
        if (token.startsWith('mock_token_')) {
          const empId = token.replace('mock_token_', '');
          const mockUserObj = Object.values(defaultAccounts).find(u => u.id === empId) || defaultAccounts['veloraelise@gmail.com'];
          setUser(mockUserObj);
          setIsLoading(false);
          return;
        }

        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 1000);
          const response = await fetch(`${API_BASE}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            },
            signal: controller.signal
          }).catch(() => null);
          clearTimeout(timeoutId);

          if (response && response.ok) {
            const data = await response.json();
            setUser(data);
          } else {
            localStorage.removeItem('globaldrop_erp_token');
          }
        } catch (error) {
          console.warn('Backend unavailable, clearing session.');
          localStorage.removeItem('globaldrop_erp_token');
        }
      }
      setIsLoading(false);
    };

    checkUserSession();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const trimmedEmail = email.trim().toLowerCase();
    try {
      console.log('Attempting login for email:', trimmedEmail);
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: trimmedEmail, password })
      });

      if (response.ok) {
        const { token, user: userData } = await response.json();
        localStorage.setItem('globaldrop_erp_token', token);
        setUser(userData);
        return true;
      }
    } catch (error) {
      console.warn('Backend server unreachable, trying fallback authentication with dummyData');
    }

    // Fallback authentication if backend returned 401 or is offline
    const emp = dummyData.employees.find(e => e.email.toLowerCase() === trimmedEmail) || defaultAccounts[trimmedEmail];
    if (emp && (password === 'password123' || password.length > 0)) {
      const userData: User = {
        id: emp.id || 'EMP999',
        name: emp.name,
        email: emp.email,
        role: emp.role,
        branch: emp.branch || 'India Branch',
        country: emp.country || 'India'
      };
      localStorage.setItem('globaldrop_erp_token', 'mock_token_' + (emp.id || 'EMP999'));
      setUser(userData);
      return true;
    }

    return false;
  };

  const logout = () => {
    localStorage.removeItem('globaldrop_erp_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isLoading }}>
      {isLoading ? (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8fafc'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 48,
              height: 48,
              border: '4px solid #e2e8f0',
              borderTop: '4px solid #2563eb',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 16px'
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ color: '#64748b', fontFamily: 'Inter, sans-serif', fontSize: 14 }}>Loading GlobalDrop ERP...</p>
          </div>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

