import React, { useState } from 'react';
import { Container, Paper, Typography, Box, Button, Switch, FormControlLabel, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ArrowBack from '@mui/icons-material/ArrowBack';
import Logout from '@mui/icons-material/Logout';
import DarkMode from '@mui/icons-material/DarkMode';
import Notifications from '@mui/icons-material/Notifications';
import PrivacyTip from '@mui/icons-material/PrivacyTip'; // Changed from Privacy to PrivacyTip

const Settings = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [dataCollection, setDataCollection] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // If no user, show loading or redirect
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
          Manage your account preferences and privacy
        </Typography>

        {/* User Info */}
        <Box sx={{ mb: 4, p: 3, bgcolor: '#f5f5f5', borderRadius: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Logged in as: <strong>{user?.email}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Role: {user?.role === 'counselor' ? 'Counselor' : 'Student'}
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Preferences */}
        <Typography variant="h5" gutterBottom>
          Preferences
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
                color="primary"
              />
            }
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
            control={
              <Switch
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Notifications sx={{ mr: 1 }} />
                <Typography>Push Notifications</Typography>
              </Box>
            }
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Privacy */}
        <Typography variant="h5" gutterBottom>
          Privacy
        </Typography>

        <Box sx={{ mb: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={dataCollection}
                onChange={(e) => setDataCollection(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PrivacyTip sx={{ mr: 1 }} /> {/* Changed from Privacy to PrivacyTip */}
                <Typography>Allow Data Collection for AI Training</Typography>
              </Box>
            }
          />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
          You can withdraw consent at any time. Your data will be anonymized.
        </Typography>

        <Divider sx={{ my: 3 }} />

        {/* Account Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button variant="outlined" color="primary">
            Download My Data
          </Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={handleLogout}
            startIcon={<Logout />}
          >
            Logout
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Settings;