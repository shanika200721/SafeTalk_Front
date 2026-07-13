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
  LinearProgress,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Rating,
  Tooltip,
  Zoom,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineDot,
  TimelineConnector,
  TimelineContent,
  TimelineOppositeContent,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import VideoBackground from '../../components/common/VideoBackground';
import ArrowBack from '@mui/icons-material/ArrowBack';
import Psychology from '@mui/icons-material/Psychology';
import Menu from '@mui/icons-material/Menu';
import Person from '@mui/icons-material/Person';
import School from '@mui/icons-material/School';
import Warning from '@mui/icons-material/Warning';
import Chat from '@mui/icons-material/Chat';
import Assessment from '@mui/icons-material/Assessment';
import Settings from '@mui/icons-material/Settings';
import ExitToApp from '@mui/icons-material/ExitToApp';
import Notifications from '@mui/icons-material/Notifications';
import Message from '@mui/icons-material/Message';
import Call from '@mui/icons-material/Call';
import Email from '@mui/icons-material/Email';
import VideoCall from '@mui/icons-material/VideoCall';
import History from '@mui/icons-material/History';
import TrendingUp from '@mui/icons-material/TrendingUp';
import TrendingDown from '@mui/icons-material/TrendingDown';
import TrendingFlat from '@mui/icons-material/TrendingFlat';
import Download from '@mui/icons-material/Download';
import Share from '@mui/icons-material/Share';
import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';
import Add from '@mui/icons-material/Add';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Cancel from '@mui/icons-material/Cancel';
import Schedule from '@mui/icons-material/Schedule';
import Event from '@mui/icons-material/Event';
import Flag from '@mui/icons-material/Flag';

// Tab Panel Component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`student-tabpanel-${index}`}
      aria-labelledby={`student-tab-${index}`}
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

const StudentDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);

  // Mock student data
  const student = {
    id: id,
    name: 'Kamal Perera',
    studentId: 'CS/2020/001',
    faculty: 'Engineering',
    department: 'Computer Science',
    year: 4,
    gpa: 3.2,
    email: 'kamal.p@university.lk',
    phone: '+94 77 123 4567',
    address: 'Colombo, Sri Lanka',
    dateOfBirth: '2000-05-15',
    gender: 'Male',
    
    // Mental Health Data
    riskLevel: 'high',
    riskScore: 85,
    primaryConcern: 'Suicidal Ideation',
    secondaryConcerns: ['Severe Anxiety', 'Depression', 'Academic Stress'],
    lastAssessment: '2025-02-28',
    nextAssessment: '2025-03-07',
    
    // DASS-21 Scores
    dass21: {
      depression: 28, // Severe
      anxiety: 24,    // Severe
      stress: 26,     // Severe
      overall: 'Extremely Severe'
    },
    
    // Mood Tracking
    moodHistory: [
      { date: '2025-03-01', mood: 'Anxious', score: 2 },
      { date: '2025-02-28', mood: 'Distressed', score: 1 },
      { date: '2025-02-27', mood: 'Sad', score: 2 },
      { date: '2025-02-26', mood: 'Stressed', score: 2 },
      { date: '2025-02-25', mood: 'Neutral', score: 3 },
    ],
    
    // Risk Indicators
    riskIndicators: [
      { type: 'Suicidal Thoughts', severity: 'high', date: '2025-03-01', description: 'Expressed desire to end life' },
      { type: 'Self-Harm', severity: 'high', date: '2025-02-28', description: 'Mentioned cutting behaviors' },
      { type: 'Sleep Disturbance', severity: 'medium', date: '2025-02-27', description: 'Reports insomnia for 5 days' },
      { type: 'Social Withdrawal', severity: 'medium', date: '2025-02-26', description: 'Isolating from friends' },
      { type: 'Academic Decline', severity: 'low', date: '2025-02-25', description: 'Missing classes' },
    ],
    
    // Intervention History
    interventions: [
      { date: '2025-03-01', type: 'Crisis Intervention', counselor: 'Dr. Perera', outcome: 'Stabilized', notes: 'Emergency session conducted' },
      { date: '2025-02-28', type: 'Therapy Session', counselor: 'Dr. Perera', outcome: 'Ongoing', notes: 'Discussed coping strategies' },
      { date: '2025-02-25', type: 'Assessment', counselor: 'Dr. Perera', outcome: 'Completed', notes: 'DASS-21 administered' },
      { date: '2025-02-20', type: 'Check-in', counselor: 'Dr. Perera', outcome: 'Completed', notes: 'Regular follow-up' },
    ],
    
    // Chat History
    chatHistory: [
      { date: '2025-03-01', time: '10:30 AM', message: "I don't want to live anymore", sentiment: 'negative', risk: 'high' },
      { date: '2025-03-01', time: '09:15 AM', message: "Can't sleep, thinking too much", sentiment: 'negative', risk: 'medium' },
      { date: '2025-02-28', time: '11:20 PM', message: "Everything feels hopeless", sentiment: 'negative', risk: 'high' },
      { date: '2025-02-28', time: '08:45 PM', message: "I'm so tired of everything", sentiment: 'negative', risk: 'medium' },
    ],
    
    // Voice Analysis History
    voiceHistory: [
      { date: '2025-03-01', tone: 'Distressed', pitch: 'High', pace: 'Fast', stress: 85, confidence: 0.92 },
      { date: '2025-02-28', tone: 'Anxious', pitch: 'High', pace: 'Fast', stress: 78, confidence: 0.88 },
      { date: '2025-02-27', tone: 'Sad', pitch: 'Low', pace: 'Slow', stress: 65, confidence: 0.85 },
    ],
    
    // Facial Analysis History
    facialHistory: [
      { date: '2025-03-01', emotion: 'Sad', intensity: 0.9, eyeContact: 'Poor', microexpressions: 'Distress signs' },
      { date: '2025-02-28', emotion: 'Fear', intensity: 0.85, eyeContact: 'Avoidant', microexpressions: 'Tension' },
      { date: '2025-02-27', emotion: 'Anger', intensity: 0.7, eyeContact: 'Intense', microexpressions: 'Frustration' },
    ],
    
    // Emergency Contacts
    emergencyContacts: [
      { name: 'Mrs. Perera', relation: 'Mother', phone: '+94 77 234 5678' },
      { name: 'Mr. Perera', relation: 'Father', phone: '+94 71 345 6789' },
      { name: 'Dr. Silva', relation: 'Family Doctor', phone: '+94 11 234 5678' },
    ],
    
    // Counselor Notes
    counselorNotes: [
      { date: '2025-03-01', note: 'Patient expressed suicidal ideation. Immediate intervention needed.', author: 'Dr. Perera' },
      { date: '2025-02-28', note: 'Discussed safety planning and coping mechanisms.', author: 'Dr. Perera' },
      { date: '2025-02-27', note: 'Patient shows signs of severe depression. Recommend weekly sessions.', author: 'Dr. Perera' },
    ],
  };

  const getRiskColor = (level) => {
    switch(level) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#757575';
    }
  };

  const getSentimentColor = (sentiment) => {
    switch(sentiment) {
      case 'positive': return '#4caf50';
      case 'negative': return '#f44336';
      case 'neutral': return '#ff9800';
      default: return '#757575';
    }
  };

  const menuItems = [
    { text: 'Dashboard', icon: <Person />, path: '/counselor' },
    { text: 'Students', icon: <School />, path: '/counselor/students' },
    { text: 'Alerts', icon: <Warning />, path: '/counselor/alerts' },
    { text: 'Sessions', icon: <Chat />, path: '/counselor/sessions' },
    { text: 'Reports', icon: <Assessment />, path: '/counselor/reports' },
    { text: 'Settings', icon: <Settings />, path: '/counselor/settings' },
  ];

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
                <IconButton onClick={() => navigate('/counselor/students')} sx={{ mr: 2 }}>
                  <ArrowBack />
                </IconButton>
                <IconButton onClick={() => setDrawerOpen(true)} sx={{ mr: 2 }}>
                  <Menu />
                </IconButton>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Student Profile
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {student.name} · {student.studentId}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip 
                  label={`RISK: ${student.riskLevel.toUpperCase()}`}
                  sx={{ 
                    bgcolor: getRiskColor(student.riskLevel),
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '1rem',
                    p: 1
                  }}
                />
                <Badge badgeContent={3} color="error">
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

          {/* Student Overview Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Zoom in={true} timeout={500}>
                <Card sx={{ bgcolor: 'rgba(255,255,255,0.95)' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar 
                        sx={{ 
                          width: 80, 
                          height: 80,
                          bgcolor: getRiskColor(student.riskLevel),
                          fontSize: '2rem'
                        }}
                      >
                        {student.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {student.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {student.studentId}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {student.faculty} · Year {student.year}
                        </Typography>
                        <Chip 
                          label={student.primaryConcern}
                          size="small"
                          sx={{ mt: 1, bgcolor: '#f44336', color: 'white' }}
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>

            <Grid item xs={12} md={4}>
              <Zoom in={true} timeout={700}>
                <Card sx={{ bgcolor: 'rgba(255,255,255,0.95)' }}>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Risk Score
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                        <CircularProgressWithLabel value={student.riskScore} color={getRiskColor(student.riskLevel)} />
                      </Box>
                      <Box>
                        <Typography variant="h4" sx={{ color: getRiskColor(student.riskLevel), fontWeight: 700 }}>
                          {student.riskScore}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Last updated: {student.lastAssessment}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>

            <Grid item xs={12} md={4}>
              <Zoom in={true} timeout={900}>
                <Card sx={{ bgcolor: 'rgba(255,255,255,0.95)' }}>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Quick Actions
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Button 
                        variant="contained" 
                        size="small"
                        startIcon={<Message />}
                        sx={{ bgcolor: '#4A90E2' }}
                        onClick={() => navigate(`/counselor/chat/${student.id}`)}
                      >
                        Chat
                      </Button>
                      <Button 
                        variant="contained" 
                        size="small"
                        startIcon={<Call />}
                        sx={{ bgcolor: '#50E3C2' }}
                      >
                        Call
                      </Button>
                      <Button 
                        variant="contained" 
                        size="small"
                        startIcon={<VideoCall />}
                        sx={{ bgcolor: '#4A90E2' }}
                      >
                        Video
                      </Button>
                      <Button 
                        variant="outlined" 
                        size="small"
                        startIcon={<Add />}
                        onClick={() => setNoteDialogOpen(true)}
                      >
                        Note
                      </Button>
                      <Button 
                        variant="outlined" 
                        size="small"
                        startIcon={<Schedule />}
                        onClick={() => setSessionDialogOpen(true)}
                      >
                        Session
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
          </Grid>

          {/* Tabs */}
          <Paper sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}>
            <Tabs 
              value={tabValue} 
              onChange={(e, v) => setTabValue(v)}
              variant="scrollable"
              scrollButtons="auto"
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
              <Tab label="Overview" />
              <Tab label="Assessments" />
              <Tab label="Chat History" />
              <Tab label="Voice Analysis" />
              <Tab label="Facial Analysis" />
              <Tab label="Interventions" />
              <Tab label="Risk Indicators" />
              <Tab label="Notes" />
              <Tab label="Contacts" />
            </Tabs>
          </Paper>

          {/* Overview Tab */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              {/* Personal Information */}
              <Grid item xs={12} md={6}>
                <Fade in={true} timeout={500}>
                  <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.95)' }}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Person sx={{ color: '#4A90E2' }} />
                      Personal Information
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">Full Name</Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Typography variant="body2">{student.name}</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">Student ID</Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Typography variant="body2">{student.studentId}</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">Faculty</Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Typography variant="body2">{student.faculty}</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">Department</Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Typography variant="body2">{student.department}</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">Year</Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Typography variant="body2">Year {student.year}</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">GPA</Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Typography variant="body2">{student.gpa}</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">Email</Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Typography variant="body2">{student.email}</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">Phone</Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Typography variant="body2">{student.phone}</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">DOB</Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Typography variant="body2">{student.dateOfBirth}</Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Fade>
              </Grid>

              {/* Mental Health Summary */}
              <Grid item xs={12} md={6}>
                <Fade in={true} timeout={700}>
                  <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.95)' }}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Psychology sx={{ color: '#4A90E2' }} />
                      Mental Health Summary
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Typography variant="subtitle2" gutterBottom>Primary Concern</Typography>
                    <Chip 
                      label={student.primaryConcern}
                      sx={{ mb: 2, bgcolor: '#f44336', color: 'white' }}
                    />
                    
                    <Typography variant="subtitle2" gutterBottom>Secondary Concerns</Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                      {student.secondaryConcerns.map((concern, index) => (
                        <Chip 
                          key={index}
                          label={concern}
                          size="small"
                          sx={{ bgcolor: '#ff9800', color: 'white' }}
                        />
                      ))}
                    </Box>

                    <Typography variant="subtitle2" gutterBottom>DASS-21 Scores</Typography>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography sx={{ width: 100 }}>Depression</Typography>
                        <Box sx={{ flex: 1, mx: 2 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={(student.dass21.depression / 42) * 100}
                            sx={{ 
                              height: 10, 
                              borderRadius: 5,
                              bgcolor: '#ffcdd2',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: '#f44336'
                              }
                            }}
                          />
                        </Box>
                        <Typography>{student.dass21.depression}/42</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography sx={{ width: 100 }}>Anxiety</Typography>
                        <Box sx={{ flex: 1, mx: 2 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={(student.dass21.anxiety / 42) * 100}
                            sx={{ 
                              height: 10, 
                              borderRadius: 5,
                              bgcolor: '#ffe0b2',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: '#ff9800'
                              }
                            }}
                          />
                        </Box>
                        <Typography>{student.dass21.anxiety}/42</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography sx={{ width: 100 }}>Stress</Typography>
                        <Box sx={{ flex: 1, mx: 2 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={(student.dass21.stress / 42) * 100}
                            sx={{ 
                              height: 10, 
                              borderRadius: 5,
                              bgcolor: '#c8e6c9',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: '#ff9800'
                              }
                            }}
                          />
                        </Box>
                        <Typography>{student.dass21.stress}/42</Typography>
                      </Box>
                    </Box>

                    <Typography variant="subtitle2" gutterBottom>Mood Trend (Last 5 Days)</Typography>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-between' }}>
                      {student.moodHistory.map((day, index) => (
                        <Tooltip title={`${day.date}: ${day.mood} (${day.score}/5)`} key={index}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Box sx={{ 
                              width: 40, 
                              height: 40, 
                              borderRadius: '50%',
                              bgcolor: day.score >= 4 ? '#4caf50' : day.score >= 2 ? '#ff9800' : '#f44336',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontWeight: 600
                            }}>
                              {day.score}
                            </Box>
                            <Typography variant="caption">{day.date.slice(-5)}</Typography>
                          </Box>
                        </Tooltip>
                      ))}
                    </Box>
                  </Paper>
                </Fade>
              </Grid>

              {/* Recent Risk Indicators */}
              <Grid item xs={12}>
                <Fade in={true} timeout={900}>
                  <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.95)' }}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Warning sx={{ color: '#f44336' }} />
                      Recent Risk Indicators
                    </Typography>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Severity</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Action</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {student.riskIndicators.slice(0, 3).map((indicator, index) => (
                            <TableRow key={index}>
                              <TableCell>{indicator.date}</TableCell>
                              <TableCell>{indicator.type}</TableCell>
                              <TableCell>
                                <Chip 
                                  label={indicator.severity.toUpperCase()}
                                  size="small"
                                  sx={{ 
                                    bgcolor: getRiskColor(indicator.severity),
                                    color: 'white'
                                  }}
                                />
                              </TableCell>
                              <TableCell>{indicator.description}</TableCell>
                              <TableCell>
                                <Button size="small" variant="outlined">View</Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <Box sx={{ mt: 2, textAlign: 'right' }}>
                      <Button onClick={() => setTabValue(6)}>View All Risk Indicators →</Button>
                    </Box>
                  </Paper>
                </Fade>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Assessments Tab */}
          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.95)' }}>
                  <Typography variant="h6" gutterBottom>DASS-21 Assessment History</Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Depression</TableCell>
                          <TableCell>Anxiety</TableCell>
                          <TableCell>Stress</TableCell>
                          <TableCell>Overall</TableCell>
                          <TableCell>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>2025-02-28</TableCell>
                          <TableCell>
                            <Chip label="28 (Severe)" size="small" sx={{ bgcolor: '#f44336', color: 'white' }} />
                          </TableCell>
                          <TableCell>
                            <Chip label="24 (Severe)" size="small" sx={{ bgcolor: '#f44336', color: 'white' }} />
                          </TableCell>
                          <TableCell>
                            <Chip label="26 (Severe)" size="small" sx={{ bgcolor: '#f44336', color: 'white' }} />
                          </TableCell>
                          <TableCell>
                            <Chip label="Extremely Severe" size="small" sx={{ bgcolor: '#f44336', color: 'white' }} />
                          </TableCell>
                          <TableCell>
                            <Button size="small" variant="outlined">View Details</Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>2025-02-21</TableCell>
                          <TableCell>
                            <Chip label="22 (Moderate)" size="small" sx={{ bgcolor: '#ff9800', color: 'white' }} />
                          </TableCell>
                          <TableCell>
                            <Chip label="18 (Moderate)" size="small" sx={{ bgcolor: '#ff9800', color: 'white' }} />
                          </TableCell>
                          <TableCell>
                            <Chip label="20 (Moderate)" size="small" sx={{ bgcolor: '#ff9800', color: 'white' }} />
                          </TableCell>
                          <TableCell>
                            <Chip label="Moderate" size="small" sx={{ bgcolor: '#ff9800', color: 'white' }} />
                          </TableCell>
                          <TableCell>
                            <Button size="small" variant="outlined">View Details</Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>2025-02-14</TableCell>
                          <TableCell>
                            <Chip label="15 (Mild)" size="small" sx={{ bgcolor: '#4caf50', color: 'white' }} />
                          </TableCell>
                          <TableCell>
                            <Chip label="12 (Mild)" size="small" sx={{ bgcolor: '#4caf50', color: 'white' }} />
                          </TableCell>
                          <TableCell>
                            <Chip label="14 (Mild)" size="small" sx={{ bgcolor: '#4caf50', color: 'white' }} />
                          </TableCell>
                          <TableCell>
                            <Chip label="Mild" size="small" sx={{ bgcolor: '#4caf50', color: 'white' }} />
                          </TableCell>
                          <TableCell>
                            <Button size="small" variant="outlined">View Details</Button>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.95)' }}>
                  <Typography variant="h6" gutterBottom>Assessment Schedule</Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircle sx={{ color: '#4caf50' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Last Assessment" 
                        secondary={student.lastAssessment}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Schedule sx={{ color: '#ff9800' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Next Assessment" 
                        secondary={student.nextAssessment}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Event sx={{ color: '#4A90E2' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Assessment Frequency" 
                        secondary="Weekly (High Risk Protocol)"
                      />
                    </ListItem>
                  </List>
                  <Button variant="contained" sx={{ mt: 2, bgcolor: '#4A90E2' }}>
                    Schedule New Assessment
                  </Button>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.95)' }}>
                  <Typography variant="h6" gutterBottom>Assessment Recommendations</Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <Flag sx={{ color: '#f44336' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Immediate Follow-up Required"
                        secondary="Based on severe depression scores"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Flag sx={{ color: '#ff9800' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Weekly Monitoring"
                        secondary="Track mood and anxiety levels"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Flag sx={{ color: '#4caf50' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Coping Strategies Review"
                        secondary="Evaluate effectiveness of interventions"
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Chat History Tab */}
          <TabPanel value={tabValue} index={2}>
            <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.95)' }}>
              <Typography variant="h6" gutterBottom>Chat History</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell>Message</TableCell>
                      <TableCell>Sentiment</TableCell>
                      <TableCell>Risk</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {student.chatHistory.map((chat, index) => (
                      <TableRow key={index}>
                        <TableCell>{chat.date}</TableCell>
                        <TableCell>{chat.time}</TableCell>
                        <TableCell>{chat.message}</TableCell>
                        <TableCell>
                          <Chip 
                            label={chat.sentiment}
                            size="small"
                            sx={{ 
                              bgcolor: getSentimentColor(chat.sentiment),
                              color: 'white'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={chat.risk.toUpperCase()}
                            size="small"
                            sx={{ 
                              bgcolor: getRiskColor(chat.risk),
                              color: 'white'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Button size="small" variant="outlined">View Context</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Button variant="contained" startIcon={<Download />} sx={{ bgcolor: '#4A90E2' }}>
                  Export Chat Log
                </Button>
                <Button variant="outlined" startIcon={<Share />}>
                  Share with Team
                </Button>
              </Box>
            </Paper>
          </TabPanel>

          {/* Voice Analysis Tab */}
          <TabPanel value={tabValue} index={3}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.95)' }}>
                  <Typography variant="h6" gutterBottom>Voice Analysis History</Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Tone</TableCell>
                          <TableCell>Pitch</TableCell>
                          <TableCell>Pace</TableCell>
                          <TableCell>Stress Level</TableCell>
                          <TableCell>Confidence</TableCell>
                          <TableCell>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {student.voiceHistory.map((voice, index) => (
                          <TableRow key={index}>
                            <TableCell>{voice.date}</TableCell>
                            <TableCell>{voice.tone}</TableCell>
                            <TableCell>{voice.pitch}</TableCell>
                            <TableCell>{voice.pace}</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box sx={{ width: 100, mr: 1 }}>
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={voice.stress}
                                    sx={{ 
                                      height: 8, 
                                      borderRadius: 4,
                                      bgcolor: '#ffcdd2',
                                      '& .MuiLinearProgress-bar': {
                                        bgcolor: voice.stress > 70 ? '#f44336' : voice.stress > 40 ? '#ff9800' : '#4caf50'
                                      }
                                    }}
                                  />
                                </Box>
                                <Typography>{voice.stress}%</Typography>
                              </Box>
                            </TableCell>
                            <TableCell>{(voice.confidence * 100).toFixed(0)}%</TableCell>
                            <TableCell>
                              <Button size="small" variant="outlined">Play Recording</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Facial Analysis Tab */}
          <TabPanel value={tabValue} index={4}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.95)' }}>
                  <Typography variant="h6" gutterBottom>Facial Analysis History</Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Primary Emotion</TableCell>
                          <TableCell>Intensity</TableCell>
                          <TableCell>Eye Contact</TableCell>
                          <TableCell>Micro-expressions</TableCell>
                          <TableCell>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {student.facialHistory.map((facial, index) => (
                          <TableRow key={index}>
                            <TableCell>{facial.date}</TableCell>
                            <TableCell>
                              <Chip 
                                label={facial.emotion}
                                size="small"
                                sx={{ 
                                  bgcolor: facial.emotion === 'Sad' ? '#4A90E2' : 
                                          facial.emotion === 'Fear' ? '#ff9800' : '#f44336',
                                  color: 'white'
                                }}
                              />
                            </TableCell>
                            <TableCell>{(facial.intensity * 100).toFixed(0)}%</TableCell>
                            <TableCell>{facial.eyeContact}</TableCell>
                            <TableCell>{facial.microexpressions}</TableCell>
                            <TableCell>
                              <Button size="small" variant="outlined">View Video</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Interventions Tab */}
          <TabPanel value={tabValue} index={5}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.95)' }}>
                  <Typography variant="h6" gutterBottom>Intervention History</Typography>
                  
                  {/* Timeline of Interventions */}
                  <Timeline position="alternate">
                    {student.interventions.map((intervention, index) => (
                      <TimelineItem key={index}>
                        <TimelineOppositeContent color="text.secondary">
                          {intervention.date}
                        </TimelineOppositeContent>
                        <TimelineSeparator>
                          <TimelineDot color={intervention.outcome === 'Completed' ? 'success' : 'warning'}>
                            {intervention.type === 'Crisis Intervention' ? <Warning /> : 
                             intervention.type === 'Therapy Session' ? <Chat /> : <Assessment />}
                          </TimelineDot>
                          {index < student.interventions.length - 1 && <TimelineConnector />}
                        </TimelineSeparator>
                        <TimelineContent>
                          <Paper elevation={3} sx={{ p: 2 }}>
                            <Typography variant="h6" component="span">
                              {intervention.type}
                            </Typography>
                            <Typography>Counselor: {intervention.counselor}</Typography>
                            <Typography>Outcome: {intervention.outcome}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {intervention.notes}
                            </Typography>
                          </Paper>
                        </TimelineContent>
                      </TimelineItem>
                    ))}
                  </Timeline>

                  <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    <Button 
                      variant="contained" 
                      startIcon={<Add />}
                      sx={{ bgcolor: '#4A90E2' }}
                      onClick={() => setSessionDialogOpen(true)}
                    >
                      Schedule New Intervention
                    </Button>
                    <Button variant="outlined" startIcon={<Download />}>
                      Export Intervention Log
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Risk Indicators Tab */}
          <TabPanel value={tabValue} index={6}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.95)' }}>
                  <Typography variant="h6" gutterBottom>All Risk Indicators</Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Severity</TableCell>
                          <TableCell>Description</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {student.riskIndicators.map((indicator, index) => (
                          <TableRow key={index}>
                            <TableCell>{indicator.date}</TableCell>
                            <TableCell>{indicator.type}</TableCell>
                            <TableCell>
                              <Chip 
                                label={indicator.severity.toUpperCase()}
                                size="small"
                                sx={{ 
                                  bgcolor: getRiskColor(indicator.severity),
                                  color: 'white'
                                }}
                              />
                            </TableCell>
                            <TableCell>{indicator.description}</TableCell>
                            <TableCell>
                              <Chip 
                                label={indicator.severity === 'high' ? 'Active' : 'Monitored'}
                                size="small"
                                sx={{ 
                                  bgcolor: indicator.severity === 'high' ? '#f44336' : '#ff9800',
                                  color: 'white'
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Button size="small" variant="outlined" onClick={() => setAlertDialogOpen(true)}>
                                Review
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.95)' }}>
                  <Typography variant="h6" gutterBottom>Risk Assessment Notes</Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Add risk assessment notes..."
                    variant="outlined"
                  />
                  <Button variant="contained" sx={{ mt: 2, bgcolor: '#4A90E2' }}>
                    Save Notes
                  </Button>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.95)' }}>
                  <Typography variant="h6" gutterBottom>Safety Plan</Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircle sx={{ color: '#4caf50' }} />
                      </ListItemIcon>
                      <ListItemText primary="Emergency contacts notified" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircle sx={{ color: '#4caf50' }} />
                      </ListItemIcon>
                      <ListItemText primary="Safety plan created on 2025-02-28" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Schedule sx={{ color: '#ff9800' }} />
                      </ListItemIcon>
                      <ListItemText primary="Review scheduled for 2025-03-07" />
                    </ListItem>
                  </List>
                  <Button variant="outlined" sx={{ mt: 2 }}>
                    View Full Safety Plan
                  </Button>
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Notes Tab */}
          <TabPanel value={tabValue} index={7}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.95)' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Counselor Notes</Typography>
                    <Button 
                      variant="contained" 
                      startIcon={<Add />}
                      onClick={() => setNoteDialogOpen(true)}
                      sx={{ bgcolor: '#4A90E2' }}
                    >
                      Add Note
                    </Button>
                  </Box>
                  
                  {student.counselorNotes.map((note, index) => (
                    <Card key={index} sx={{ mb: 2 }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="subtitle2" color="text.secondary">
                            {note.date} · {note.author}
                          </Typography>
                          <Box>
                            <IconButton size="small"><Edit /></IconButton>
                            <IconButton size="small"><Delete /></IconButton>
                          </Box>
                        </Box>
                        <Typography variant="body1" sx={{ mt: 1 }}>
                          {note.note}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Contacts Tab */}
          <TabPanel value={tabValue} index={8}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.95)' }}>
                  <Typography variant="h6" gutterBottom>Emergency Contacts</Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Relation</TableCell>
                          <TableCell>Phone</TableCell>
                          <TableCell>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {student.emergencyContacts.map((contact, index) => (
                          <TableRow key={index}>
                            <TableCell>{contact.name}</TableCell>
                            <TableCell>{contact.relation}</TableCell>
                            <TableCell>{contact.phone}</TableCell>
                            <TableCell>
                              <Button size="small" variant="outlined" startIcon={<Call />}>
                                Call
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.95)' }}>
                  <Typography variant="h6" gutterBottom>Healthcare Providers</Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <Person sx={{ color: '#4A90E2' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Dr. Silva" 
                        secondary="Family Doctor · +94 11 234 5678"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Person sx={{ color: '#4A90E2' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Dr. Perera" 
                        secondary="Counselor · +94 77 123 4567"
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.95)' }}>
                  <Typography variant="h6" gutterBottom>University Contacts</Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <School sx={{ color: '#4A90E2' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Student Welfare Office" 
                        secondary="+94 11 222 3333"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <School sx={{ color: '#4A90E2' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Academic Advisor" 
                        secondary="Dr. Wijesinghe · +94 77 888 9999"
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>
        </Container>
      </Box>

      {/* Add Note Dialog */}
      <Dialog open={noteDialogOpen} onClose={() => setNoteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Counselor Note</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Note"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            placeholder="Enter your clinical notes..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNoteDialogOpen(false)}>Cancel</Button>
          <Button onClick={() => setNoteDialogOpen(false)} variant="contained" sx={{ bgcolor: '#4A90E2' }}>
            Save Note
          </Button>
        </DialogActions>
      </Dialog>

      {/* Schedule Session Dialog */}
      <Dialog open={sessionDialogOpen} onClose={() => setSessionDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Schedule Session</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Session Type"
                select
                SelectProps={{ native: true }}
              >
                <option value="therapy">Therapy Session</option>
                <option value="crisis">Crisis Intervention</option>
                <option value="assessment">Assessment</option>
                <option value="followup">Follow-up</option>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Time"
                type="time"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Duration (minutes)"
                type="number"
                defaultValue="60"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                placeholder="Session objectives..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSessionDialogOpen(false)}>Cancel</Button>
          <Button onClick={() => setSessionDialogOpen(false)} variant="contained" sx={{ bgcolor: '#4A90E2' }}>
            Schedule
          </Button>
        </DialogActions>
      </Dialog>

      {/* Alert Review Dialog */}
      <Dialog open={alertDialogOpen} onClose={() => setAlertDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#f44336', color: 'white' }}>
          Review High Risk Alert
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Alert Details
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Type:</strong> Suicidal Ideation<br />
              <strong>Date:</strong> 2025-03-01<br />
              <strong>Time:</strong> 10:30 AM<br />
              <strong>Source:</strong> Chat Message
            </Typography>
            
            <Typography variant="subtitle1" gutterBottom>
              Message Content
            </Typography>
            <Paper sx={{ p: 2, bgcolor: '#ffebee', mb: 2 }}>
              <Typography>"I don't want to live anymore. Everything is hopeless."</Typography>
            </Paper>

            <Typography variant="subtitle1" gutterBottom>
              Action Required
            </Typography>
            <FormControl component="fieldset">
              <RadioGroup>
                <FormControlLabel value="immediate" control={<Radio />} label="Immediate Crisis Intervention" />
                <FormControlLabel value="contact" control={<Radio />} label="Contact Emergency Contacts" />
                <FormControlLabel value="monitor" control={<Radio />} label="Continue Monitoring" />
                <FormControlLabel value="escalate" control={<Radio />} label="Escalate to Senior Counselor" />
              </RadioGroup>
            </FormControl>

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Action Notes"
              placeholder="Document your response..."
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAlertDialogOpen(false)}>Close</Button>
          <Button onClick={() => setAlertDialogOpen(false)} variant="contained" sx={{ bgcolor: '#4A90E2' }}>
            Submit Response
          </Button>
        </DialogActions>
      </Dialog>
    </VideoBackground>
  );
};

// Circular Progress with Label Component
function CircularProgressWithLabel({ value, color }) {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress
        variant="determinate"
        value={value}
        size={80}
        thickness={4}
        sx={{ color: color }}
      />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="caption" component="div" sx={{ fontWeight: 700, fontSize: '1.2rem' }}>
          {`${value}%`}
        </Typography>
      </Box>
    </Box>
  );
}

export default StudentDetail;