import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Badge,
  Tooltip,
  Fade,
  Zoom,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  Tabs,
  Tab,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import VideoBackground from '../../components/common/VideoBackground';
import ArrowBack from '@mui/icons-material/ArrowBack';
import PsychologyIcon from '@mui/icons-material/Psychology';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import WarningIcon from '@mui/icons-material/Warning';
import ChatIcon from '@mui/icons-material/Chat';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SecurityIcon from '@mui/icons-material/Security';
import PrivacyTipIcon from '@mui/icons-material/PrivacyTip';
import LanguageIcon from '@mui/icons-material/Language';
import PaletteIcon from '@mui/icons-material/Palette';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';

// Tab Panel Component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const SettingsView = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [editMode, setEditMode] = useState(false);

  // Settings state
  const [profile, setProfile] = useState({
    name: user?.name || 'Dr. Perera',
    email: user?.email || 'perera@counselor.lk',
    phone: '+94 77 123 4567',
    specialization: user?.specialization || 'Clinical Psychology',
    licenseNumber: user?.licenseNumber || 'LIC123456',
    hospital: user?.hospital || 'National Hospital',
    bio: 'Experienced clinical psychologist specializing in student mental health and crisis intervention.',
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: true,
    pushNotifications: true,
    dailyDigest: false,
    alertThreshold: 'medium',
    reminderTime: '30',
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: 'private',
    shareAnalytics: true,
    dataRetention: '1year',
    twoFactorAuth: false,
  });

  const [appearance, setAppearance] = useState({
    theme: 'light',
    fontSize: 'medium',
    compactView: false,
    language: 'english',
  });

  const menuItems = [
    { text: 'Dashboard', icon: <PersonIcon />, path: '/counselor' },
    { text: 'Students', icon: <SchoolIcon />, path: '/counselor/students' },
    { text: 'Alerts', icon: <WarningIcon />, path: '/counselor/alerts' },
    { text: 'Sessions', icon: <ChatIcon />, path: '/counselor/sessions' },
    { text: 'Reports', icon: <AssessmentIcon />, path: '/counselor/reports' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/counselor/settings' },
  ];

  const handleSave = () => {
    setSnackbarMessage('Settings saved successfully');
    setSnackbarOpen(true);
    setEditMode(false);
  };

  return (
    <VideoBackground overlay={true}>
      <Box sx={{ display: 'flex' }}>
        {/* Sidebar Drawer */}
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          PaperProps={{
            sx: {
              width: 280,
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(10px)',
            }
          }}
        >
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <PsychologyIcon sx={{ fontSize: 50, color: '#4A90E2' }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#4A90E2' }}>
              SAFE TALK
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Counselor Portal
            </Typography>
          </Box>
          <Divider />
          <List>
            {menuItems.map((item) => (
              <ListItem 
                button 
                key={item.text}
                onClick={() => {
                  navigate(item.path);
                  setDrawerOpen(false);
                }}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  mb: 0.5,
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(74, 144, 226, 0.1) 0%, rgba(80, 227, 194, 0.1) 100%)',
                  }
                }}
              >
                <ListItemIcon sx={{ color: '#4A90E2' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
          <Divider />
          <List>
            <ListItem 
              button 
              onClick={logout}
              sx={{
                borderRadius: 2,
                mx: 1,
                color: '#f44336',
                '&:hover': {
                  background: 'rgba(244, 67, 54, 0.1)',
                }
              }}
            >
              <ListItemIcon sx={{ color: '#f44336' }}>
                <ExitToAppIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </Drawer>

        {/* Main Content */}
        <Container maxWidth="xl" sx={{ py: 4 }}>
          {/* Top Bar */}
          <Fade in={true} timeout={1000}>
            <Paper
              elevation={3}
              sx={{
                p: 2,
                mb: 4,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderRadius: 3,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton onClick={() => navigate('/counselor')} sx={{ mr: 2 }}>
                  <ArrowBack />
                </IconButton>
                <IconButton onClick={() => setDrawerOpen(true)} sx={{ mr: 2 }}>
                  <MenuIcon />
                </IconButton>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Settings
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Manage your account preferences
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button 
                  variant="contained" 
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  sx={{ bgcolor: '#4A90E2' }}
                >
                  Save Changes
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<EditIcon />}
                  onClick={() => setEditMode(!editMode)}
                >
                  {editMode ? 'Cancel Edit' : 'Edit'}
                </Button>
                <Badge badgeContent={3} color="primary">
                  <IconButton>
                    <NotificationsIcon />
                  </IconButton>
                </Badge>
                <Avatar 
                  sx={{ 
                    bgcolor: 'linear-gradient(135deg, #4A90E2, #50E3C2)',
                    cursor: 'pointer'
                  }}
                >
                  {user?.name?.charAt(0)}
                </Avatar>
              </Box>
            </Paper>
          </Fade>

          {/* Settings Tabs */}
          <Paper sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}>
            <Tabs 
              value={tabValue} 
              onChange={(e, v) => setTabValue(v)}
              variant="fullWidth"
              sx={{
                bgcolor: 'background.paper',
                '& .MuiTab-root.Mui-selected': {
                  color: '#4A90E2',
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#4A90E2',
                }
              }}
            >
              <Tab icon={<PersonIcon />} label="Profile" />
              <Tab icon={<NotificationsIcon />} label="Notifications" />
              <Tab icon={<SecurityIcon />} label="Privacy & Security" />
              <Tab icon={<PaletteIcon />} label="Appearance" />
            </Tabs>
          </Paper>

          {/* Profile Settings */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card sx={{ bgcolor: 'rgba(255,255,255,0.95)' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Box sx={{ position: 'relative', display: 'inline-block' }}>
                      <Avatar 
                        sx={{ 
                          width: 120, 
                          height: 120, 
                          mx: 'auto',
                          mb: 2,
                          bgcolor: '#4A90E2',
                          fontSize: '3rem'
                        }}
                      >
                        {profile.name.charAt(0)}
                      </Avatar>
                      {editMode && (
                        <IconButton 
                          sx={{ 
                            position: 'absolute', 
                            bottom: 10, 
                            right: 10,
                            bgcolor: 'white'
                          }}
                          size="small"
                        >
                          <PhotoCameraIcon />
                        </IconButton>
                      )}
                    </Box>
                    <Typography variant="h5">{profile.name}</Typography>
                    <Typography color="text.secondary">{profile.specialization}</Typography>
                    <Chip 
                      label="Active"
                      size="small"
                      sx={{ mt: 1, bgcolor: '#4caf50', color: 'white' }}
                    />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.95)' }}>
                  <Typography variant="h6" gutterBottom>Profile Information</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Full Name"
                        value={profile.name}
                        disabled={!editMode}
                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        value={profile.email}
                        disabled={!editMode}
                        onChange={(e) => setProfile({...profile, email: e.target.value})}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Phone"
                        value={profile.phone}
                        disabled={!editMode}
                        onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Specialization"
                        value={profile.specialization}
                        disabled={!editMode}
                        onChange={(e) => setProfile({...profile, specialization: e.target.value})}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="License Number"
                        value={profile.licenseNumber}
                        disabled={!editMode}
                        onChange={(e) => setProfile({...profile, licenseNumber: e.target.value})}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Hospital/Institution"
                        value={profile.hospital}
                        disabled={!editMode}
                        onChange={(e) => setProfile({...profile, hospital: e.target.value})}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Bio"
                        multiline
                        rows={3}
                        value={profile.bio}
                        disabled={!editMode}
                        onChange={(e) => setProfile({...profile, bio: e.target.value})}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Notifications Settings */}
          <TabPanel value={tabValue} index={1}>
            <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.95)' }}>
              <Typography variant="h6" gutterBottom>Notification Preferences</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={notifications.emailAlerts}
                        onChange={(e) => setNotifications({...notifications, emailAlerts: e.target.checked})}
                        disabled={!editMode}
                      />
                    }
                    label="Email Alerts"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={notifications.smsAlerts}
                        onChange={(e) => setNotifications({...notifications, smsAlerts: e.target.checked})}
                        disabled={!editMode}
                      />
                    }
                    label="SMS Alerts"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={notifications.pushNotifications}
                        onChange={(e) => setNotifications({...notifications, pushNotifications: e.target.checked})}
                        disabled={!editMode}
                      />
                    }
                    label="Push Notifications"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={notifications.dailyDigest}
                        onChange={(e) => setNotifications({...notifications, dailyDigest: e.target.checked})}
                        disabled={!editMode}
                      />
                    }
                    label="Daily Digest Email"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!editMode}>
                    <InputLabel>Alert Threshold</InputLabel>
                    <Select
                      value={notifications.alertThreshold}
                      onChange={(e) => setNotifications({...notifications, alertThreshold: e.target.value})}
                      label="Alert Threshold"
                    >
                      <MenuItem value="critical">Critical Only</MenuItem>
                      <MenuItem value="high">High and Above</MenuItem>
                      <MenuItem value="medium">Medium and Above</MenuItem>
                      <MenuItem value="all">All Alerts</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!editMode}>
                    <InputLabel>Reminder Time</InputLabel>
                    <Select
                      value={notifications.reminderTime}
                      onChange={(e) => setNotifications({...notifications, reminderTime: e.target.value})}
                      label="Reminder Time"
                    >
                      <MenuItem value="15">15 minutes before</MenuItem>
                      <MenuItem value="30">30 minutes before</MenuItem>
                      <MenuItem value="60">1 hour before</MenuItem>
                      <MenuItem value="120">2 hours before</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>
          </TabPanel>

          {/* Privacy & Security */}
          <TabPanel value={tabValue} index={2}>
            <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.95)' }}>
              <Typography variant="h6" gutterBottom>Privacy & Security Settings</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!editMode}>
                    <InputLabel>Profile Visibility</InputLabel>
                    <Select
                      value={privacy.profileVisibility}
                      onChange={(e) => setPrivacy({...privacy, profileVisibility: e.target.value})}
                      label="Profile Visibility"
                    >
                      <MenuItem value="public">Public</MenuItem>
                      <MenuItem value="private">Private</MenuItem>
                      <MenuItem value="contacts">Contacts Only</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!editMode}>
                    <InputLabel>Data Retention</InputLabel>
                    <Select
                      value={privacy.dataRetention}
                      onChange={(e) => setPrivacy({...privacy, dataRetention: e.target.value})}
                      label="Data Retention"
                    >
                      <MenuItem value="3months">3 Months</MenuItem>
                      <MenuItem value="6months">6 Months</MenuItem>
                      <MenuItem value="1year">1 Year</MenuItem>
                      <MenuItem value="2years">2 Years</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={privacy.shareAnalytics}
                        onChange={(e) => setPrivacy({...privacy, shareAnalytics: e.target.checked})}
                        disabled={!editMode}
                      />
                    }
                    label="Share Anonymous Analytics"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={privacy.twoFactorAuth}
                        onChange={(e) => setPrivacy({...privacy, twoFactorAuth: e.target.checked})}
                        disabled={!editMode}
                      />
                    }
                    label="Two-Factor Authentication"
                  />
                </Grid>
              </Grid>
            </Paper>
          </TabPanel>

          {/* Appearance */}
          <TabPanel value={tabValue} index={3}>
            <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.95)' }}>
              <Typography variant="h6" gutterBottom>Appearance Settings</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!editMode}>
                    <InputLabel>Theme</InputLabel>
                    <Select
                      value={appearance.theme}
                      onChange={(e) => setAppearance({...appearance, theme: e.target.value})}
                      label="Theme"
                    >
                      <MenuItem value="light">Light</MenuItem>
                      <MenuItem value="dark">Dark</MenuItem>
                      <MenuItem value="system">System Default</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!editMode}>
                    <InputLabel>Font Size</InputLabel>
                    <Select
                      value={appearance.fontSize}
                      onChange={(e) => setAppearance({...appearance, fontSize: e.target.value})}
                      label="Font Size"
                    >
                      <MenuItem value="small">Small</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="large">Large</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!editMode}>
                    <InputLabel>Language</InputLabel>
                    <Select
                      value={appearance.language}
                      onChange={(e) => setAppearance({...appearance, language: e.target.value})}
                      label="Language"
                    >
                      <MenuItem value="english">English</MenuItem>
                      <MenuItem value="sinhala">Sinhala</MenuItem>
                      <MenuItem value="tamil">Tamil</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={appearance.compactView}
                        onChange={(e) => setAppearance({...appearance, compactView: e.target.checked})}
                        disabled={!editMode}
                      />
                    }
                    label="Compact View"
                  />
                </Grid>
              </Grid>
            </Paper>
          </TabPanel>
        </Container>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </VideoBackground>
  );
};

export default SettingsView;