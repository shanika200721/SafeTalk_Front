import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  Fade,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material';
import ArrowForward from '@mui/icons-material/ArrowForward';
import Psychology from '@mui/icons-material/Psychology';
import { useNavigate } from 'react-router-dom';
import VideoBackground from '../components/common/VideoBackground';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const consentOptions = [
  ['profile_processing', 'Profile processing', 'Legacy combined profile consent retained for existing records.'],
  ['profile_data_storage', 'Profile data storage', 'Required before saving profile assessment drafts or submissions.'],
  ['profile_model_processing', 'Profile model processing', 'Required before profile answers are processed by the verified profile model.'],
  ['dass21_processing', 'DASS-21 processing', 'Required before submitting or updating questionnaire responses.'],
  ['mood_processing', 'Mood check-in processing', 'Required before creating or updating daily check-ins.'],
  ['text_processing', 'Automated text analysis', 'Optional. Direct counselor chat is not blocked by this consent.'],
  ['voice_processing', 'Voice messages', 'Optional until you record or upload voice messages.'],
  ['face_processing', 'Facial data processing', 'Legacy combined facial consent retained for existing records.'],
  ['facial_capture', 'Facial capture', 'Optional. Required before the camera can capture an image.'],
  ['facial_model_processing', 'Facial model processing', 'Optional. Required before an explicitly captured image can be processed.'],
  ['behavioral_processing', 'Behavioral data processing', 'Optional and not pre-granted.'],
  ['counselor_escalation', 'Counselor escalation', 'Allows risk-related information to be surfaced for counselor review.'],
  ['research_data_use', 'Research data use', 'Optional research use. Withdrawal does not delete historical records in this phase.'],
];

const TermsOfService = () => {
  const navigate = useNavigate();
  const { user, acceptTerms } = useAuth();
  const [acknowledgements, setAcknowledgements] = useState({
    notEmergency: false,
    responsibleUse: false,
    aiLimitations: false,
    readTerms: false,
    ageConsent: false,
  });
  const [consents, setConsents] = useState({});
  const [initialConsents, setInitialConsents] = useState({});
  const [policyVersion, setPolicyVersion] = useState('1.0');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const allAcknowledged = Object.values(acknowledgements).every(Boolean);

  useEffect(() => {
    const loadConsentState = async () => {
      try {
        const [policyResponse, consentResponse] = await Promise.all([
          api.get('/api/consents/policy'),
          api.get('/api/consents'),
        ]);
        const current = consentResponse.data.consents || {};
        const state = {};
        consentOptions.forEach(([type]) => {
          state[type] = Boolean(current[type]?.is_granted);
        });
        setPolicyVersion(policyResponse.data.policy_version || '1.0');
        setConsents(state);
        setInitialConsents(state);
      } catch {
        setError('Sign in is required before consent choices can be saved.');
      }
    };

    loadConsentState();
  }, []);

  const toggleAcknowledgement = (name) => {
    setAcknowledgements((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const toggleConsent = (name) => {
    setConsents((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleContinue = async () => {
    if (!allAcknowledged) {
      setError('Please complete the required acknowledgements to continue.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const changedEntries = Object.entries(consents).filter(
        ([type, value]) => initialConsents[type] !== value
      );
      await Promise.all(
        changedEntries.map(([type, value]) =>
          api.put(`/api/consents/${type}`, {
            is_granted: value,
            policy_version: policyVersion,
          })
        )
      );
      acceptTerms();
      if (user?.role === 'counselor' || user?.role === 'psychiatrist' || user?.role === 'admin') {
        navigate('/counselor');
      } else {
        navigate('/dashboard');
      }
    } catch {
      setError('Unable to save consent choices. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <VideoBackground overlay={true}>
      <Container maxWidth="md">
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
                background: 'rgba(255, 255, 255, 0.98)',
                backdropFilter: 'blur(10px)',
                borderRadius: 4,
                maxHeight: '82vh',
                overflow: 'auto',
              }}
            >
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Psychology sx={{ fontSize: 50, color: '#4A90E2' }} />
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#4A90E2', mt: 1 }}>
                  SAFE TALK
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 500, mt: 2 }}>
                  Terms and Consent
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Policy version {policyVersion}
                </Typography>
              </Box>

              <Alert severity="info" sx={{ mb: 3 }}>
                This app is a support and screening tool, not an emergency service. Consent
                choices control future processing and do not delete historical records in Phase 4B.
              </Alert>

              <Typography variant="h6" gutterBottom>
                Required Acknowledgements
              </Typography>
              <List>
                <ListItem>
                  <FormControlLabel
                    control={<Checkbox checked={acknowledgements.notEmergency} onChange={() => toggleAcknowledgement('notEmergency')} />}
                    label="I understand this is not an emergency service."
                  />
                </ListItem>
                <ListItem>
                  <FormControlLabel
                    control={<Checkbox checked={acknowledgements.responsibleUse} onChange={() => toggleAcknowledgement('responsibleUse')} />}
                    label="I agree to use this service responsibly and provide accurate information."
                  />
                </ListItem>
                <ListItem>
                  <FormControlLabel
                    control={<Checkbox checked={acknowledgements.aiLimitations} onChange={() => toggleAcknowledgement('aiLimitations')} />}
                    label="I understand AI outputs are support signals and do not replace professional care."
                  />
                </ListItem>
                <ListItem>
                  <FormControlLabel
                    control={<Checkbox checked={acknowledgements.readTerms} onChange={() => toggleAcknowledgement('readTerms')} />}
                    label="I have read and understand these terms."
                  />
                </ListItem>
                <ListItem>
                  <FormControlLabel
                    control={<Checkbox checked={acknowledgements.ageConsent} onChange={() => toggleAcknowledgement('ageConsent')} />}
                    label="I am 18 years or older, or I have appropriate guardian consent if required."
                  />
                </ListItem>
              </List>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Consent Choices
              </Typography>
              <List>
                {consentOptions.map(([type, label, description]) => (
                  <ListItem key={type} alignItems="flex-start">
                    <FormControlLabel
                      control={<Checkbox checked={Boolean(consents[type])} onChange={() => toggleConsent(type)} />}
                      label={
                        <ListItemText
                          primary={label}
                          secondary={description}
                          primaryTypographyProps={{ sx: { fontWeight: 600 } }}
                        />
                      }
                    />
                  </ListItem>
                ))}
              </List>

              {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

              <Button
                fullWidth
                variant="contained"
                size="large"
                endIcon={<ArrowForward />}
                onClick={handleContinue}
                disabled={loading}
                sx={{
                  mt: 3,
                  py: 1.5,
                  background: 'linear-gradient(135deg, #4A90E2 0%, #50E3C2 100%)',
                  fontSize: '1.1rem',
                }}
              >
                {loading ? 'Saving...' : 'Continue'}
              </Button>
            </Paper>
          </Box>
        </Fade>
      </Container>
    </VideoBackground>
  );
};

export default TermsOfService;
