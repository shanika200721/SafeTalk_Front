import React, { createContext, useContext, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext();
const COUNSELOR_ROLES = new Set(['counselor', 'admin', 'psychiatrist']);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) return null;
    try {
      return JSON.parse(savedUser);
    } catch {
      localStorage.removeItem('user');
      return null;
    }
  });
  const [loading] = useState(false);
  const [error, setError] = useState(null);

  const storeSession = (token, nextUser) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('user', JSON.stringify(nextUser));
    localStorage.setItem('user_role', nextUser.role);
    setUser(nextUser);
  };

  const login = async (username, password) => {
    setError(null);
    try {
      const response = await api.post('/api/auth/login', { username, password });
      const data = response.data;
      const nextUser = {
        id: data.user.id,
        username: data.user.username,
        email: data.user.email,
        full_name: data.user.full_name,
        role: data.user.role,
        department: data.user.department,
        year_of_study: data.user.year_of_study,
      };
      storeSession(data.access_token, nextUser);
      return { success: true, user: nextUser };
    } catch (err) {
      const message = err.response?.data?.error || err.response?.data?.detail || err.message || 'Login failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      const response = await api.post('/api/auth/register', userData);
      const registeredUser = response.data;
      const loginResult = await login(userData.username, userData.password);
      if (!loginResult.success) {
        localStorage.setItem('user', JSON.stringify(registeredUser));
        setUser(registeredUser);
        return { success: true, user: registeredUser };
      }
      return { success: true, user: loginResult.user };
    } catch (err) {
      const message = err.response?.data?.error || err.response?.data?.detail || err.message || 'Registration failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_role');
    localStorage.removeItem('termsAccepted');
  };

  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const acceptTerms = () => {
    localStorage.setItem('termsAccepted', 'true');
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
    acceptTerms,
    isAuthenticated: !!user,
    isCounselor: COUNSELOR_ROLES.has(user?.role),
    isStudent: user?.role === 'student',
    hasAcceptedTerms: localStorage.getItem('termsAccepted') === 'true',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
