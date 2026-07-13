import React from 'react';
import { Container, Paper, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Test = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Test Page Working! 🎉
        </Typography>
        <Typography variant="body1" paragraph>
          If you can see this page, React is rendering properly.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/')}>
          Go to Home
        </Button>
      </Paper>
    </Container>
  );
};

export default Test;