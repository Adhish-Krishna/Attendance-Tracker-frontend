import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { globalAdminAPI, verticalLeadAPI } from '../api';
import type { User, LoginFormData, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | null>(null);

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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    // Try to load user from localStorage on first render
    const stored = localStorage.getItem('authUser');
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  // Persist user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('authUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('authUser');
    }
  }, [user]);

  const login = async (formData: LoginFormData): Promise<boolean> => {
    try {
      setIsLoading(true);
      let response;

      if (formData.role === 'global_admin') {
        response = await globalAdminAPI.login(formData.identifier, formData.password);
      } else {
        response = await verticalLeadAPI.login(formData.identifier, formData.password);
      }
      
      if (response.status === 200 && response.data) {
        if (formData.role === 'global_admin') {
          // Global admin response only has message, no user data returned
          const userData: User = {
            role: 'global_admin',
            username: formData.identifier
          };
          setUser(userData);
        } else {
          // Vertical lead response has message and lead object
          if (response.data.lead) {
            const userData: User = {
              role: 'vertical_head',
              name: response.data.lead.name,
              roll_no: response.data.lead.roll_no,
              vertical: response.data.lead.vertical,
              department: response.data.lead.department
            };
            setUser(userData);
          }
        }
        return true;
      }
      return false;
    } catch (error) {
  // Removed debug error
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      if (user?.role === 'global_admin') {
        await globalAdminAPI.logout();
      } else {
        await verticalLeadAPI.logout();
      }
    } catch (error) {
  // Removed debug error
    } finally {
  setUser(null);
  localStorage.removeItem('authUser');
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};