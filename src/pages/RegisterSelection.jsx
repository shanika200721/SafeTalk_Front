import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Grid,
  Fade,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import VideoBackground from '../components/common/VideoBackground';
import School from '@mui/icons-material/School';
import MedicalServices from '@mui/icons-material/MedicalServices';
import Psychology from '@mui/icons-material/Psychology';

const RegisterSelection = () => {
  const navigate = useNavigate();

  return (
    <VideoBackground overlay={true}>
      <Container maxWidth="md">
        <Fade in={true} timeout={1000}>
          <Box sx={{ 
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            py: 4
          }}>
            <Paper
              elevation={24}
              sx={{
                p: { xs: 4, md: 6 },
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: 4,
              }}
            >
              {/* Logo */}
              <Box sx={{ mb: 4 }}>
                <Psychology sx={{ 
                  fontSize: { xs: 60, md: 80 }, 
                  color: '#4A90E2'
                }} />
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700,
                    color: '#4A90E2',
                    mt: 2
                  }}
                >
                  SAFE TALK
                </Typography>
              </Box>

              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 4,
                  color: 'text.secondary',
                  maxWidth: 500,
                  mx: 'auto'
                }}
              >
                An Intelligent Platform That Understands You Beyond Words - 
                Through Your Voice, Expressions, And Feelings.
              </Typography>

              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
                SELECT REGISTRATION TYPE
              </Typography>

              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6}>
                  <Paper
                    elevation={8}
                    sx={{
                      p: 4,
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.3s ease',
                      background: 'linear-gradient(135deg, rgba(74, 144, 226, 0.1) 0%, rgba(74, 144, 226, 0.2) 100%)',
                      border: '2px solid #4A90E2',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        background: 'linear-gradient(135deg, #4A90E2 0%, #3570B0 100%)',
                        '& .MuiSvgIcon-root, & .MuiTypography-root': {
                          color: 'white'
                        }
                      }
                    }}
                    onClick={() => navigate('/register/student')}
                  >
                    <School sx={{ fontSize: 60, color: '#4A90E2', mb: 2 }} />
                    <Typography variant="h5" sx={{ fontWeight: 600, color: '#4A90E2' }}>
                      STUDENT
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper
                    elevation={8}
                    sx={{
                      p: 4,
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.3s ease',
                      background: 'linear-gradient(135deg, rgba(80, 227, 194, 0.1) 0%, rgba(80, 227, 194, 0.2) 100%)',
                      border: '2px solid #50E3C2',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        background: 'linear-gradient(135deg, #50E3C2 0%, #38BFA0 100%)',
                        '& .MuiSvgIcon-root, & .MuiTypography-root': {
                          color: 'white'
                        }
                      }
                    }}
                    onClick={() => navigate('/register/psychiatric')}
                  >
                    <MedicalServices sx={{ fontSize: 60, color: '#50E3C2', mb: 2 }} />
                    <Typography variant="h5" sx={{ fontWeight: 600, color: '#50E3C2' }}>
                      PSYCHIATRIC
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Button
                variant="text"
                onClick={() => navigate('/landing')}
                sx={{ color: 'text.secondary' }}
              >
                Back to Home
              </Button>
            </Paper>

            {/* Footer */}
            <Typography 
              variant="body2" 
              sx={{ 
                mt: 4,
                color: 'white',
                textAlign: 'center',
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

export default RegisterSelection;