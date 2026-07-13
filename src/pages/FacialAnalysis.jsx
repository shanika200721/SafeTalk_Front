import React from 'react';
import { Container, Paper, Typography, Box, Button, Switch, FormControlLabel } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBack from '@mui/icons-material/ArrowBack';
import CameraAlt from '@mui/icons-material/CameraAlt';

const FacialAnalysis = () => {
  const navigate = useNavigate();
  const [cameraOn, setCameraOn] = React.useState(false);

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/dashboard')} sx={{ mb: 2 }}>
        Back to Dashboard
      </Button>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Facial Expression Analysis
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Our AI analyzes micro-expressions to better understand your emotional state.
        </Typography>
        
        <Box sx={{ my: 4, textAlign: 'center' }}>
          <FormControlLabel
            control={
              <Switch
                checked={cameraOn}
                onChange={(e) => setCameraOn(e.target.checked)}
                color="primary"
              />
            }
            label={cameraOn ? "Camera On" : "Camera Off"}
          />
        </Box>

        <Box sx={{ 
          height: 300, 
          bgcolor: '#f0f0f0', 
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3
        }}>
          <CameraAlt sx={{ fontSize: 60, color: 'text.disabled' }} />
          <Typography variant="body1" color="text.secondary" sx={{ ml: 2 }}>
            {cameraOn ? "Camera preview coming soon..." : "Enable camera to start analysis"}
          </Typography>
        </Box>

        <Box sx={{ bgcolor: '#f5f5f5', p: 3, borderRadius: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Facial analysis detects:
          </Typography>
          <ul>
            <li>Micro-expressions (brief emotional leaks)</li>
            <li>Facial muscle movements</li>
            <li>Gaze direction and eye contact</li>
            <li>Head pose and movement patterns</li>
          </ul>
        </Box>
      </Paper>
    </Container>
  );
};

export default FacialAnalysis;