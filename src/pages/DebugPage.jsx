import React from 'react';
import { Box, Typography, Container, Button } from '@mui/material';

const DebugPage = () => {
  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 5, p: 3, border: '2px solid red' }}>
        <Typography variant="h3" sx={{ color: 'red' }}>Debug Page</Typography>
        <Typography variant="body1" sx={{ my: 2 }}>
          If you see this page, the React app is loading!
        </Typography>
        <Box sx={{ my: 2 }}>
          <Typography><strong>Current Location:</strong> {window.location.href}</Typography>
          <Typography><strong>Auth State:</strong> (check console)</Typography>
        </Box>
        <Button variant="contained" onClick={() => {
          console.log('Debug button clicked');
          window.location.href = '/login';
        }}>Go to Login</Button>
      </Box>
    </Container>
  );
};

export default DebugPage;
