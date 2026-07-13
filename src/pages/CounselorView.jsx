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
  Badge,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  Button,
  LinearProgress,
  Tabs,
  Tab,
  Tooltip,
  Zoom,
  Fade,
  Menu as MuiMenu,
  MenuItem as MuiMenuItem,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import VideoBackground from '../components/common/VideoBackground';

// Icons
import PsychologyIcon from '@mui/icons-material/Psychology';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import WarningIcon from '@mui/icons-material/Warning';
import ChatIcon from '@mui/icons-material/Chat';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SearchIcon from '@mui/icons-material/Search';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import MessageIcon from '@mui/icons-material/Message';
import CallIcon from '@mui/icons-material/Call';
import EmailIcon from '@mui/icons-material/Email';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import HistoryIcon from '@mui/icons-material/History';
import BarChartIcon from '@mui/icons-material/BarChart';
import ScheduleIcon from '@mui/icons-material/Schedule';
import FlagIcon from '@mui/icons-material/Flag';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Tab Panel Component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`counselor-tabpanel-${index}`}
      aria-labelledby={`counselor-tab-${index}`}
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

const CounselorView = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Mock data for students
  const students = [
    { 
      id: 1, 
      name: 'Kamal Perera', 
      studentId: 'CS/2020/001',
      riskLevel: 'high', 
      lastActive: '5 mins ago',
      mood: 'Anxious',
      messages: 12,
      alerts: 3,
      trend: 'up',
      faculty: 'Engineering',
      year: 4,
      lastSession: '2025-03-01',
      nextSession: '2025-03-08',
    },
    { 
      id: 2, 
      name: 'Nimali Silva', 
      studentId: 'CS/2020/045',
      riskLevel: 'medium', 
      lastActive: '2 hours ago',
      mood: 'Stressed',
      messages: 5,
      alerts: 1,
      trend: 'flat',
      faculty: 'Medicine',
      year: 3,
      lastSession: '2025-02-28',
      nextSession: '2025-03-07',
    },
    { 
      id: 3, 
      name: 'Sunil Fernando', 
      studentId: 'CS/2020/089',
      riskLevel: 'low', 
      lastActive: '1 day ago',
      mood: 'Stable',
      messages: 2,
      alerts: 0,
      trend: 'down',
      faculty: 'Arts',
      year: 2,
      lastSession: '2025-02-25',
      nextSession: '2025-03-05',
    },
    { 
      id: 4, 
      name: 'Priyanka Jayawardena', 
      studentId: 'CS/2020/112',
      riskLevel: 'high', 
      lastActive: '10 mins ago',
      mood: 'Distressed',
      messages: 8,
      alerts: 2,
      trend: 'up',
      faculty: 'Engineering',
      year: 4,
      lastSession: '2025-03-01',
      nextSession: '2025-03-08',
    },
    { 
      id: 5, 
      name: 'Lahiru Weerasinghe', 
      studentId: 'CS/2020/067',
      riskLevel: 'medium', 
      lastActive: '3 hours ago',
      mood: 'Worried',
      messages: 3,
      alerts: 1,
      trend: 'flat',
      faculty: 'Business',
      year: 3,
      lastSession: '2025-02-27',
      nextSession: '2025-03-06',
    },
  ];

  // Mock data for alerts
  const alerts = [
    { 
      id: 1, 
      student: 'Kamal Perera',
      studentId: 'CS/2020/001',
      type: 'Suicidal Ideation',
      severity: 'critical',
      time: '5 mins ago',
      description: 'Expressed thoughts of self-harm in chat'
    },
    { 
      id: 2, 
      student: 'Priyanka Jayawardena',
      studentId: 'CS/2020/112',
      type: 'Severe Anxiety',
      severity: 'high',
      time: '10 mins ago',
      description: 'Panic attack detected through voice analysis'
    },
    { 
      id: 3, 
      student: 'Nimali Silva',
      studentId: 'CS/2020/045',
      type: 'Depression Indicators',
      severity: 'medium',
      time: '2 hours ago',
      description: 'DASS-21 score indicates severe depression'
    },
  ];

  // Mock data for recent sessions
  const recentSessions = [
    { id: 1, student: 'Kamal Perera', type: 'Chat', duration: '15 mins', time: '10:30 AM', summary: 'Discussed exam anxiety' },
    { id: 2, student: 'Nimali Silva', type: 'Voice Call', duration: '25 mins', time: '9:15 AM', summary: 'Coping strategies for stress' },
    { id: 3, student: 'Sunil Fernando', type: 'Video Session', duration: '30 mins', time: 'Yesterday', summary: 'Follow-up assessment' },
  ];

  const getRiskColor = (level) => {
    switch(level) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#757575';
    }
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'critical': return '#f44336';
      case 'high': return '#ff9800';
      case 'medium': return '#2196f3';
      case 'low': return '#4caf50';
      default: return '#757575';
    }
  };

  const getTrendIcon = (trend) => {
    switch(trend) {
      case 'up': return <TrendingUpIcon sx={{ color: '#f44336' }} />;
      case 'down': return <TrendingDownIcon sx={{ color: '#4caf50' }} />;
      case 'flat': return <TrendingFlatIcon sx={{ color: '#ff9800' }} />;
      default: return null;
    }
  };

  const handleStudentMenuClick = (event, student) => {
    setAnchorEl(event.currentTarget);
    setSelectedStudent(student);
  };

  const handleStudentMenuClose = () => {
    setAnchorEl(null);
    setSelectedStudent(null);
  };

  const handleNavigateToStudent = (path) => {
    if (selectedStudent) {
      navigate(`/counselor/student/${selectedStudent.studentId}${path}`);
    }
    handleStudentMenuClose();
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, tab: 0, path: '/counselor' },
    { text: 'Students', icon: <PeopleIcon />, tab: 1, path: '/counselor/students' },
    { text: 'Alerts', icon: <WarningIcon />, tab: 2, path: '/counselor/alerts', badge: alerts.length },
    { text: 'Sessions', icon: <ChatIcon />, tab: 3, path: '/counselor/sessions' },
    { text: 'Reports', icon: <AssessmentIcon />, tab: 4, path: '/counselor/reports' },
    { text: 'Schedule', icon: <CalendarTodayIcon />, tab: 5, path: '/counselor/schedule' },
    { text: 'History', icon: <HistoryIcon />, tab: 6, path: '/counselor/history' },
    { text: 'Analytics', icon: <BarChartIcon />, tab: 7, path: '/counselor/analytics' },
    { text: 'Settings', icon: <SettingsIcon />, tab: 8, path: '/counselor/settings' },
  ];

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                {user?.specialization || 'Clinical Psychologist'}
              </Typography>
              <Chip 
                label="Counselor"
                size="small"
                sx={{ mt: 1, bgcolor: '#4A90E2', color: 'white' }}
              />
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
                  bgcolor: tabValue === item.tab ? 'rgba(74, 144, 226, 0.1)' : 'transparent',
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(74, 144, 226, 0.1) 0%, rgba(80, 227, 194, 0.1) 100%)',
                  }
                }}
              >
                <ListItemIcon sx={{ color: '#4A90E2' }}>
                  {item.badge ? (
                    <Badge badgeContent={item.badge} color="error">
                      {item.icon}
                    </Badge>
                  ) : item.icon}
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
                <IconButton onClick={() => setDrawerOpen(true)} sx={{ mr: 2 }}>
                  <MenuIcon />
                </IconButton>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Counselor Dashboard
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Welcome back, {user?.name}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TextField
                  size="small"
                  placeholder="Search students..."
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
                <Badge badgeContent={alerts.length} color="error">
                  <IconButton onClick={() => navigate('/counselor/alerts')}>
                    <NotificationsIcon />
                  </IconButton>
                </Badge>
                <Avatar 
                  sx={{ 
                    bgcolor: 'linear-gradient(135deg, #4A90E2, #50E3C2)',
                    cursor: 'pointer'
                  }}
                  onClick={() => navigate('/counselor/settings')}
                >
                  {user?.name?.charAt(0)}
                </Avatar>
              </Box>
            </Paper>
          </Fade>

          {/* Quick Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Zoom in={true} timeout={500}>
                <Card 
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.95)',
                    cursor: 'pointer',
                    '&:hover': { transform: 'scale(1.02)' }
                  }}
                  onClick={() => navigate('/counselor/students')}
                >
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Total Students
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: '#4A90E2' }}>
                      156
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      +12 this month
                    </Typography>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Zoom in={true} timeout={700}>
                <Card 
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.95)',
                    cursor: 'pointer',
                    '&:hover': { transform: 'scale(1.02)' }
                  }}
                  onClick={() => navigate('/counselor/alerts')}
                >
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      High Risk
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: '#f44336' }}>
                      8
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      +3 this week
                    </Typography>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Zoom in={true} timeout={900}>
                <Card 
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.95)',
                    cursor: 'pointer',
                    '&:hover': { transform: 'scale(1.02)' }
                  }}
                  onClick={() => navigate('/counselor/sessions')}
                >
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Today's Sessions
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: '#ff9800' }}>
                      12
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      4 upcoming
                    </Typography>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Zoom in={true} timeout={1100}>
                <Card 
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.95)',
                    cursor: 'pointer',
                    '&:hover': { transform: 'scale(1.02)' }
                  }}
                  onClick={() => navigate('/counselor/analytics')}
                >
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Effectiveness
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: '#50E3C2' }}>
                      94%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      +5% this month
                    </Typography>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
          </Grid>

          {/* Quick Actions */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.95)', display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button 
                  variant="contained" 
                  startIcon={<ChatIcon />}
                  onClick={() => navigate('/counselor/sessions')}
                  sx={{ bgcolor: '#4A90E2' }}
                >
                  New Session
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<ScheduleIcon />}
                  onClick={() => navigate('/counselor/schedule')}
                >
                  View Schedule
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<AssessmentIcon />}
                  onClick={() => navigate('/counselor/reports')}
                >
                  Generate Report
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<HistoryIcon />}
                  onClick={() => navigate('/counselor/history')}
                >
                  Session History
                </Button>
              </Paper>
            </Grid>
          </Grid>

          {/* Main Dashboard Content */}
          <Grid container spacing={3}>
            {/* Critical Alerts Section */}
            <Grid item xs={12} md={6}>
              <Fade in={true} timeout={1500}>
                <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.95)' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WarningIcon sx={{ color: '#f44336' }} />
                      Critical Alerts
                    </Typography>
                    <Button size="small" onClick={() => navigate('/counselor/alerts')}>
                      View All
                    </Button>
                  </Box>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Student</TableCell>
                          <TableCell>Alert Type</TableCell>
                          <TableCell>Severity</TableCell>
                          <TableCell>Time</TableCell>
                          <TableCell>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {alerts.filter(a => a.severity === 'critical' || a.severity === 'high').map((alert) => (
                          <TableRow key={alert.id} hover>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar sx={{ width: 32, height: 32, bgcolor: getSeverityColor(alert.severity) }}>
                                  {alert.student.charAt(0)}
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {alert.student}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {alert.studentId}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>{alert.type}</TableCell>
                            <TableCell>
                              <Chip 
                                label={alert.severity.toUpperCase()}
                                size="small"
                                sx={{ 
                                  bgcolor: getSeverityColor(alert.severity),
                                  color: 'white',
                                  fontWeight: 600
                                }}
                              />
                            </TableCell>
                            <TableCell>{alert.time}</TableCell>
                            <TableCell>
                              <Button 
                                size="small" 
                                variant="contained"
                                sx={{ bgcolor: '#4A90E2' }}
                                onClick={() => navigate(`/counselor/student/${alert.studentId}`)}
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
              </Fade>
            </Grid>

            {/* Today's Schedule */}
            <Grid item xs={12} md={6}>
              <Fade in={true} timeout={1700}>
                <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.95)' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ScheduleIcon sx={{ color: '#4A90E2' }} />
                      Today's Schedule
                    </Typography>
                    <Button size="small" onClick={() => navigate('/counselor/schedule')}>
                      View Full Schedule
                    </Button>
                  </Box>
                  <List>
                    {recentSessions.map((session) => (
                      <ListItem 
                        key={session.id}
                        secondaryAction={
                          <Button 
                            size="small" 
                            variant="outlined"
                            onClick={() => navigate('/counselor/sessions')}
                          >
                            Join
                          </Button>
                        }
                        sx={{ borderRadius: 2, mb: 1, bgcolor: '#f5f5f5' }}
                      >
                        <ListItemIcon>
                          {session.type === 'Chat' ? <MessageIcon /> : session.type === 'Voice Call' ? <CallIcon /> : <EmailIcon />}
                        </ListItemIcon>
                        <ListItemText 
                          primary={session.student}
                          secondary={`${session.type} · ${session.time}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Fade>
            </Grid>

            {/* Student List Preview */}
            <Grid item xs={12}>
              <Fade in={true} timeout={1900}>
                <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.95)' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PeopleIcon sx={{ color: '#4A90E2' }} />
                      Student List
                    </Typography>
                    <Button size="small" onClick={() => navigate('/counselor/students')}>
                      View All Students
                    </Button>
                  </Box>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Student</TableCell>
                          <TableCell>ID</TableCell>
                          <TableCell>Risk Level</TableCell>
                          <TableCell>Mood</TableCell>
                          <TableCell>Last Active</TableCell>
                          <TableCell>Alerts</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredStudents.slice(0, 5).map((student) => (
                          <TableRow key={student.id} hover>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar sx={{ bgcolor: getRiskColor(student.riskLevel) }}>
                                  {student.name.charAt(0)}
                                </Avatar>
                                {student.name}
                              </Box>
                            </TableCell>
                            <TableCell>{student.studentId}</TableCell>
                            <TableCell>
                              <Chip 
                                label={student.riskLevel.toUpperCase()}
                                size="small"
                                sx={{ 
                                  bgcolor: getRiskColor(student.riskLevel),
                                  color: 'white',
                                  fontWeight: 600
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {student.mood}
                                {getTrendIcon(student.trend)}
                              </Box>
                            </TableCell>
                            <TableCell>{student.lastActive}</TableCell>
                            <TableCell>
                              {student.alerts > 0 ? (
                                <Badge badgeContent={student.alerts} color="error">
                                  <WarningIcon />
                                </Badge>
                              ) : student.alerts}
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Tooltip title="View Profile">
                                  <IconButton 
                                    size="small"
                                    onClick={() => navigate(`/counselor/student/${student.studentId}`)}
                                  >
                                    <MoreVertIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Chat">
                                  <IconButton 
                                    size="small"
                                   onClick={() => navigate(`/counselor/student/${student.studentId}/chat`)}
                                  >
                                    <ChatIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="More Actions">
                                  <IconButton 
                                    size="small"
                                    onClick={(e) => handleStudentMenuClick(e, student)}
                                  >
                                    <FlagIcon />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Fade>
            </Grid>

            {/* Risk Distribution */}
            <Grid item xs={12} md={6}>
              <Fade in={true} timeout={2100}>
                <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.95)' }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BarChartIcon sx={{ color: '#4A90E2' }} />
                    Risk Distribution
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Typography sx={{ width: 100 }}>High Risk</Typography>
                      <Box sx={{ flex: 1, mx: 2 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={20} 
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
                      <Typography>8 students</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Typography sx={{ width: 100 }}>Medium Risk</Typography>
                      <Box sx={{ flex: 1, mx: 2 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={35} 
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
                      <Typography>15 students</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Typography sx={{ width: 100 }}>Low Risk</Typography>
                      <Box sx={{ flex: 1, mx: 2 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={45} 
                          sx={{ 
                            height: 10, 
                            borderRadius: 5,
                            bgcolor: '#c8e6c9',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: '#4caf50'
                            }
                          }}
                        />
                      </Box>
                      <Typography>45 students</Typography>
                    </Box>
                  </Box>
                  <Button 
                    fullWidth 
                    variant="outlined" 
                    sx={{ mt: 2 }}
                    onClick={() => navigate('/counselor/analytics')}
                  >
                    View Detailed Analytics
                  </Button>
                </Paper>
              </Fade>
            </Grid>

            {/* Recent Activity */}
            <Grid item xs={12} md={6}>
              <Fade in={true} timeout={2300}>
                <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.95)' }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <HistoryIcon sx={{ color: '#4A90E2' }} />
                    Recent Activity
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon sx={{ color: '#4caf50' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Session completed with Kamal Perera"
                        secondary="10 minutes ago"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <WarningIcon sx={{ color: '#f44336' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="New alert from Priyanka Jayawardena"
                        secondary="25 minutes ago"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <ScheduleIcon sx={{ color: '#ff9800' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Session scheduled with Nimali Silva"
                        secondary="1 hour ago"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <MessageIcon sx={{ color: '#4A90E2' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Chat message from Sunil Fernando"
                        secondary="2 hours ago"
                      />
                    </ListItem>
                  </List>
                  <Button 
                    fullWidth 
                    variant="outlined" 
                    sx={{ mt: 2 }}
                    onClick={() => navigate('/counselor/history')}
                  >
                    View All Activity
                  </Button>
                </Paper>
              </Fade>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Student Actions Menu */}
      <MuiMenu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleStudentMenuClose}
      >
        <MuiMenuItem onClick={() => handleNavigateToStudent('')}>
          <ListItemIcon>
            <PeopleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Profile</ListItemText>
        </MuiMenuItem>
        <MuiMenuItem onClick={() => handleNavigateToStudent('/assessments')}>
          <ListItemIcon>
            <AssessmentIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Assessments</ListItemText>
        </MuiMenuItem>
        <MuiMenuItem onClick={() => handleNavigateToStudent('/chat')}>
          <ListItemIcon>
            <ChatIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Start Chat</ListItemText>
        </MuiMenuItem>
        <MuiMenuItem onClick={() => handleNavigateToStudent('/history')}>
          <ListItemIcon>
            <HistoryIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Session History</ListItemText>
        </MuiMenuItem>
        <MuiMenuItem onClick={() => handleNavigateToStudent('/reports')}>
          <ListItemIcon>
            <BarChartIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Generate Report</ListItemText>
        </MuiMenuItem>
        <Divider />
        <MuiMenuItem onClick={() => handleNavigateToStudent('/schedule')}>
          <ListItemIcon>
            <ScheduleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Schedule Session</ListItemText>
        </MuiMenuItem>
        <MuiMenuItem onClick={() => handleNavigateToStudent('/emergency')}>
          <ListItemIcon>
            <WarningIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: '#f44336' }}>Emergency Action</ListItemText>
        </MuiMenuItem>
      </MuiMenu>
    </VideoBackground>
  );
};

export default CounselorView;