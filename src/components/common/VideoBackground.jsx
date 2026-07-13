import React, { useState, useEffect } from 'react';
import { Box, CircularProgress } from '@mui/material';

const VideoBackground = ({ children, overlay = true }) => {
  const [videoError, setVideoError] = useState(true); // Always start with fallback
  
  return (
    <Box sx={{ 
      position: 'relative', 
      minHeight: '100vh', 
      width: '100%',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>
      {/* Overlay */}
      {overlay && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            zIndex: 0,
          }}
        />
      )}
      
      {/* Content */}
      <Box sx={{ position: 'relative', zIndex: 1, width: '100%' }}>
        {children}
      </Box>
    </Box>
  );
};

export default VideoBackground;