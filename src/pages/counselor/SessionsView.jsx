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
  Tabs,
  Tab,
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Rating,
  LinearProgress,
  Alert,
  Snackbar,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ChipProps,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import VideoBackground from '../../components/common/VideoBackground';
import ArrowBack from '@mui/icons-material/ArrowBack';
import Psychology from '@mui/icons-material/Psychology';
import Menu from '@mui/icons-material/Menu';
import Chat from '@mui/icons-material/Chat';
import VideoCall from '@mui/icons-material/VideoCall';
import Call from '@mui/icons-material/Call';
import Person from '@mui/icons-material/Person';
import Schedule from '@mui/icons-material/Schedule';
import Event from '@mui/icons-material/Event';
import Today from '@mui/icons-material/Today';
import DateRange from '@mui/icons-material/DateRange';
import CalendarMonth from '@mui/icons-material/CalendarMonth';
import Add from '@mui/icons-material/Add';
import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Cancel from '@mui/icons-material/Cancel';
import Pending from '@mui/icons-material/Pending';
import Notifications from '@mui/icons-material/Notifications';
import Search from '@mui/icons-material/Search';
import Warning from '@mui/icons-material/Warning';
import Assessment from '@mui/icons-material/Assessment';
import Settings from '@mui/icons-material/Settings';
import ExitToApp from '@mui/icons-material/ExitToApp';
import ExpandMore from '@mui/icons-material/ExpandMore';
import History from '@mui/icons-material/History';
import Download from '@mui/icons-material/Download';
import Share from '@mui/icons-material/Share';
import Print from '@mui/icons-material/Print';

// Tab Panel Component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`sessions-tabpanel-${index}`}
      aria-labelledby={`sessions-tab-${index}`}
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

