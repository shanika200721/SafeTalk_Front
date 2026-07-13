import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Checkbox,
  FormControlLabel,
  Alert,
  Fade,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import VideoBackground from '../components/common/VideoBackground';
import Psychology from '@mui/icons-material/Psychology';
import CheckCircle from '@mui/icons-material/CheckCircle';
import RadioButtonUnchecked from '@mui/icons-material/RadioButtonUnchecked';
import ArrowForward from '@mui/icons-material/ArrowForward';
import { useAuth } from '../context/AuthContext';

const TermsOfService = () => {
  const navigate = useNavigate();
  const { user, acceptTerms } = useAuth();
  const [checkedItems, setCheckedItems] = useState({
    notEmergency: false,
    dataConsent: false,
    escalationProtocol: false,
    responsibleUse: false,
    aiLimitations: false,
    readTerms: false,
    ageConsent: false,
  });
  
  const [readMoreOpen, setReadMoreOpen] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const allChecked = Object.values(checkedItems).every(Boolean);

  const handleCheck = (item) => {
    setCheckedItems(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };

  const handleContinue = async () => {
    if (!allChecked) {
      setError('Please check all boxes to continue');
      return;
    }

    setLoading(true);
    acceptTerms(); // Set terms accepted in context
    
    // Redirect based on user role
    setTimeout(() => {
      if (user?.role === 'counselor') {
        navigate('/counselor');
      } else {
        navigate('/dashboard');
      }
    }, 1000);
  };

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
                p: { xs: 3, md: 5 },
                background: 'rgba(255, 255, 255, 0.98)',
                backdropFilter: 'blur(10px)',
                borderRadius: 4,
                maxHeight: '80vh',
                overflow: 'auto',
              }}
            >
              {/* Header */}
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Psychology sx={{ fontSize: 50, color: '#4A90E2' }} />
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#4A90E2', mt: 1 }}>
                  SAFE TALK
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 500, mt: 2 }}>
                  Terms Of Service & User Agreement
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Before We Begin Our Journey Together, Please Read And Accept Our Terms
                </Typography>
              </Box>

              {/* Terms Sections */}
              <Box sx={{ mb: 4 }}>
                <Paper 
                  elevation={2} 
                  sx={{ 
                    p: 3, 
                    mb: 2,
                    background: 'linear-gradient(135deg, rgba(74, 144, 226, 0.05) 0%, rgba(80, 227, 194, 0.05) 100%)',
                    border: '1px solid rgba(74, 144, 226, 0.2)'
                  }}
                >
                  <Typography variant="h6" gutterBottom sx={{ color: '#4A90E2', fontWeight: 600 }}>
                    DATA PRIVACY & CONSENT AGREEMENT
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    We collect and process your data to provide personalized mental health support. 
                    Your data is encrypted and never shared with third parties without your explicit consent.
                  </Typography>
                </Paper>

                <Paper 
                  elevation={2} 
                  sx={{ 
                    p: 3, 
                    mb: 2,
                    background: 'linear-gradient(135deg, rgba(74, 144, 226, 0.05) 0%, rgba(80, 227, 194, 0.05) 100%)',
                    border: '1px solid rgba(74, 144, 226, 0.2)'
                  }}
                >
                  <Typography variant="h6" gutterBottom sx={{ color: '#4A90E2', fontWeight: 600 }}>
                    COUNSELOR ESCALATION PROTOCOL
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    In high-risk situations, our AI system automatically alerts professional counselors 
                    to ensure your safety. This is an automated process designed to protect you.
                  </Typography>
                </Paper>

                <Paper 
                  elevation={2} 
                  sx={{ 
                    p: 3, 
                    mb: 2,
                    background: 'linear-gradient(135deg, rgba(74, 144, 226, 0.05) 0%, rgba(80, 227, 194, 0.05) 100%)',
                    border: '1px solid rgba(74, 144, 226, 0.2)'
                  }}
                >
                  <Typography variant="h6" gutterBottom sx={{ color: '#4A90E2', fontWeight: 600 }}>
                    USER RESPONSIBILITIES
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    You agree to provide accurate information and use this service responsibly. 
                    This platform is a support tool and not a replacement for professional medical advice.
                  </Typography>
                </Paper>

                <Paper 
                  elevation={2} 
                  sx={{ 
                    p: 3, 
                    mb: 2,
                    background: 'linear-gradient(135deg, rgba(74, 144, 226, 0.05) 0%, rgba(80, 227, 194, 0.05) 100%)',
                    border: '1px solid rgba(74, 144, 226, 0.2)'
                  }}
                >
                  <Typography variant="h6" gutterBottom sx={{ color: '#4A90E2', fontWeight: 600 }}>
                    AUTOMATED CRISIS INTERVENTION PROTOCOL
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    When immediate risk is detected, the system will automatically initiate crisis 
                    intervention protocols and connect you with emergency services if necessary.
                  </Typography>
                </Paper>

                <Button
                  variant="text"
                  endIcon={<ArrowForward />}
                  onClick={() => setReadMoreOpen(true)}
                  sx={{ color: '#4A90E2', mt: 1 }}
                >
                  Read More →
                </Button>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Acknowledgement Checklist */}
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                ACKNOWLEDGEMENT CHECKLIST
              </Typography>

              <List>
                <ListItem>
                  <ListItemIcon>
                    <Checkbox
                      checked={checkedItems.notEmergency}
                      onChange={() => handleCheck('notEmergency')}
                      icon={<RadioButtonUnchecked />}
                      checkedIcon={<CheckCircle sx={{ color: '#4A90E2' }} />}
                    />
                  </ListItemIcon>
                  <ListItemText 
                    primary="I Understand This Is NOT An Emergency Service And Know Whom To Contact In Crisis"
                    secondary="In emergency, call 1333 (Sri Lanka National Mental Health Helpline)"
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <Checkbox
                      checked={checkedItems.dataConsent}
                      onChange={() => handleCheck('dataConsent')}
                      icon={<RadioButtonUnchecked />}
                      checkedIcon={<CheckCircle sx={{ color: '#4A90E2' }} />}
                    />
                  </ListItemIcon>
                  <ListItemText 
                    primary="I Consent To Text, Voice, And Optional Visual Data Collection"
                    secondary="Your data is encrypted and protected"
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <Checkbox
                      checked={checkedItems.escalationProtocol}
                      onChange={() => handleCheck('escalationProtocol')}
                      icon={<RadioButtonUnchecked />}
                      checkedIcon={<CheckCircle sx={{ color: '#4A90E2' }} />}
                    />
                  </ListItemIcon>
                  <ListItemText 
                    primary="I Accept The Automated Counselor Escalation Protocol For High-Risk Situations"
                    secondary="For your safety, counselors may be alerted in emergencies"
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <Checkbox
                      checked={checkedItems.responsibleUse}
                      onChange={() => handleCheck('responsibleUse')}
                      icon={<RadioButtonUnchecked />}
                      checkedIcon={<CheckCircle sx={{ color: '#4A90E2' }} />}
                    />
                  </ListItemIcon>
                  <ListItemText 
                    primary="I Agree To Use This Service Responsibly And Provide Accurate Information"
                    secondary="Honest input helps us provide better support"
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <Checkbox
                      checked={checkedItems.aiLimitations}
                      onChange={() => handleCheck('aiLimitations')}
                      icon={<RadioButtonUnchecked />}
                      checkedIcon={<CheckCircle sx={{ color: '#4A90E2' }} />}
                    />
                  </ListItemIcon>
                  <ListItemText 
                    primary="I Understand The AI's Limitations And Will Seek Human Help When Needed"
                    secondary="AI is a support tool, not a replacement for professional care"
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <Checkbox
                      checked={checkedItems.readTerms}
                      onChange={() => handleCheck('readTerms')}
                      icon={<RadioButtonUnchecked />}
                      checkedIcon={<CheckCircle sx={{ color: '#4A90E2' }} />}
                    />
                  </ListItemIcon>
                  <ListItemText 
                    primary="I Have Read And Agree To The Complete Terms Of Service"
                    secondary="Full terms available in the Read More section"
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <Checkbox
                      checked={checkedItems.ageConsent}
                      onChange={() => handleCheck('ageConsent')}
                      icon={<RadioButtonUnchecked />}
                      checkedIcon={<CheckCircle sx={{ color: '#4A90E2' }} />}
                    />
                  </ListItemIcon>
                  <ListItemText 
                    primary="I Am 18 Years Or Older, Or Have Parental Consent If Younger"
                    secondary="Age verification required for service usage"
                  />
                </ListItem>
              </List>

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleContinue}
                disabled={loading}
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
                {loading ? 'PROCESSING...' : 'CONTINUE →'}
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

      {/* Read More Dialog */}
      <Dialog 
        open={readMoreOpen} 
        onClose={() => setReadMoreOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#4A90E2', color: 'white' }}>
          Complete Terms of Service
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>1. Data Privacy & Consent Agreement</Typography>
          <Typography paragraph>
            Safe Talk collects text, voice recordings, and optional video data to provide 
            personalized mental health support. All data is encrypted using industry-standard 
            protocols and stored securely. We never sell your data to third parties. You may 
            request deletion of your data at any time by contacting support.
          </Typography>

          <Typography variant="h6" gutterBottom>2. Counselor Escalation Protocol</Typography>
          <Typography paragraph>
            Our AI system continuously monitors risk levels. If high-risk indicators are detected, 
            the system automatically notifies registered counselors through our secure dashboard. 
            Counselors may reach out to you directly or initiate emergency protocols if necessary.
          </Typography>

          <Typography variant="h6" gutterBottom>3. Automated Crisis Intervention</Typography>
          <Typography paragraph>
            In extreme cases where immediate danger is detected, the system may automatically 
            contact emergency services or crisis hotlines on your behalf. This is a life-saving 
            feature that overrides standard privacy settings during emergencies.
          </Typography>

          <Typography variant="h6" gutterBottom>4. User Responsibilities</Typography>
          <Typography paragraph>
            Users must provide accurate information and use the service responsibly. 
            Safe Talk is a support tool and not a replacement for professional medical advice, 
            diagnosis, or treatment. Always consult qualified healthcare providers for mental 
            health concerns.
          </Typography>

          <Typography variant="h6" gutterBottom>5. Your Rights</Typography>
          <Typography paragraph>
            You have the right to access your data, request corrections, opt out of non-essential 
            data collection, and delete your account at any time. Continued use of the service 
            constitutes acceptance of these terms.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReadMoreOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </VideoBackground>
  );
};

export default TermsOfService;