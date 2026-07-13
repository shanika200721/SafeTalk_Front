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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import VideoBackground from '../components/common/VideoBackground';
import Psychology from '@mui/icons-material/Psychology';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../context/AuthContext';

const PsychiatricRegister = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    licenseNumber: '',
    password: '',
    confirmPassword: '',
    specialization: '',
    hospital: '',
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
    
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    
    setLoading(true);

    try {
      console.log('📝 Submitting registration form...');
      
      const registrationData = {
        email: formData.email,
        username: formData.username,
        password: formData.password,
        full_name: `${formData.firstName} ${formData.lastName}`,
        role: 'counselor',
        department: formData.specialization
      };
      
      console.log('📤 Sending registration data:', registrationData);
      
      const result = await register(registrationData);
      
      console.log('✅ Registration result:', result);
      
      if (result.success) {
          setSuccess(true);
          setTimeout(() => {
            navigate('/terms');
          }, 1500);
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (err) {
      console.error('❌ Registration caught error:', err);
      setError('An unexpected error occurred: ' + err.message);
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
                <Psychology sx={{ fontSize: 60, color: '#50E3C2' }} />
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#50E3C2', mt: 1 }}>
                  SAFE TALK
                </Typography>
              </Box>

              <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: 600, mb: 3 }}>
                REGISTER - PSYCHIATRIC
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  Registration Successful! Redirecting to login...
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
                  label="LICENSE NUMBER"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  required
                  margin="normal"
                  placeholder="LIC123456"
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
                  placeholder="DOCTOR@HOSPITAL.LK"
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

                <FormControl fullWidth margin="normal" required>
                  <InputLabel>SPECIALIZATION</InputLabel>
                  <Select
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    label="SPECIALIZATION"
                  >
                    <MenuItem value="Clinical Psychology">Clinical Psychology</MenuItem>
                    <MenuItem value="Counseling Psychology">Counseling Psychology</MenuItem>
                    <MenuItem value="Psychiatry">Psychiatry</MenuItem>
                    <MenuItem value="Child Psychology">Child Psychology</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="HOSPITAL/INSTITUTION"
                  name="hospital"
                  value={formData.hospital}
                  onChange={handleChange}
                  required
                  margin="normal"
                  placeholder="NATIONAL HOSPITAL"
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
                    background: 'linear-gradient(135deg, #50E3C2 0%, #4A90E2 100%)',
                    fontSize: '1.2rem',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #38BFA0 0%, #3570B0 100%)',
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

export default PsychiatricRegister;