const SessionsView = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [sessionNotes, setSessionNotes] = useState('');

  // Mock sessions data
  const sessions = {
    today: [
      {
        id: 1,
        student: 'Kamal Perera',
        studentId: 'CS/2020/001',
        type: 'Crisis Intervention',
        time: '10:30 AM',
        duration: '60 min',
        status: 'scheduled',
        mode: 'video',
        riskLevel: 'high',
        notes: 'Follow-up on suicidal ideation. Patient expressed thoughts of self-harm yesterday.',
        counselor: 'Dr. Perera',
        location: 'Video Call',
        preparation: 'Review previous session notes and crisis plan',
      },
      {
        id: 2,
        student: 'Priyanka Jayawardena',
        studentId: 'CS/2020/112',
        type: 'Therapy Session',
        time: '2:00 PM',
        duration: '45 min',
        status: 'scheduled',
        mode: 'chat',
        riskLevel: 'high',
        notes: 'Anxiety management techniques. Focus on breathing exercises and grounding techniques.',
        counselor: 'Dr. Perera',
        location: 'Chat Platform',
        preparation: 'Prepare anxiety worksheets',
      },
      {
        id: 3,
        student: 'Nimali Silva',
        studentId: 'CS/2020/045',
        type: 'Assessment',
        time: '4:30 PM',
        duration: '90 min',
        status: 'scheduled',
        mode: 'in-person',
        riskLevel: 'medium',
        notes: 'DASS-21 follow-up assessment. Review progress since last session.',
        counselor: 'Dr. Perera',
        location: 'Room 302, Counseling Center',
        preparation: 'Print assessment forms',
      },
    ],
    upcoming: [
      {
        id: 4,
        student: 'Lahiru Weerasinghe',
        studentId: 'CS/2020/067',
        type: 'Follow-up',
        date: '2025-03-02',
        time: '9:00 AM',
        duration: '30 min',
        status: 'scheduled',
        mode: 'voice',
        riskLevel: 'low',
        notes: 'Check-in on academic stress. Discuss exam preparation strategies.',
        counselor: 'Dr. Perera',
        location: 'Phone Call',
      },
      {
        id: 5,
        student: 'Sunil Fernando',
        studentId: 'CS/2020/089',
        type: 'Therapy Session',
        date: '2025-03-02',
        time: '11:00 AM',
        duration: '45 min',
        status: 'scheduled',
        mode: 'video',
        riskLevel: 'medium',
        notes: 'Coping strategies for depression. Introduce CBT techniques.',
        counselor: 'Dr. Perera',
        location: 'Video Call',
      },
      {
        id: 6,
        student: 'Malini Fernando',
        studentId: 'CS/2020/156',
        type: 'Initial Assessment',
        date: '2025-03-03',
        time: '1:30 PM',
        duration: '60 min',
        status: 'scheduled',
        mode: 'in-person',
        riskLevel: 'high',
        notes: 'New patient intake. Assess for suicidal ideation and self-harm risk.',
        counselor: 'Dr. Perera',
        location: 'Room 305, Counseling Center',
      },
      {
        id: 7,
        student: 'Ruwan Jayasuriya',
        studentId: 'CS/2020/078',
        type: 'Group Therapy',
        date: '2025-03-04',
        time: '3:00 PM',
        duration: '90 min',
        status: 'scheduled',
        mode: 'in-person',
        riskLevel: 'medium',
        notes: 'Anxiety support group. Theme: Managing academic pressure.',
        counselor: 'Dr. Perera',
        location: 'Group Room A',
      },
    ],
    past: [
      {
        id: 8,
        student: 'Kamal Perera',
        studentId: 'CS/2020/001',
        type: 'Crisis Intervention',
        date: '2025-02-28',
        time: '3:00 PM',
        duration: '45 min',
        status: 'completed',
        mode: 'video',
        outcome: 'Stabilized',
        effectiveness: 4,
        notes: 'Patient responded well to intervention. Created safety plan.',
        counselor: 'Dr. Perera',
        feedback: 'Patient felt heard and supported',
        followUp: 'Schedule weekly sessions',
      },
      {
        id: 9,
        student: 'Nimali Silva',
        studentId: 'CS/2020/045',
        type: 'Therapy Session',
        date: '2025-02-27',
        time: '10:00 AM',
        duration: '50 min',
        status: 'completed',
        mode: 'chat',
        outcome: 'Progressing',
        effectiveness: 3,
        notes: 'Discussed mindfulness techniques. Patient willing to try meditation.',
        counselor: 'Dr. Perera',
        feedback: 'Patient engaged but hesitant',
        followUp: 'Continue with mindfulness exercises',
      },
      {
        id: 10,
        student: 'Priyanka Jayawardena',
        studentId: 'CS/2020/112',
        type: 'Emergency Session',
        date: '2025-02-26',
        time: '8:30 PM',
        duration: '30 min',
        status: 'completed',
        mode: 'call',
        outcome: 'Resolved',
        effectiveness: 5,
        notes: 'Handled panic attack successfully. Patient calm at end of call.',
        counselor: 'Dr. Perera',
        feedback: 'Very grateful for immediate support',
        followUp: 'Follow up tomorrow',
      },
      {
        id: 11,
        student: 'Lahiru Weerasinghe',
        studentId: 'CS/2020/067',
        type: 'Follow-up',
        date: '2025-02-25',
        time: '2:00 PM',
        duration: '30 min',
        status: 'completed',
        mode: 'voice',
        outcome: 'Completed',
        effectiveness: 4,
        notes: 'Academic stress reduced. Implementing time management strategies.',
        counselor: 'Dr. Perera',
        feedback: 'Found strategies helpful',
        followUp: 'Monthly check-in',
      },
    ],
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'scheduled': return '#2196f3';
      case 'completed': return '#4caf50';
      case 'cancelled': return '#f44336';
      case 'in-progress': return '#ff9800';
      default: return '#757575';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'scheduled': return <Schedule />;
      case 'completed': return <CheckCircle />;
      case 'cancelled': return <Cancel />;
      case 'in-progress': return <Pending />;
      default: return <Schedule />;
    }
  };

  const getModeIcon = (mode) => {
    switch(mode) {
      case 'video': return <VideoCall />;
      case 'chat': return <Chat />;
      case 'voice': return <Call />;
      case 'in-person': return <Person />;
      default: return <Chat />;
    }
  };

  const getRiskColor = (level) => {
    switch(level) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#757575';
    }
  };

  const handleJoinSession = (session) => {
    setSnackbarMessage(`Joining ${session.mode} session with ${session.student}...`);
    setSnackbarOpen(true);
    // In real app, redirect to appropriate meeting platform
    if (session.mode === 'video') {
      window.open(`https://meet.safetalk.lk/${session.studentId}`, '_blank');
    } else if (session.mode === 'chat') {
      navigate(`/counselor/chat/${session.studentId}`);
    } else if (session.mode === 'voice') {
      window.location.href = `tel:+9477${session.studentId.slice(-7)}`;
    }
  };

  const handleReschedule = (session) => {
    setSelectedSession(session);
    setSessionDialogOpen(true);
  };

  const handleCancelSession = (session) => {
    setSelectedSession(session);
    setCancelDialogOpen(true);
  };

  const handleViewDetails = (session) => {
    setSelectedSession(session);
    setDetailsDialogOpen(true);
  };

  const handleAddNotes = () => {
    setSnackbarMessage('Session notes saved successfully');
    setSnackbarOpen(true);
    setDetailsDialogOpen(false);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <Person />, path: '/counselor' },
    { text: 'Students', icon: <Person />, path: '/counselor/students' },
    { text: 'Alerts', icon: <Warning />, path: '/counselor/alerts' },
    { text: 'Sessions', icon: <Chat />, path: '/counselor/sessions' },
    { text: 'Reports', icon: <Assessment />, path: '/counselor/reports' },
    { text: 'Settings', icon: <Settings />, path: '/counselor/settings' },
  ];

  const handleStepNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleStepBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStepReset = () => {
    setActiveStep(0);
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
            <Psychology sx={{ fontSize: 50, color: '#4A90E2' }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#4A90E2' }}>
              SAFE TALK
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Counselor Portal
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Avatar 
                sx={{ 
                  width: 80, 
                  height: 80, 
                  mx: 'auto',
                  bgcolor: 'linear-gradient(135deg, #4A90E2, #50E3C2)',
                  fontSize: '2rem'
                }}
              >
                {user?.name?.charAt(0)}
              </Avatar>
              <Typography variant="subtitle1" sx={{ mt: 1, fontWeight: 600 }}>
                {user?.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.specialization}
              </Typography>
            </Box>
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
                <ExitToApp />
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
                  <Menu />
                </IconButton>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Session Management
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Schedule and manage counseling sessions
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TextField
                  size="small"
                  placeholder="Search sessions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ width: 250 }}
                />
                <Button 
                  variant="contained" 
                  startIcon={<Add />}
                  onClick={() => setSessionDialogOpen(true)}
                  sx={{ bgcolor: '#4A90E2' }}
                >
                  New Session
                </Button>
                <Badge badgeContent={sessions.today.length} color="primary">
                  <IconButton>
                    <Notifications />
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

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Zoom in={true} timeout={500}>
                <Card sx={{ bgcolor: 'rgba(255,255,255,0.95)' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography color="text.secondary" gutterBottom>
                          Today's Sessions
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 700, color: '#4A90E2' }}>
                          {sessions.today.length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Next: {sessions.today[0]?.time}
                        </Typography>
                      </Box>
                      <Today sx={{ fontSize: 50, color: '#4A90E2', opacity: 0.3 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Zoom in={true} timeout={700}>
                <Card sx={{ bgcolor: 'rgba(255,255,255,0.95)' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography color="text.secondary" gutterBottom>
                          This Week
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 700, color: '#ff9800' }}>
                          {sessions.today.length + sessions.upcoming.length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          +{sessions.upcoming.length} upcoming
                        </Typography>
                      </Box>
                      <DateRange sx={{ fontSize: 50, color: '#ff9800', opacity: 0.3 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Zoom in={true} timeout={900}>
                <Card sx={{ bgcolor: 'rgba(255,255,255,0.95)' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography color="text.secondary" gutterBottom>
                          This Month
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 700, color: '#4caf50' }}>
                          {sessions.today.length + sessions.upcoming.length + sessions.past.length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {sessions.past.length} completed
                        </Typography>
                      </Box>
                      <CalendarMonth sx={{ fontSize: 50, color: '#4caf50', opacity: 0.3 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Zoom in={true} timeout={1100}>
                <Card sx={{ bgcolor: 'rgba(255,255,255,0.95)' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography color="text.secondary" gutterBottom>
                          Avg. Effectiveness
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 700, color: '#50E3C2' }}>
                          4.2
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Rating value={4.2} precision={0.5} readOnly size="small" />
                          <Typography variant="body2" color="text.secondary">
                            (12 ratings)
                          </Typography>
                        </Box>
                      </Box>
                      <Assessment sx={{ fontSize: 50, color: '#50E3C2', opacity: 0.3 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
          </Grid>

          {/* Quick Actions */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.95)', display: 'flex', gap: 2 }}>
                <Button variant="outlined" startIcon={<VideoCall />}>
                  Start Video Session
                </Button>
                <Button variant="outlined" startIcon={<Chat />}>
                  Open Chat
                </Button>
                <Button variant="outlined" startIcon={<Call />}>
                  Make Call
                </Button>
                <Button variant="outlined" startIcon={<History />}>
                  View History
                </Button>
                <Button variant="outlined" startIcon={<Download />}>
                  Export Schedule
                </Button>
                <Button variant="outlined" startIcon={<Print />}>
                  Print
                </Button>
              </Paper>
            </Grid>
          </Grid>

          {/* Tabs */}
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
              <Tab 
                icon={<Today />} 
                label={`Today (${sessions.today.length})`} 
                iconPosition="start"
              />
              <Tab 
                icon={<Event />} 
                label={`Upcoming (${sessions.upcoming.length})`} 
                iconPosition="start"
              />
              <Tab 
                icon={<History />} 
                label={`Past (${sessions.past.length})`} 
                iconPosition="start"
              />
            </Tabs>
          </Paper>

          {/* Today's Sessions Tab */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              {sessions.today.map((session) => (
                <Grid item xs={12} md={6} key={session.id}>
                  <Fade in={true} timeout={500}>
                    <Card sx={{ 
                      bgcolor: 'rgba(255,255,255,0.95)',
                      borderLeft: `6px solid ${getRiskColor(session.riskLevel)}`,
                      '&:hover': {
                        transform: 'scale(1.02)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                      },
                      transition: 'all 0.3s ease'
                    }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ bgcolor: getRiskColor(session.riskLevel) }}>
                              {session.student.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="h6">{session.student}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {session.studentId}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Chip 
                              icon={getModeIcon(session.mode)}
                              label={session.mode}
                              size="small"
                              variant="outlined"
                            />
                            <Chip 
                              icon={getStatusIcon(session.status)}
                              label={session.status}
                              size="small"
                              sx={{ 
                                bgcolor: getStatusColor(session.status),
                                color: 'white'
                              }}
                            />
                          </Box>
                        </Box>

                        <Grid container spacing={2} sx={{ mb: 2 }}>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">
                              Time
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {session.time} ({session.duration})
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">
                              Type
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {session.type}
                            </Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="caption" color="text.secondary">
                              Location
                            </Typography>
                            <Typography variant="body2">
                              {session.location || session.mode}
                            </Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="caption" color="text.secondary">
                              Notes
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              bgcolor: '#f5f5f5', 
                              p: 1, 
                              borderRadius: 1,
                              fontSize: '0.9rem'
                            }}>
                              {session.notes}
                            </Typography>
                          </Grid>
                        </Grid>

                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <Button 
                            variant="contained" 
                            size="small"
                            startIcon={getModeIcon(session.mode)}
                            onClick={() => handleJoinSession(session)}
                            sx={{ bgcolor: '#4A90E2' }}
                          >
                            Join Session
                          </Button>
                          <Button 
                            variant="outlined" 
                            size="small"
                            onClick={() => handleViewDetails(session)}
                          >
                            Details
                          </Button>
                          <Button 
                            variant="outlined" 
                            size="small"
                            color="warning"
                            onClick={() => handleReschedule(session)}
                          >
                            Reschedule
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Fade>
                </Grid>
              ))}
            </Grid>
          </TabPanel>

          {/* Upcoming Sessions Tab */}
          <TabPanel value={tabValue} index={1}>
            <TableContainer component={Paper} sx={{ bgcolor: 'rgba(255,255,255,0.95)' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell>Student</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Mode</TableCell>
                    <TableCell>Risk Level</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sessions.upcoming.map((session) => (
                    <TableRow key={session.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: getRiskColor(session.riskLevel) }}>
                            {session.student.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {session.student}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {session.studentId}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{session.date}</TableCell>
                      <TableCell>{session.time}</TableCell>
                      <TableCell>{session.type}</TableCell>
                      <TableCell>
                        <Chip 
                          icon={getModeIcon(session.mode)}
                          label={session.mode}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={session.riskLevel}
                          size="small"
                          sx={{ 
                            bgcolor: getRiskColor(session.riskLevel),
                            color: 'white'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          icon={getStatusIcon(session.status)}
                          label={session.status}
                          size="small"
                          sx={{ bgcolor: getStatusColor(session.status), color: 'white' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton size="small" onClick={() => handleViewDetails(session)}>
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reschedule">
                            <IconButton size="small" color="warning" onClick={() => handleReschedule(session)}>
                              <Schedule />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Cancel">
                            <IconButton size="small" color="error" onClick={() => handleCancelSession(session)}>
                              <Cancel />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Past Sessions Tab */}
          <TabPanel value={tabValue} index={2}>
            <TableContainer component={Paper} sx={{ bgcolor: 'rgba(255,255,255,0.95)' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell>Student</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Mode</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Outcome</TableCell>
                    <TableCell>Effectiveness</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sessions.past.map((session) => (
                    <TableRow key={session.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: '#4A90E2' }}>
                            {session.student.charAt(0)}
                          </Avatar>
                          {session.student}
                        </Box>
                      </TableCell>
                      <TableCell>{session.date}</TableCell>
                      <TableCell>{session.type}</TableCell>
                      <TableCell>
                        <Chip 
                          icon={getModeIcon(session.mode)}
                          label={session.mode}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{session.duration}</TableCell>
                      <TableCell>
                        <Chip 
                          label={session.outcome}
                          size="small"
                          sx={{ 
                            bgcolor: session.outcome === 'Resolved' || session.outcome === 'Completed' ? '#4caf50' : 
                                    session.outcome === 'Progressing' ? '#ff9800' : '#2196f3',
                            color: 'white'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Rating value={session.effectiveness} readOnly size="small" />
                          <Typography variant="caption" color="text.secondary">
                            ({session.effectiveness}/5)
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="small" 
                          variant="outlined"
                          onClick={() => handleViewDetails(session)}
                        >
                          View Notes
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        </Container>
      </Box>

      {/* Schedule Session Dialog */}
      <Dialog open={sessionDialogOpen} onClose={() => setSessionDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Add sx={{ color: '#4A90E2' }} />
            Schedule New Session
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Student</InputLabel>
                <Select label="Student" defaultValue="">
                  <MenuItem value="kamal">Kamal Perera (CS/2020/001) - High Risk</MenuItem>
                  <MenuItem value="priyanka">Priyanka Jayawardena (CS/2020/112) - High Risk</MenuItem>
                  <MenuItem value="nimali">Nimali Silva (CS/2020/045) - Medium Risk</MenuItem>
                  <MenuItem value="lahiru">Lahiru Weerasinghe (CS/2020/067) - Low Risk</MenuItem>
                  <MenuItem value="sunil">Sunil Fernando (CS/2020/089) - Medium Risk</MenuItem>
                  <MenuItem value="malini">Malini Fernando (CS/2020/156) - High Risk</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Session Type</InputLabel>
                <Select label="Session Type" defaultValue="">
                  <MenuItem value="therapy">Therapy Session</MenuItem>
                  <MenuItem value="crisis">Crisis Intervention</MenuItem>
                  <MenuItem value="assessment">Assessment</MenuItem>
                  <MenuItem value="followup">Follow-up</MenuItem>
                  <MenuItem value="initial">Initial Consultation</MenuItem>
                  <MenuItem value="group">Group Therapy</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                defaultValue={new Date().toISOString().split('T')[0]}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Time"
                type="time"
                InputLabelProps={{ shrink: true }}
                defaultValue="09:00"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Duration (minutes)"
                type="number"
                defaultValue="60"
                inputProps={{ min: 15, max: 120, step: 15 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Mode</InputLabel>
                <Select label="Mode" defaultValue="video">
                  <MenuItem value="video">Video Call</MenuItem>
                  <MenuItem value="chat">Chat</MenuItem>
                  <MenuItem value="voice">Voice Call</MenuItem>
                  <MenuItem value="in-person">In Person</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location / Meeting Link"
                placeholder="Enter room number or meeting link"
                defaultValue="https://meet.safetalk.lk/"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Session Objectives / Notes"
                multiline
                rows={3}
                placeholder="Enter session objectives, preparation notes, and topics to cover..."
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Reminder Settings</InputLabel>
                <Select label="Reminder Settings" defaultValue="both">
                  <MenuItem value="both">Email & SMS (30 min before)</MenuItem>
                  <MenuItem value="email">Email only</MenuItem>
                  <MenuItem value="sms">SMS only</MenuItem>
                  <MenuItem value="none">No reminder</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSessionDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => {
              setSessionDialogOpen(false);
              setSnackbarMessage('Session scheduled successfully');
              setSnackbarOpen(true);
            }} 
            variant="contained" 
            sx={{ bgcolor: '#4A90E2' }}
          >
            Schedule Session
          </Button>
        </DialogActions>
      </Dialog>

      {/* Session Details Dialog */}
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="md" fullWidth>
        {selectedSession && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Event sx={{ color: '#4A90E2' }} />
                Session Details - {selectedSession.student}
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Session Information
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                    <Typography><strong>Student:</strong> {selectedSession.student}</Typography>
                    <Typography><strong>ID:</strong> {selectedSession.studentId}</Typography>
                    <Typography><strong>Type:</strong> {selectedSession.type}</Typography>
                    <Typography><strong>Date:</strong> {selectedSession.date || 'Today'}</Typography>
                    <Typography><strong>Time:</strong> {selectedSession.time}</Typography>
                    <Typography><strong>Duration:</strong> {selectedSession.duration}</Typography>
                    <Typography><strong>Mode:</strong> {selectedSession.mode}</Typography>
                    <Typography><strong>Location:</strong> {selectedSession.location || selectedSession.mode}</Typography>
                    <Typography><strong>Counselor:</strong> {selectedSession.counselor}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Risk & Status
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                    <Box sx={{ mb: 2 }}>
                      <Typography><strong>Risk Level:</strong></Typography>
                      <Chip 
                        label={selectedSession.riskLevel?.toUpperCase()}
                        sx={{ 
                          bgcolor: getRiskColor(selectedSession.riskLevel),
                          color: 'white',
                          mt: 1
                        }}
                      />
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography><strong>Status:</strong></Typography>
                      <Chip 
                        icon={getStatusIcon(selectedSession.status)}
                        label={selectedSession.status}
                        sx={{ 
                          bgcolor: getStatusColor(selectedSession.status),
                          color: 'white',
                          mt: 1
                        }}
                      />
                    </Box>
                    {selectedSession.outcome && (
                      <Box>
                        <Typography><strong>Outcome:</strong></Typography>
                        <Chip 
                          label={selectedSession.outcome}
                          sx={{ 
                            bgcolor: selectedSession.outcome === 'Resolved' ? '#4caf50' : 
                                    selectedSession.outcome === 'Progressing' ? '#ff9800' : '#2196f3',
                            color: 'white',
                            mt: 1
                          }}
                        />
                      </Box>
                    )}
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Session Notes
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                    <Typography>{selectedSession.notes}</Typography>
                  </Paper>
                </Grid>
                {selectedSession.preparation && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Preparation Required
                    </Typography>
                    <Paper sx={{ p: 2, bgcolor: '#fff3e0' }}>
                      <Typography>{selectedSession.preparation}</Typography>
                    </Paper>
                  </Grid>
                )}
                {selectedSession.feedback && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Student Feedback
                    </Typography>
                    <Paper sx={{ p: 2, bgcolor: '#e8f5e8' }}>
                      <Typography>{selectedSession.feedback}</Typography>
                    </Paper>
                  </Grid>
                )}
                {selectedSession.followUp && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Follow-up Plan
                    </Typography>
                    <Paper sx={{ p: 2, bgcolor: '#e3f2fd' }}>
                      <Typography>{selectedSession.followUp}</Typography>
                    </Paper>
                  </Grid>
                )}
                {selectedSession.status === 'scheduled' && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Pre-Session Checklist
                    </Typography>
                    <Stepper activeStep={activeStep} orientation="vertical">
                      <Step>
                        <StepLabel>Review previous session notes</StepLabel>
                        <StepContent>
                          <Typography>Check last session's notes and progress.</Typography>
                          <Box sx={{ mb: 2 }}>
                            <div>
                              <Button
                                variant="contained"
                                onClick={handleStepNext}
                                sx={{ mt: 1, mr: 1, bgcolor: '#4A90E2' }}
                              >
                                Mark Complete
                              </Button>
                              <Button
                                variant="outlined"
                                onClick={handleStepBack}
                                sx={{ mt: 1, mr: 1 }}
                              >
                                Back
                              </Button>
                            </div>
                          </Box>
                        </StepContent>
                      </Step>
                      <Step>
                        <StepLabel>Prepare materials</StepLabel>
                        <StepContent>
                          <Typography>Gather worksheets, assessments, or resources needed.</Typography>
                          <Box sx={{ mb: 2 }}>
                            <div>
                              <Button
                                variant="contained"
                                onClick={handleStepNext}
                                sx={{ mt: 1, mr: 1, bgcolor: '#4A90E2' }}
                              >
                                Mark Complete
                              </Button>
                              <Button
                                variant="outlined"
                                onClick={handleStepBack}
                                sx={{ mt: 1, mr: 1 }}
                              >
                                Back
                              </Button>
                            </div>
                          </Box>
                        </StepContent>
                      </Step>
                      <Step>
                        <StepLabel>Check technology</StepLabel>
                        <StepContent>
                          <Typography>Test video, audio, or meeting links.</Typography>
                          <Box sx={{ mb: 2 }}>
                            <div>
                              <Button
                                variant="contained"
                                onClick={handleStepNext}
                                sx={{ mt: 1, mr: 1, bgcolor: '#4A90E2' }}
                              >
                                Mark Complete
                              </Button>
                              <Button
                                variant="outlined"
                                onClick={handleStepBack}
                                sx={{ mt: 1, mr: 1 }}
                              >
                                Back
                              </Button>
                            </div>
                          </Box>
                        </StepContent>
                      </Step>
                    </Stepper>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Add Session Notes"
                    multiline
                    rows={3}
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                    placeholder="Enter additional notes or observations..."
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
              {selectedSession.status === 'scheduled' && (
                <>
                  <Button 
                    variant="contained"
                    startIcon={getModeIcon(selectedSession.mode)}
                    onClick={() => handleJoinSession(selectedSession)}
                    sx={{ bgcolor: '#4A90E2' }}
                  >
                    Join Session
                  </Button>
                  <Button 
                    variant="outlined"
                    color="warning"
                    onClick={() => {
                      setDetailsDialogOpen(false);
                      handleReschedule(selectedSession);
                    }}
                  >
                    Reschedule
                  </Button>
                </>
              )}
              {selectedSession.status === 'completed' && (
                <Button 
                  variant="contained"
                  onClick={handleAddNotes}
                  sx={{ bgcolor: '#4A90E2' }}
                >
                  Save Notes
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Cancel Session Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: '#f44336' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Cancel />
            Cancel Session
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedSession && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="warning" sx={{ mb: 2 }}>
                Are you sure you want to cancel the session with {selectedSession.student} on {selectedSession.date} at {selectedSession.time}?
              </Alert>
              <Typography variant="subtitle2" gutterBottom>
                Reason for cancellation:
              </Typography>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Select reason</InputLabel>
                <Select label="Select reason" defaultValue="">
                  <MenuItem value="emergency">Emergency</MenuItem>
                  <MenuItem value="sick">Counselor sick</MenuItem>
                  <MenuItem value="student">Student requested</MenuItem>
                  <MenuItem value="conflict">Schedule conflict</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Additional notes"
                multiline
                rows={2}
                placeholder="Enter any additional information..."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>Keep Session</Button>
          <Button 
            onClick={() => {
              setCancelDialogOpen(false);
              setSnackbarMessage('Session cancelled successfully');
              setSnackbarOpen(true);
            }} 
            variant="contained" 
            color="error"
          >
            Confirm Cancellation
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </VideoBackground>
  );
};

export default SessionsView;