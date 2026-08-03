import React from 'react';
import {
  Alert,
  Box,
  Button,
  Container,
  Fade,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Psychology from '@mui/icons-material/Psychology';
import VideoBackground from '../components/common/VideoBackground';

const PsychiatricRegister = () => {
  const navigate = useNavigate();

  return (
    <VideoBackground overlay={true}>
      <Container maxWidth="sm">
        <Fade in={true} timeout={1000}>
          <Box
            sx={{
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              py: 4,
            }}
          >
            <Paper
              elevation={24}
              sx={{
                p: { xs: 3, md: 5 },
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: 4,
              }}
            >
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Psychology sx={{ fontSize: 60, color: '#50E3C2' }} />
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#50E3C2', mt: 1 }}>
                  SAFE TALK
                </Typography>
              </Box>

              <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: 600, mb: 3 }}>
                Staff Account Access
              </Typography>

              <Alert severity="info" sx={{ mb: 3 }}>
                Counselor and psychiatrist accounts require administrative approval. Public
                self-registration is available only for student accounts.
              </Alert>

              <TextField
                fullWidth
                label="Professional email"
                margin="normal"
                disabled
                helperText="Staff provisioning will be handled by an administrator in a later workflow."
              />
              <TextField
                fullWidth
                label="License or staff identifier"
                margin="normal"
                disabled
                helperText="Do not submit credentials through the public registration API."
              />

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={() => navigate('/login')}
                sx={{
                  mt: 3,
                  py: 1.5,
                  background: 'linear-gradient(135deg, #50E3C2 0%, #4A90E2 100%)',
                  fontSize: '1.05rem',
                }}
              >
                Go to Login
              </Button>

              <Button fullWidth variant="text" onClick={() => navigate('/register')} sx={{ mt: 2 }}>
                Back to Registration Type
              </Button>
            </Paper>
          </Box>
        </Fade>
      </Container>
    </VideoBackground>
  );
};

export default PsychiatricRegister;
