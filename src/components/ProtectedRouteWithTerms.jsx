import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from './LoadingScreen';

const ProtectedRouteWithTerms = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  
  if (loading) return <LoadingScreen />;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Check if user has accepted terms
  const termsAccepted = localStorage.getItem('termsAccepted') === 'true';
  
  if (!termsAccepted && window.location.pathname !== '/terms') {
    return <Navigate to="/terms" replace />;
  }
  
  return children;
};

export default ProtectedRouteWithTerms;