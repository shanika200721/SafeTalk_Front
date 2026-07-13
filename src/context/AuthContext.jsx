import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse saved user:', e);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    setError(null);
    try {
      console.log('🔐 LOGIN START - Username:', username, 'Password length:', password.length);
      
      // Call backend API with explicit CORS handling
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'omit',
        body: JSON.stringify({
          username,
          password,
        }),
      });

      console.log('📊 RESPONSE STATUS:', response.status, response.statusText);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { error: response.statusText };
        }
        console.error('❌ LOGIN FAILED - Error response:', errorData);
        throw new Error(errorData.detail || errorData.error || 'Login failed');
      }

      const data = await response.json();
      console.log('✅ LOGIN SUCCESS - Token received, User:', data.user.username);
      
      // Extract user from response
      const user = {
        id: data.user.id,
        username: data.user.username,
        email: data.user.email,
        full_name: data.user.full_name,
        role: data.user.role,
        department: data.user.department,
        year_of_study: data.user.year_of_study,
      };
      
      // Store token and user
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user', JSON.stringify(user));
      console.log('💾 SAVED TO STORAGE - Token and user saved');
      
      setUser(user);
      console.log('✅ FINAL: Login complete, returning success');
      return { success: true, user };
    } catch (error) {
      console.error('❌ LOGIN EXCEPTION:', error.name, error.message);
      console.error('Stack:', error.stack);
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      console.log('📝 Registering user:', userData.email);
      
      // Use the api instance - note: baseURL is localhost:8000, so we need full /api/auth/register path
      const response = await api.post('/api/auth/register', userData);
      
      const user = response.data;
      console.log('✅ Registration successful, user id:', user.id);
      
      // Store user in state (not logging them in yet)
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      return { success: true, user };
    } catch (error) {
      console.error('❌ Registration error:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Registration failed';
      console.error('Error message:', errorMessage);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
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
    isCounselor: user?.role === 'counselor',
    isStudent: user?.role === 'student',
    hasAcceptedTerms: localStorage.getItem('termsAccepted') === 'true',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};


/* 

const login = async (email, password) => {
  setError(null);
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock login for demo
    let mockUser;
    if (email.includes('counselor')) {
      mockUser = { 
        id: 2, 
        email, 
        name: 'Dr. Perera',
        role: 'counselor',
        department: 'Student Counseling Center',
        avatar: '/images/counselor-avatar.jpg',
        termsAccepted: false // New user hasn't accepted terms
      };
    } else {
      mockUser = { 
        id: 1, 
        email, 
        name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
        role: 'student',
        faculty: 'Engineering',
        year: 3,
        avatar: '/images/student-avatar.jpg',
        termsAccepted: false // New user hasn't accepted terms
      };
    }
    
    setUser(mockUser);
    localStorage.setItem('user', JSON.stringify(mockUser));
    return { success: true, user: mockUser };
  } catch (error) {
    setError(error.message);
    return { success: false, error: error.message };
  }
};

*/

