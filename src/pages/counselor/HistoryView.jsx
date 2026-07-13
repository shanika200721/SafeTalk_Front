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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Alert,
  Snackbar,
  Rating,
  LinearProgress,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import VideoBackground from '../../components/common/VideoBackground';
import ArrowBack from '@mui/icons-material/ArrowBack';
import PsychologyIcon from '@mui/icons-material/Psychology';
import MenuIcon from '@mui/icons-material/Menu';
import HistoryIcon from '@mui/icons-material/History';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import WarningIcon from '@mui/icons-material/Warning';
import ChatIcon from '@mui/icons-material/Chat';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DateRangeIcon from '@mui/icons-material/DateRange';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

// Tab Panel Component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`history-tabpanel-${index}`}
      aria-labelledby={`history-tab-${index}`}
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

const HistoryView = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // For student-specific history
  const { user, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Mock history data
  const sessionHistory = [
    {
      id: 1,
      student: 'Kamal Perera',
      studentId: 'CS/2020/001',
      date: '2025-03-01',
      time: '10:30 AM',
      type: 'Crisis Intervention',
      mode: 'video',
      duration: '60 min',
      outcome: 'Stabilized',
      effectiveness: 4,
      counselor: 'Dr. Perera',
      notes: 'Patient expressed suicidal thoughts. Created safety plan. Emergency contacts notified.',
      tags: ['crisis', 'high-risk'],
      followUp: '2025-03-08',
    },
    {
      id: 2,
      student: 'Nimali Silva',
      studentId: 'CS/2020/045',
      date: '2025-02-28',
      time: '2:00 PM',
      type: 'Therapy Session',
      mode: 'chat',
      duration: '45 min',
      outcome: 'Progressing',
      effectiveness: 3,
      counselor: 'Dr. Perera',
      notes: 'Discussed anxiety management techniques. Patient willing to try mindfulness exercises.',
      tags: ['anxiety', 'ongoing'],
      followUp: '2025-03-07',
    },
    {
      id: 3,
      student: 'Priyanka Jayawardena',
      studentId: 'CS/2020/112',
      date: '2025-02-27',
      time: '9:15 AM',
      type: 'Assessment',
      mode: 'in-person',
      duration: '90 min',
      outcome: 'Completed',
      effectiveness: 5,
      counselor: 'Dr. Perera',
      notes: 'Initial assessment completed. DASS-21 scores indicate severe anxiety. Referred for weekly sessions.',
      tags: ['assessment', 'new-patient'],
      followUp: '2025-03-06',
    },
    {
      id: 4,
      student: 'Sunil Fernando',
      studentId: 'CS/2020/089',
      date: '2025-02-26',
      time: '11:30 AM',
      type: 'Follow-up',
      mode: 'voice',
      duration: '30 min',
      outcome: 'Completed',
      effectiveness: 4,
      counselor: 'Dr. Perera',
      notes: 'Follow-up on medication. Patient reports improved mood. Continue current treatment.',
      tags: ['medication', 'stable'],
      followUp: '2025-03-12',
    },
    {
      id: 5,
      student: 'Lahiru Weerasinghe',
      studentId: 'CS/2020/067',
      date: '2025-02-25',
      time: '3:45 PM',
      type: 'Emergency Session',
      mode: 'call',
      duration: '20 min',
      outcome: 'Resolved',
      effectiveness: 5,
      counselor: 'Dr. Perera',
      notes: 'Patient had panic attack. Guided through breathing exercises. Situation stabilized.',
      tags: ['emergency', 'panic'],
      followUp: '2025-02-28',
    },
  ];

  // Filter history if student-specific
  const filteredHistory = id 
    ? sessionHistory.filter(s => s.studentId === id)
    : sessionHistory.filter(s => 
        s.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.type.toLowerCase().includes(searchTerm.toLowerCase())
      );

  const menuItems = [
    { text: 'Dashboard', icon: <PersonIcon />, path: '/counselor' },
    { text: 'Students', icon: <SchoolIcon />, path: '/counselor/students' },
    { text: 'Alerts', icon: <WarningIcon />, path: '/counselor/alerts' },
    { text: 'Sessions', icon: <ChatIcon />, path: '/counselor/sessions' },
    { text: 'Reports', icon: <AssessmentIcon />, path: '/counselor/reports' },
    { text: 'History', icon: <HistoryIcon />, path: '/counselor/history' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/counselor/settings' },
  ];

  const getOutcomeColor = (outcome) => {
    switch(outcome) {
      case 'Resolved':
      case 'Stabilized':
      case 'Completed':
        return '#4caf50';
      case 'Progressing':
        return '#ff9800';
      case 'Referred':
        return '#2196f3';
      default:
        return '#757575';
    }
  };

  const handleViewDetails = (session) => {
    setSelectedSession(session);
    setDetailsDialogOpen(true);
  };

  const handleExport = () => {
    setSnackbarMessage('History exported successfully');
    setSnackbarOpen(true);
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
                    Session History
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {id ? 'Viewing student history' : 'All past sessions'}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TextField
                  size="small"
                  placeholder="Search history..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ width: 250 }}
                />
                <Tooltip title="Filter">
                  <IconButton>
                    <FilterListIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Export">
                  <IconButton onClick={handleExport}>
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
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

          {/* Stats Summary */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Zoom in={true} timeout={500}>
                <Card sx={{ bgcolor: 'rgba(255,255,255,0.95)' }}>
                  <CardContent>
                    <Typography color="text.secondary">Total Sessions</Typography>
                    <Typography variant="h4">{filteredHistory.length}</Typography>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Zoom in={true} timeout={700}>
                <Card sx={{ bgcolor: 'rgba(255,255,255,0.95)' }}>
                  <CardContent>
                    <Typography color="text.secondary">Avg Effectiveness</Typography>
                    <Typography variant="h4">4.2</Typography>
                    <Rating value={4.2} precision={0.5} readOnly size="small" />
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Zoom in={true} timeout={900}>
                <Card sx={{ bgcolor: 'rgba(255,255,255,0.95)' }}>
                  <CardContent>
                    <Typography color="text.secondary">Crisis Sessions</Typography>
                    <Typography variant="h4">8</Typography>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Zoom in={true} timeout={1100}>
                <Card sx={{ bgcolor: 'rgba(255,255,255,0.95)' }}>
                  <CardContent>
                    <Typography color="text.secondary">Follow-ups</Typography>
                    <Typography variant="h4">12</Typography>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
          </Grid>

          {/* History Table */}
          <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.95)' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Student</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Mode</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Outcome</TableCell>
                    <TableCell>Effectiveness</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredHistory.map((session) => (
                    <TableRow key={session.id} hover>
                      <TableCell>{session.date}<br/>
                        <Typography variant="caption">{session.time}</Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: '#4A90E2' }}>
                            {session.student.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2">{session.student}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {session.studentId}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{session.type}</TableCell>
                      <TableCell>
                        <Chip label={session.mode} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>{session.duration}</TableCell>
                      <TableCell>
                        <Chip 
                          label={session.outcome}
                          size="small"
                          sx={{ 
                            bgcolor: getOutcomeColor(session.outcome),
                            color: 'white'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Rating value={session.effectiveness} readOnly size="small" />
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="small" 
                          variant="outlined"
                          startIcon={<VisibilityIcon />}
                          onClick={() => handleViewDetails(session)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Container>
      </Box>

      {/* Session Details Dialog */}
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="md" fullWidth>
        {selectedSession && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <HistoryIcon sx={{ color: '#4A90E2' }} />
                Session Details - {selectedSession.date}
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Student Information</Typography>
                  <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                    <Typography><strong>Name:</strong> {selectedSession.student}</Typography>
                    <Typography><strong>ID:</strong> {selectedSession.studentId}</Typography>
                    <Typography><strong>Counselor:</strong> {selectedSession.counselor}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Session Information</Typography>
                  <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                    <Typography><strong>Date:</strong> {selectedSession.date}</Typography>
                    <Typography><strong>Time:</strong> {selectedSession.time}</Typography>
                    <Typography><strong>Type:</strong> {selectedSession.type}</Typography>
                    <Typography><strong>Mode:</strong> {selectedSession.mode}</Typography>
                    <Typography><strong>Duration:</strong> {selectedSession.duration}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Session Notes</Typography>
                  <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                    <Typography>{selectedSession.notes}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Outcome</Typography>
                  <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                    <Chip 
                      label={selectedSession.outcome}
                      sx={{ bgcolor: getOutcomeColor(selectedSession.outcome), color: 'white' }}
                    />
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Follow-up</Typography>
                  <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                    <Typography>{selectedSession.followUp || 'None scheduled'}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Tags</Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {selectedSession.tags.map((tag) => (
                      <Chip key={tag} label={tag} size="small" />
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
              <Button 
                variant="contained" 
                sx={{ bgcolor: '#4A90E2' }}
                onClick={() => {
                  setDetailsDialogOpen(false);
                  navigate(`/counselor/student/${selectedSession.studentId}`);
                }}
              >
                View Student Profile
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

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

export default HistoryView;