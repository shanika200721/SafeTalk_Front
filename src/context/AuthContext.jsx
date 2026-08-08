import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';
import {
  LEGACY_USER_KEY,
  STUDENT_USER_KEY,
  clearAuthSession,
  getStoredToken,
  storeAuthSession,
} from '../services/api';

const AuthContext = createContext();
const COUNSELOR_ROLES = new Set(['counselor', 'psychiatrist']);

const getApiErrorMessage = (err, fallback) => {
  const data = err.response?.data;
  const candidates = [
    data?.error?.message,
    data?.message,
    data?.detail,
    data?.error,
    err.message,
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    if (typeof candidate === 'string') return candidate;
    if (Array.isArray(candidate)) {
      const messages = candidate
        .map((item) => item?.msg || item?.message || item)
        .filter(Boolean);
      if (messages.length) return messages.join(' ');
    }
    if (typeof candidate === 'object' && typeof candidate.message === 'string') {
      return candidate.message;
    }
  }

  return fallback;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem(STUDENT_USER_KEY) || localStorage.getItem(LEGACY_USER_KEY);
    if (!savedUser) return null;
    try {
      return JSON.parse(savedUser);
    } catch {
      localStorage.removeItem('user');
      return null;
    }
  });
  const [loading, setLoading] = useState(() => Boolean(getStoredToken()));
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const hydrate = async () => {
      const token = getStoredToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await api.get('/api/auth/me');
        if (!cancelled) {
          storeAuthSession(token, response.data);
          setUser(response.data);
        }
      } catch {
        if (!cancelled) {
          clearAuthSession();
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  const storeSession = (token, nextUser) => {
    storeAuthSession(token, nextUser);
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
      const message = getApiErrorMessage(err, 'Login failed');
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
        localStorage.setItem(STUDENT_USER_KEY, JSON.stringify(registeredUser));
        localStorage.setItem(LEGACY_USER_KEY, JSON.stringify(registeredUser));
        setUser(registeredUser);
        return { success: true, user: registeredUser };
      }
      return { success: true, user: loginResult.user };
    } catch (err) {
      const parsedMessage = getApiErrorMessage(err, 'Registration failed');
      const message = parsedMessage === 'Network Error'
        ? 'Registration could not be completed. If this email or username was used before, please try a different one.'
        : parsedMessage;
      setError(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    setUser(null);
    clearAuthSession();
    localStorage.removeItem('termsAccepted');
  };

  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem(STUDENT_USER_KEY, JSON.stringify(updatedUser));
    localStorage.setItem(LEGACY_USER_KEY, JSON.stringify(updatedUser));
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
    isAdmin: user?.role === 'admin',
    isStudent: user?.role === 'student',
    hasAcceptedTerms: localStorage.getItem('termsAccepted') === 'true',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
