import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Link,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ArrowBack from '@mui/icons-material/ArrowBack';
import ArrowForward from '@mui/icons-material/ArrowForward';
import CheckCircle from '@mui/icons-material/CheckCircle';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  // Stepper state
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Account Details', 'Student Profile', 'Consent & Agreement'];
  
  // Form data
  const [formData, setFormData] = useState({
    // Account details
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    
    // Student profile
    university: 'University of Colombo',
    faculty: '',
    degreeProgram: '',
    currentYear: 1,
    registrationNumber: '',
    
    // Personal
    age: '',
    gender: '',
    religion: '',
    livingArrangement: '',
    
    // Consent
    consentDataCollection: false,
    consentEscalation: false,
    consentTerms: false,
    over18: false,
  });
  
  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  // Universities in Sri Lanka
  const universities = [
    'University of Colombo',
    'University of Peradeniya',
    'University of Moratuwa',
    'University of Kelaniya',
    'University of Sri Jayewardenepura',
    'University of Ruhuna',
    'University of Jaffna',
    'Eastern University',
    'South Eastern University',
    'Rajarata University',
    'Sabaragamuwa University',
    'Wayamba University',
    'Uva Wellassa University',
    'Open University of Sri Lanka',
    'SLIIT',
    'Other',
  ];

  // Faculties
  const faculties = [
    'Engineering',
    'Medicine',
    'Arts',
    'Science',
    'Commerce & Management',
    'Law',
    'Agriculture',
    'Dental Sciences',
    'Allied Health Sciences',
    'Computing',
    'Technology',
    'Graduate Studies',
    'Other',
  ];

  // Living arrangements
  const livingArrangements = [
    'With Family',
    'University Hostel',
    'Private Boarding',
    'Rented Apartment (Alone)',
    'Rented Apartment (Shared)',
    'Living with Relatives',
    'Other',
  ];

  // Religions
  const religions = [
    'Buddhist',
    'Hindu',
    'Muslim',
    'Christian',
    'Other',
  ];

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNext = () => {
    // Validate current step
    if (activeStep === 0) {
      if (!formData.email || !formData.password || !formData.confirmPassword || !formData.fullName) {
        setError('Please fill in all fields');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      if (!formData.email.includes('@')) {
        setError('Please enter a valid email');
        return;
      }
    }
    
    if (activeStep === 1) {
      if (!formData.faculty || !formData.degreeProgram || !formData.age || !formData.gender) {
        setError('Please fill in all required fields');
        return;
      }
    }
    
    if (activeStep === 2) {
      if (!formData.consentDataCollection || !formData.consentEscalation || 
          !formData.consentTerms || !formData.over18) {
        setError('Please accept all consent agreements to continue');
        return;
      }
    }
    
    setError('');
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await register(formData);
      if (result.success) {
        setRegistered(true);
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Success view
  if (registered) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Registration Successful!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Welcome to SafeTalk, {formData.fullName?.split(' ')[0] || 'Student'}!
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Redirecting you to your dashboard...
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <div className="spinner"></div>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
            Create Your Account
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Join SafeTalk - Your mental health companion
          </Typography>
        </Box>

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Step 1: Account Details */}
          {activeStep === 0 && (
            <Box className="fade-in">
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    placeholder="Enter your full name"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="student@university.lk"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Minimum 6 characters"
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
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Confirm Password"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
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
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Step 2: Student Profile */}
          {activeStep === 1 && (
            <Box className="fade-in">
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel>University</InputLabel>
                    <Select
                      name="university"
                      value={formData.university}
                      onChange={handleChange}
                      label="University"
                    >
                      {universities.map((uni) => (
                        <MenuItem key={uni} value={uni}>{uni}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Faculty</InputLabel>
                    <Select
                      name="faculty"
                      value={formData.faculty}
                      onChange={handleChange}
                      label="Faculty"
                    >
                      {faculties.map((fac) => (
                        <MenuItem key={fac} value={fac}>{fac}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Degree Program"
                    name="degreeProgram"
                    value={formData.degreeProgram}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Computer Science"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth required>
                    <InputLabel>Year of Study</InputLabel>
                    <Select
                      name="currentYear"
                      value={formData.currentYear}
                      onChange={handleChange}
                      label="Year of Study"
                    >
                      <MenuItem value={1}>1st Year</MenuItem>
                      <MenuItem value={2}>2nd Year</MenuItem>
                      <MenuItem value={3}>3rd Year</MenuItem>
                      <MenuItem value={4}>4th Year</MenuItem>
                      <MenuItem value={5}>5th Year</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Age"
                    name="age"
                    type="number"
                    value={formData.age}
                    onChange={handleChange}
                    required
                    inputProps={{ min: 18, max: 60 }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth required>
                    <InputLabel>Gender</InputLabel>
                    <Select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      label="Gender"
                    >
                      <MenuItem value="male">Male</MenuItem>
                      <MenuItem value="female">Female</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                      <MenuItem value="prefer-not">Prefer not to say</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Religion</InputLabel>
                    <Select
                      name="religion"
                      value={formData.religion}
                      onChange={handleChange}
                      label="Religion"
                    >
                      {religions.map((rel) => (
                        <MenuItem key={rel} value={rel}>{rel}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Living Arrangement</InputLabel>
                    <Select
                      name="livingArrangement"
                      value={formData.livingArrangement}
                      onChange={handleChange}
                      label="Living Arrangement"
                    >
                      {livingArrangements.map((arr) => (
                        <MenuItem key={arr} value={arr}>{arr}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Registration Number (Optional)"
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                    placeholder="e.g., EG/2020/001"
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Step 3: Consent & Agreement */}
          {activeStep === 2 && (
            <Box className="fade-in">
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                Data Privacy & Consent Agreement
              </Typography>
              
              <Paper variant="outlined" sx={{ p: 3, mb: 3, bgcolor: '#f8f9fa' }}>
                <Typography variant="body2" paragraph>
                  SafeTalk collects and analyzes multiple types of data to provide you with the best possible support:
                </Typography>
                <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                  <li><Typography variant="body2">✓ Text from chat conversations</Typography></li>
                  <li><Typography variant="body2">✓ Voice recordings for tone analysis</Typography></li>
                  <li><Typography variant="body2">✓ Facial expressions (optional, camera)</Typography></li>
                  <li><Typography variant="body2">✓ Behavioral patterns (typing speed, app usage)</Typography></li>
                  <li><Typography variant="body2">✓ Daily mood check-ins and DASS21 assessments</Typography></li>
                </ul>
                <Typography variant="body2" color="text.secondary">
                  All data is encrypted and stored securely. You can withdraw consent at any time.
                </Typography>
              </Paper>

              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mt: 3 }}>
                Counselor Escalation Protocol
              </Typography>
              
              <Paper variant="outlined" sx={{ p: 3, mb: 3, bgcolor: '#f8f9fa' }}>
                <Typography variant="body2" paragraph>
                  For your safety, SafeTalk automatically notifies a counselor when:
                </Typography>
                <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                  <li><Typography variant="body2">⚠️ Your risk assessment reaches HIGH or SEVERE level</Typography></li>
                  <li><Typography variant="body2">⚠️ You express suicidal thoughts in chat</Typography></li>
                  <li><Typography variant="body2">⚠️ Multiple crisis indicators are detected</Typography></li>
                </ul>
                <Typography variant="body2" color="text.secondary">
                  This is to ensure you get help when you need it most.
                </Typography>
              </Paper>

              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="consentDataCollection"
                        checked={formData.consentDataCollection}
                        onChange={handleChange}
                        color="primary"
                      />
                    }
                    label={
                      <Typography variant="body2">
                        I consent to the collection and analysis of my text, voice, and behavioral data
                      </Typography>
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="consentEscalation"
                        checked={formData.consentEscalation}
                        onChange={handleChange}
                        color="primary"
                      />
                    }
                    label={
                      <Typography variant="body2">
                        I understand and accept the automated counselor escalation protocol for high-risk situations
                      </Typography>
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="consentTerms"
                        checked={formData.consentTerms}
                        onChange={handleChange}
                        color="primary"
                      />
                    }
                    label={
                      <Typography variant="body2">
                        I have read and agree to the <Link href="#" underline="hover">Terms of Service</Link>
                      </Typography>
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="over18"
                        checked={formData.over18}
                        onChange={handleChange}
                        color="primary"
                      />
                    }
                    label={
                      <Typography variant="body2">
                        I am 18 years or older (or have parental consent if younger)
                      </Typography>
                    }
                  />
                </Grid>
              </Grid>

              <Alert severity="info" sx={{ mt: 3 }}>
                <Typography variant="body2">
                  This is not an emergency service. If you're in crisis right now, please call 1333 (Sri Lanka National Mental Health Helpline)
                </Typography>
              </Alert>
            </Box>
          )}

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={activeStep === 0 || loading}
              startIcon={<ArrowBack />}
            >
              Back
            </Button>
            
            {activeStep === steps.length - 1 ? (
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                endIcon={loading ? <div className="spinner" style={{ width: 20, height: 20 }} /> : <CheckCircle />}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<ArrowForward />}
              >
                Next
              </Button>
            )}
          </Box>
        </form>

        {/* Login Link */}
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{' '}
            <Link component={RouterLink} to="/login" underline="hover">
              Sign in here
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;