import React from 'react';
import { Container, Paper, Typography, Box, Button, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBack from '@mui/icons-material/ArrowBack';
import Mic from '@mui/icons-material/Mic';
import Stop from '@mui/icons-material/Stop';

const VoiceAnalysis = () => {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = React.useState(false);

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/dashboard')} sx={{ mb: 2 }}>
        Back to Dashboard
      </Button>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Voice Analysis
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Speak naturally and our AI will analyze your voice for emotional markers.
        </Typography>
        
        <Box sx={{ my: 4 }}>
          <IconButton
            sx={{
              width: 100,
              height: 100,
              bgcolor: isRecording ? 'error.main' : 'primary.main',
              color: 'white',
              '&:hover': {
                bgcolor: isRecording ? 'error.dark' : 'primary.dark',
              }
            }}
            onClick={() => setIsRecording(!isRecording)}
          >
            {isRecording ? <Stop sx={{ fontSize: 50 }} /> : <Mic sx={{ fontSize: 50 }} />}
          </IconButton>
        </Box>

        <Typography variant="body2" color="text.secondary">
          {isRecording ? 'Recording... Click to stop' : 'Click the microphone to start recording'}
        </Typography>

        <Box sx={{ mt: 4, bgcolor: '#f5f5f5', p: 3, borderRadius: 2, textAlign: 'left' }}>
          <Typography variant="subtitle2" gutterBottom>
            Voice analysis detects:
          </Typography>
          <ul>
            <li>Pitch variation (reduced in depression)</li>
            <li>Speech rate (increased in anxiety, decreased in depression)</li>
            <li>Voice energy and tremors</li>
            <li>Pause patterns (cognitive processing difficulties)</li>
          </ul>
        </Box>
      </Paper>
    </Container>
  );
};

export default VoiceAnalysis;