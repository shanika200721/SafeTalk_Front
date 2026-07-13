import React from 'react';
import { Container, Paper, Typography, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBack from '@mui/icons-material/ArrowBack';

const ProfileAssessment = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/dashboard')} sx={{ mb: 2 }}>
        Back to Dashboard
      </Button>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Profile Assessment
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          This page will collect your academic profile, family background, personal lifestyle, 
          and cultural information to help personalize your risk assessment.
        </Typography>
        <Box sx={{ bgcolor: '#f5f5f5', p: 3, borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Coming Soon: Complete profile assessment form with:
          </Typography>
          <ul>
            <li>Academic Profile (GPA, repeated subjects, attendance)</li>
            <li>Family Background (income level, relationship quality)</li>
            <li>Personal Lifestyle (living arrangement, employment)</li>
            <li>Cultural & Personality factors</li>
          </ul>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProfileAssessment;