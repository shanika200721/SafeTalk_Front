import React from 'react';
import { Button } from '@mui/material';

const GradientButton = ({ children, ...props }) => {
  return (
    <Button
      {...props}
      sx={{
        background: 'linear-gradient(135deg, #4A90E2 0%, #50E3C2 100%)',
        color: 'white',
        fontWeight: 'bold',
        borderRadius: 2,
        textTransform: 'none',
        fontSize: '1.1rem',
        boxShadow: '0 4px 15px rgba(74, 144, 226, 0.3)',
        transition: 'all 0.3s ease',
        '&:hover': {
          background: 'linear-gradient(135deg, #3570B0 0%, #38BFA0 100%)',
          transform: 'translateY(-2px)',
          boxShadow: '0 6px 20px rgba(74, 144, 226, 0.4)',
        },
        '&:disabled': {
          background: 'linear-gradient(135deg, #ccc 0%, #ddd 100%)',
        },
        ...props.sx
      }}
    >
      {children}
    </Button>
  );
};

export default GradientButton;