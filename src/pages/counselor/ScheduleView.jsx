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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import VideoBackground from '../../components/common/VideoBackground';
import ArrowBack from '@mui/icons-material/ArrowBack';
import Psychology from '@mui/icons-material/Psychology';
import Menu from '@mui/icons-material/Menu';
import CalendarToday from '@mui/icons-material/CalendarToday';
import DateRange from '@mui/icons-material/DateRange';
import Schedule from '@mui/icons-material/Schedule';
import Add from '@mui/icons-material/Add';
import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Cancel from '@mui/icons-material/Cancel';
import Notifications from '@mui/icons-material/Notifications';
import Person from '@mui/icons-material/Person';
import School from '@mui/icons-material/School';
import Warning from '@mui/icons-material/Warning';
import Chat from '@mui/icons-material/Chat';
import Assessment from '@mui/icons-material/Assessment';
import Settings from '@mui/icons-material/Settings';
import ExitToApp from '@mui/icons-material/ExitToApp';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import Today from '@mui/icons-material/Today';

// Tab Panel Component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`schedule-tabpanel-${index}`}
      aria-labelledby={`schedule-tab-${index}`}
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

const ScheduleView = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Mock schedule data
  const schedule = {
    '2025-03-01': [
      {
        id: 1,
        time: '09:00',
        student: 'Kamal Perera',
        studentId: 'CS/2020/001',
        type: 'Crisis Intervention',
        duration: '60 min',
        mode: 'video',
        status: 'scheduled',
        notes: 'Follow-up on suicidal ideation',
      },
      {
        id: 2,
        time: '10:30',
        student: 'Nimali Silva',
        studentId: 'CS/2020/045',
        type: 'Therapy Session',
        duration: '45 min',
        mode: 'chat',
        status: 'scheduled',
        notes: 'Anxiety management',
      },
      {
        id: 3,
        time: '14:00',
        student: 'Priyanka Jayawardena',
        studentId: 'CS/2020/112',
        type: 'Assessment',
        duration: '90 min',
        mode: 'in-person',
        status: 'scheduled',
        notes: 'Initial assessment',
      },
    ],
    '2025-03-02': [
      {
        id: 4,
        time: '11:00',
        student: 'Sunil Fernando',
        studentId: 'CS/2020/089',
        type: 'Follow-up',
        duration: '30 min',
        mode: 'voice',
        status: 'scheduled',
        notes: 'Check progress',
      },
    ],
  };

  const menuItems = [
    { text: 'Dashboard', icon: <Person />, path: '/counselor' },
    { text: 'Students', icon: <School />, path: '/counselor/students' },
    { text: 'Alerts', icon: <Warning />, path: '/counselor/alerts' },
    { text: 'Sessions', icon: <Chat />, path: '/counselor/sessions' },
    { text: 'Reports', icon: <Assessment />, path: '/counselor/reports' },
    { text: 'Schedule', icon: <CalendarToday />, path: '/counselor/schedule' },
    { text: 'Settings', icon: <Settings />, path: '/counselor/settings' },
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'scheduled': return '#2196f3';
      case 'completed': return '#4caf50';
      case 'cancelled': return '#f44336';
      default: return '#757575';
    }
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
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
                    Schedule Management
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Manage your counseling sessions
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button 
                  variant="contained" 
                  startIcon={<Add />}
                  onClick={() => setScheduleDialogOpen(true)}
                  sx={{ bgcolor: '#4A90E2' }}
                >
                  New Session
                </Button>
                <Badge badgeContent={3} color="primary">
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

          {/* Date Navigation */}
          <Paper sx={{ p: 2, mb: 3, bgcolor: 'rgba(255,255,255,0.95)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton onClick={() => setSelectedDate(addDays(selectedDate, -1))}>
                  <ChevronLeft />
                </IconButton>
                <Button 
                  variant="outlined" 
                  startIcon={<Today />}
                  onClick={() => setSelectedDate(new Date())}
                >
                  Today
                </Button>
                <IconButton onClick={() => setSelectedDate(addDays(selectedDate, 1))}>
                  <ChevronRight />
                </IconButton>
              </Box>
              <Typography variant="h6">
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button startIcon={<DateRange />} variant="outlined">Week</Button>
                <Button startIcon={<CalendarToday />} variant="outlined">Month</Button>
              </Box>
            </Box>
          </Paper>

          {/* Schedule Grid */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.95)' }}>
                <Typography variant="h6" gutterBottom>
                  Sessions for {selectedDate.toLocaleDateString()}
                </Typography>
                
                {schedule[formatDate(selectedDate)] ? (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Time</TableCell>
                          <TableCell>Student</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Mode</TableCell>
                          <TableCell>Duration</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {schedule[formatDate(selectedDate)].map((session) => (
                          <TableRow key={session.id} hover>
                            <TableCell>{session.time}</TableCell>
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
                                label={session.status}
                                size="small"
                                sx={{ bgcolor: getStatusColor(session.status), color: 'white' }}
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Tooltip title="Edit">
                                  <IconButton size="small">
                                    <Edit />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Cancel">
                                  <IconButton size="small" color="error">
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
                ) : (
                  <Alert severity="info">
                    No sessions scheduled for this day.
                  </Alert>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.95)' }}>
                <Typography variant="h6" gutterBottom>
                  Upcoming This Week
                </Typography>
                <List>
                  {Object.entries(schedule).map(([date, sessions]) => (
                    <React.Fragment key={date}>
                      <Typography variant="subtitle2" sx={{ mt: 2, color: '#4A90E2' }}>
                        {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                      </Typography>
                      {sessions.map((session) => (
                        <ListItem key={session.id} sx={{ pl: 0 }}>
                          <ListItemIcon>
                            <Schedule sx={{ color: getStatusColor(session.status) }} />
                          </ListItemIcon>
                          <ListItemText 
                            primary={session.student}
                            secondary={`${session.time} - ${session.type}`}
                          />
                        </ListItem>
                      ))}
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Schedule Session Dialog */}
      <Dialog open={scheduleDialogOpen} onClose={() => setScheduleDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Schedule New Session</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Student</InputLabel>
                <Select label="Student">
                  <MenuItem value="kamal">Kamal Perera (CS/2020/001)</MenuItem>
                  <MenuItem value="nimali">Nimali Silva (CS/2020/045)</MenuItem>
                  <MenuItem value="priyanka">Priyanka Jayawardena (CS/2020/112)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Session Type</InputLabel>
                <Select label="Session Type">
                  <MenuItem value="therapy">Therapy Session</MenuItem>
                  <MenuItem value="crisis">Crisis Intervention</MenuItem>
                  <MenuItem value="assessment">Assessment</MenuItem>
                  <MenuItem value="followup">Follow-up</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                defaultValue={formatDate(new Date())}
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
                label="Notes"
                multiline
                rows={3}
                placeholder="Session objectives and notes..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => {
              setScheduleDialogOpen(false);
              setSnackbarMessage('Session scheduled successfully');
              setSnackbarOpen(true);
            }} 
            variant="contained" 
            sx={{ bgcolor: '#4A90E2' }}
          >
            Schedule
          </Button>
        </DialogActions>
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

export default ScheduleView;