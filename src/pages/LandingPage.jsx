import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Fade,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import VideoBackground from '../components/common/VideoBackground';
import Psychology from '@mui/icons-material/Psychology';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <VideoBackground overlay={true}>
      <Container maxWidth="lg">
        <Fade in={true} timeout={1500}>
          <Box sx={{ 
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            py: 4
          }}>
            {/* Logo */}
            <Paper
              elevation={24}
              sx={{
                p: { xs: 4, md: 6 },
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: 4,
                maxWidth: 800,
                width: '100%',
              }}
            >
              <Box sx={{ mb: 3 }}>
                <Psychology sx={{ 
                  fontSize: { xs: 60, md: 80 }, 
                  color: '#4A90E2'
                }} />
              </Box>
              
              <Typography 
                variant="h1" 
                sx={{ 
                  fontSize: { xs: '2.5rem', md: '4rem' },
                  fontWeight: 800,
                  color: '#4A90E2',
                  mb: 2
                }}
              >
                SAFE TALK
              </Typography>
              
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 4,
                  color: 'text.secondary',
                  maxWidth: 600,
                  mx: 'auto',
                  lineHeight: 1.8
                }}
              >
                An Intelligent Platform That Understands You Beyond Words - 
                Through Your Voice, Expressions, And Feelings. Always Here To Listen, 
                Always Here To Help.
              </Typography>

              <Box sx={{ 
                display: 'flex', 
                gap: 3, 
                justifyContent: 'center',
                flexDirection: { xs: 'column', sm: 'row' }
              }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/login')}
                  sx={{
                    py: 1.5,
                    px: 6,
                    fontSize: '1.2rem',
                    background: '#4A90E2',
                    '&:hover': {
                      background: '#3570B0',
                    }
                  }}
                >
                  LOGIN
                </Button>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/register')}
                  sx={{
                    py: 1.5,
                    px: 6,
                    fontSize: '1.2rem',
                    background: '#50E3C2',
                    '&:hover': {
                      background: '#38BFA0',
                    }
                  }}
                >
                  REGISTER
                </Button>
              </Box>
            </Paper>

            {/* Footer */}
            <Typography 
              variant="body2" 
              sx={{ 
                mt: 4,
                color: 'white',
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
              }}
            >
              SAFE TALK MULTI MODEL AI AGENT ©2025 ALL RIGHTS RESERVED
            </Typography>
          </Box>
        </Fade>
      </Container>
    </VideoBackground>
  );
};

export default LandingPage;