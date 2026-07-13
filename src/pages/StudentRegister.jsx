import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  Fade,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import VideoBackground from '../components/common/VideoBackground';
import Psychology from '@mui/icons-material/Psychology';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../context/AuthContext';

const StudentRegister = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);

    try {
      const result = await register({
        email: formData.email,
        username: formData.username,
        password: formData.password,
        full_name: `${formData.firstName} ${formData.lastName}`,
        role: 'student'
      });
      
      if (result.success) {
        setSuccess(true);
        // Redirect to terms and conditions page
        setTimeout(() => {
          navigate('/terms');
        }, 1500);
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <VideoBackground overlay={true}>
      <Container maxWidth="sm">
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
                p: { xs: 3, md: 5 },
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: 4,
              }}
            >
              {/* Logo */}
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Psychology sx={{ fontSize: 60, color: '#4A90E2' }} />
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#4A90E2', mt: 1 }}>
                  SAFE TALK
                </Typography>
              </Box>

              <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: 600, mb: 3 }}>
                REGISTER - STUDENT
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  Registration Successful! Redirecting to terms and conditions...
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="FIRST NAME"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  margin="normal"
                  variant="outlined"
                  placeholder="JOHN"
                />

                <TextField
                  fullWidth
                  label="LAST NAME"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  margin="normal"
                  placeholder="SMITH"
                />

                <TextField
                  fullWidth
                  label="E-MAIL"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  margin="normal"
                  placeholder="JOHN@GMAIL.COM"
                />

                <TextField
                  fullWidth
                  label="USERNAME"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  margin="normal"
                  placeholder="your_username"
                />

                <TextField
                  fullWidth
                  label="PASSWORD"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  margin="normal"
                  placeholder="********"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="CONFIRM PASSWORD"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  margin="normal"
                  placeholder="********"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading || success}
                  sx={{
                    mt: 3,
                    py: 1.5,
                    background: 'linear-gradient(135deg, #4A90E2 0%, #50E3C2 100%)',
                    fontSize: '1.2rem',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #3570B0 0%, #38BFA0 100%)',
                    }
                  }}
                >
                  {loading ? 'REGISTERING...' : 'REGISTER'}
                </Button>

                <Button
                  fullWidth
                  variant="text"
                  onClick={() => navigate('/register')}
                  sx={{ mt: 2 }}
                >
                  Back to Registration Type
                </Button>
              </form>
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

export default StudentRegister;