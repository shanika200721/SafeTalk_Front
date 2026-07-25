import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  FormControlLabel,
  Paper,
  Switch,
  Typography,
} from '@mui/material';
import ArrowBack from '@mui/icons-material/ArrowBack';
import DarkMode from '@mui/icons-material/DarkMode';
import Logout from '@mui/icons-material/Logout';
import Notifications from '@mui/icons-material/Notifications';
import PrivacyTip from '@mui/icons-material/PrivacyTip';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const CONSENT_LABELS = {
  profile_processing: {
    label: 'Profile Processing',
    description: 'Legacy combined profile consent retained for existing records.',
    optional: true,
  },
  profile_data_storage: {
    label: 'Profile Data Storage',
    description: 'Required before saving profile assessment drafts or submissions.',
    optional: false,
  },
  profile_model_processing: {
    label: 'Profile Model Processing',
    description: 'Required before profile answers are processed by the verified profile model.',
    optional: false,
  },
  dass21_processing: {
    label: 'DASS-21 Processing',
    description: 'Required before submitting or updating DASS-21 questionnaire responses.',
    optional: false,
  },
  mood_processing: {
    label: 'Mood Check-In Processing',
    description: 'Required before creating or updating daily check-ins.',
    optional: false,
  },
  text_processing: {
    label: 'Automated Text Analysis',
    description: 'Optional. Normal direct counselor chat remains available without this analysis consent.',
    optional: true,
  },
  voice_processing: {
    label: 'Voice Messages',
    description: 'Required before recording, uploading, storing, or processing voice messages.',
    optional: true,
  },
  face_processing: {
    label: 'Facial Data Processing',
    description: 'Legacy combined facial consent retained for existing records.',
    optional: true,
  },
  facial_capture: {
    label: 'Facial Capture',
    description: 'Optional. Required before the camera can capture an image for facial check-in.',
    optional: true,
  },
  facial_model_processing: {
    label: 'Facial Model Processing',
    description: 'Optional. Required before an explicitly captured facial image can be processed.',
    optional: true,
  },
  behavioral_processing: {
    label: 'Behavioral Signal Processing',
    description: 'Optional processing of behavioral signals beyond direct app use.',
    optional: true,
  },
  counselor_escalation: {
    label: 'Counselor Escalation',
    description: 'Allows risk-related information to be surfaced for counselor review.',
    optional: true,
  },
  research_data_use: {
    label: 'Research Data Use',
    description: 'Optional use of data for research workflows. Historical deletion is a later privacy workflow.',
    optional: true,
  },
};

const Settings = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [policyVersion, setPolicyVersion] = useState('');
  const [consents, setConsents] = useState({});
  const [loadingConsents, setLoadingConsents] = useState(true);
  const [savingType, setSavingType] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadConsents = async () => {
      try {
        setLoadingConsents(true);
        const [policyResponse, consentResponse] = await Promise.all([
          api.get('/api/consents/policy'),
          api.get('/api/consents'),
        ]);
        setPolicyVersion(policyResponse.data.policy_version);
        setConsents(consentResponse.data.consents || {});
        setError('');
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Unable to load consent settings.');
      } finally {
        setLoadingConsents(false);
      }
    };

    loadConsents();
  }, []);

  const handleConsentChange = async (consentType, nextValue) => {
    setError('');
    setSuccess('');
    const label = CONSENT_LABELS[consentType]?.label || consentType;

    if (!nextValue) {
      const confirmed = window.confirm(
        `Withdraw ${label} consent? This may disable future use of related features. Historical records are not deleted by this action.`
      );
      if (!confirmed) return;
    }

    try {
      setSavingType(consentType);
      const response = await api.put(`/api/consents/${consentType}`, {
        is_granted: nextValue,
        policy_version: policyVersion || '1.0',
      });
      setConsents((prev) => ({
        ...prev,
        [consentType]: {
          ...prev[consentType],
          is_granted: response.data.is_granted && !response.data.withdrawn_at,
          policy_version: response.data.policy_version,
          granted_at: response.data.granted_at,
          withdrawn_at: response.data.withdrawn_at,
          updated_at: response.data.updated_at,
        },
      }));
      setSuccess(`${label} consent ${nextValue ? 'granted' : 'withdrawn'}.`);
    } catch (err) {
      setError(err.response?.data?.error?.message || `Unable to update ${label} consent.`);
    } finally {
      setSavingType('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography>Loading...</Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/dashboard')} sx={{ mb: 2 }}>
        Back to Dashboard
      </Button>

      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Settings
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Manage your account preferences and consent choices
        </Typography>

        <Box sx={{ mb: 4, p: 3, bgcolor: '#f5f5f5', borderRadius: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Logged in as: <strong>{user?.email}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Role: {user?.role === 'counselor' ? 'Counselor' : 'Student'}
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h5" gutterBottom>
          Preferences
        </Typography>

        <Box sx={{ mb: 2 }}>
          <FormControlLabel
            control={<Switch checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} />}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <DarkMode sx={{ mr: 1 }} />
                <Typography>Dark Mode</Typography>
              </Box>
            }
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <FormControlLabel
            control={<Switch checked={notifications} onChange={(e) => setNotifications(e.target.checked)} />}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Notifications sx={{ mr: 1 }} />
                <Typography>Push Notifications</Typography>
              </Box>
            }
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <PrivacyTip color="primary" />
          <Typography variant="h5">Consent</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Policy version: {policyVersion || 'Loading...'}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        {loadingConsents ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 3 }}>
            <CircularProgress size={24} />
            <Typography>Loading consent settings...</Typography>
          </Box>
        ) : (
          Object.entries(CONSENT_LABELS).map(([consentType, config]) => (
            <Box
              key={consentType}
              sx={{
                py: 2,
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={Boolean(consents[consentType]?.is_granted)}
                    disabled={savingType === consentType}
                    onChange={(event) => handleConsentChange(consentType, event.target.checked)}
                    inputProps={{ 'aria-label': `${config.label} consent` }}
                  />
                }
                label={
                  <Box>
                    <Typography sx={{ fontWeight: 600 }}>
                      {config.label} {config.optional ? '(Optional)' : '(Required for feature)'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {config.description}
                    </Typography>
                  </Box>
                }
              />
            </Box>
          ))
        )}

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Withdrawing consent blocks future related processing. It does not delete historical data in Phase 4B.
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button variant="outlined" color="primary">
            Download My Data
          </Button>
          <Button variant="contained" color="error" onClick={handleLogout} startIcon={<Logout />}>
            Logout
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Settings;
