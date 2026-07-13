import React from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  Avatar,
  Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import VideoBackground from '../components/common/VideoBackground';

const ChatSelector = () => {
  const navigate = useNavigate();

  return (
    <VideoBackground overlay={true}>
      <Container maxWidth="lg" sx={{ py: 3, px: { xs: 2, sm: 3 } }}>
        {/* Back Button - Compact */}
        <Box sx={{ mb: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/dashboard')}
            variant="text"
            sx={{ 
              color: 'white', 
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
              textTransform: 'none',
              fontSize: '0.9rem'
            }}
          >
            Back to Dashboard
          </Button>
        </Box>

        {/* Header - Tighter spacing */}
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ 
            fontWeight: 'bold', 
            color: 'white',
            mb: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1
          }}>
            💬 Chat Support
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.85)' }}>
            Choose how you'd like to get support
          </Typography>
        </Box>

        {/* Chat Options - Centered cards */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center',
          mb: 3
        }}>
          <Grid container spacing={2.5} sx={{ maxWidth: '900px' }}>
            {/* SafeTalk Bot Option */}
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)',
                  },
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.1) 100%)',
                  border: '1px solid rgba(102, 126, 234, 0.4)',
                  backdropFilter: 'blur(10px)',
                }}
                onClick={() => navigate('/safetalk-bot')}
              >
                <CardContent sx={{ p: 3 }}>
                  {/* Avatar and Title Row - Horizontal alignment */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar
                      sx={{
                        width: 56,
                        height: 56,
                        bgcolor: '#667eea',
                        fontSize: '1.8rem',
                      }}
                    >
                      🤖
                    </Avatar>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'white', lineHeight: 1.2 }}>
                        SafeTalk Bot
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#86efac', fontWeight: '600' }}>
                        💚 24/7 AI Mental Health Support
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.1)' }} />

                  {/* Features - Single column */}
                  <Box sx={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    my: 1.5
                  }}>
                    <Typography variant="body2" sx={{ color: '#86efac', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span style={{ fontSize: '1.2rem' }}>✓</span> Instant responses
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#86efac', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span style={{ fontSize: '1.2rem' }}>✓</span> Available anytime
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#86efac', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span style={{ fontSize: '1.2rem' }}>✓</span> Confidential support
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#86efac', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span style={{ fontSize: '1.2rem' }}>✓</span> Empathetic conversations
                    </Typography>
                  </Box>

                  <Button
                    variant="contained"
                    fullWidth
                    sx={{
                      mt: 2,
                      backgroundColor: '#667eea',
                      '&:hover': { backgroundColor: '#5568d3' },
                      py: 1,
                      textTransform: 'none',
                      fontWeight: 'bold'
                    }}
                  >
                    Start Chat →
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Chat with Counselor Option */}
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 20px rgba(118, 75, 162, 0.3)',
                  },
                  background: 'linear-gradient(135deg, rgba(118, 75, 162, 0.15) 0%, rgba(102, 126, 234, 0.1) 100%)',
                  border: '1px solid rgba(118, 75, 162, 0.4)',
                  backdropFilter: 'blur(10px)',
                }}
                onClick={() => navigate('/chat-with-counselor')}
              >
                <CardContent sx={{ p: 3 }}>
                  {/* Avatar and Title Row - Horizontal alignment */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar
                      sx={{
                        width: 56,
                        height: 56,
                        bgcolor: '#764ba2',
                        fontSize: '1.8rem',
                      }}
                    >
                      👨‍⚕️
                    </Avatar>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'white', lineHeight: 1.2 }}>
                        Chat with Counselor
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#86efac', fontWeight: '600' }}>
                        Connect with a real professional
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.1)' }} />

                  {/* Features - Single column */}
                  <Box sx={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    my: 1.5
                  }}>
                    <Typography variant="body2" sx={{ color: '#86efac', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span style={{ fontSize: '1.2rem' }}>✓</span> Qualified professionals
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#86efac', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span style={{ fontSize: '1.2rem' }}>✓</span> Personalized support
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#86efac', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span style={{ fontSize: '1.2rem' }}>✓</span> Professional guidance
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#86efac', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span style={{ fontSize: '1.2rem' }}>✓</span> Scheduled sessions
                    </Typography>
                  </Box>

                  <Button
                    variant="contained"
                    fullWidth
                    sx={{
                      mt: 2,
                      backgroundColor: '#764ba2',
                      '&:hover': { backgroundColor: '#653a8a' },
                      py: 1,
                      textTransform: 'none',
                      fontWeight: 'bold'
                    }}
                  >
                    Connect Now →
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Info Box - Compact and clean */}
        <Paper sx={{ 
          p: 2, 
          bgcolor: 'rgba(255, 255, 255, 0.08)', 
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: 2,
          maxWidth: '900px',
          mx: 'auto'
        }}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', textAlign: 'center' }}>
            💡 <strong>Tip:</strong> Start with SafeTalk Bot for instant support, then connect with a counselor for deeper guidance when needed.
          </Typography>
        </Paper>
      </Container>
    </VideoBackground>
  );
};

export default ChatSelector;