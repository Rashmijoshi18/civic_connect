import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('civicconnect_token');
    const savedUser = localStorage.getItem('civicconnect_user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('civicconnect_token');
        localStorage.removeItem('civicconnect_user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const response = await authAPI.login({ email, password });
    const { user, token } = response.data.data;
    localStorage.setItem('civicconnect_token', token);
    localStorage.setItem('civicconnect_user', JSON.stringify(user));
    setUser(user);
    return user;
  }, []);

  const register = useCallback(async (data) => {
    const response = await authAPI.register(data);
    const { user, token } = response.data.data;
    localStorage.setItem('civicconnect_token', token);
    localStorage.setItem('civicconnect_user', JSON.stringify(user));
    setUser(user);
    return user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('civicconnect_token');
    localStorage.removeItem('civicconnect_user');
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedUser) => {
    const merged = { ...user, ...updatedUser };
    localStorage.setItem('civicconnect_user', JSON.stringify(merged));
    setUser(merged);
  }, [user]);

  const isAdmin = user?.role === 'ADMIN';
  const isOrg = user?.role === 'ORGANIZATION';
  const isUser = user?.role === 'USER';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{
      user, loading, login, register, logout, updateUser,
      isAdmin, isOrg, isUser, isAuthenticated,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
