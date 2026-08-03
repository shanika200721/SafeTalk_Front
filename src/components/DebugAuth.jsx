import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Box, Paper, Typography } from '@mui/material';

const DebugAuth = () => {
  const { isAuthenticated, user, hasAcceptedTerms } = useAuth();
  
  if (import.meta.env.MODE !== 'development') return null;
  
  return (
    <Box sx={{ position: 'fixed', bottom: 10, right: 10, zIndex: 9999 }}>
      <Paper sx={{ p: 1, bgcolor: 'rgba(0,0,0,0.8)', color: 'white' }}>
        <Typography variant="caption">
          Auth: {isAuthenticated ? '✅' : '❌'} | 
          Role: {user?.role || 'none'} | 
          Terms: {hasAcceptedTerms ? '✅' : '❌'}
        </Typography>
      </Paper>
    </Box>
  );
};

export default DebugAuth;
