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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  FormControlLabel,
  Radio,
  RadioGroup,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import VideoBackground from '../../components/common/VideoBackground';
import ArrowBack from '@mui/icons-material/ArrowBack';
import Psychology from '@mui/icons-material/Psychology';
import Menu from '@mui/icons-material/Menu';
import Warning from '@mui/icons-material/Warning';
import Error from '@mui/icons-material/Error';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Schedule from '@mui/icons-material/Schedule';
import Search from '@mui/icons-material/Search';
import FilterList from '@mui/icons-material/FilterList';
import Refresh from '@mui/icons-material/Refresh';
import Download from '@mui/icons-material/Download';
import Notifications from '@mui/icons-material/Notifications';
import Person from '@mui/icons-material/Person';
import Chat from '@mui/icons-material/Chat';
import Call from '@mui/icons-material/Call';
import Email from '@mui/icons-material/Email';
import MoreVert from '@mui/icons-material/MoreVert';

// Tab Panel Component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`alerts-tabpanel-${index}`}
      aria-labelledby={`alerts-tab-${index}`}
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

const AlertsView = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterType, setFilterType] = useState('all');

  // Mock alerts data
  const alerts = [
    {
      id: 1,
      student: 'Kamal Perera',
      studentId: 'CS/2020/001',
      type: 'Suicidal Ideation',
      severity: 'critical',
      timestamp: '2025-03-01T10:30:00',
      time: '5 mins ago',
      description: 'Expressed thoughts of self-harm in chat: "I don\'t want to live anymore"',
      source: 'Chat Message',
      status: 'pending',
      assignedTo: 'Dr. Perera',
      previousAlerts: 3,
      riskScore: 95,
      interventions: 2,
    },
    {
      id: 2,
      student: 'Priyanka Jayawardena',
      studentId: 'CS/2020/112',
      type: 'Severe Anxiety',
      severity: 'high',
      timestamp: '2025-03-01T09:15:00',
      time: '10 mins ago',
      description: 'Panic attack detected through voice analysis. Heart rate elevated, rapid breathing.',
      source: 'Voice Analysis',
      status: 'acknowledged',
      assignedTo: 'Dr. Perera',
      previousAlerts: 5,
      riskScore: 85,
      interventions: 3,
    },
    {
      id: 3,
      student: 'Nimali Silva',
      studentId: 'CS/2020/045',
      type: 'Depression Indicators',
      severity: 'medium',
      timestamp: '2025-03-01T08:00:00',
      time: '2 hours ago',
      description: 'DASS-21 score indicates severe depression (28/42). Multiple negative sentiment messages.',
      source: 'DASS-21 Assessment',
      status: 'resolved',
      assignedTo: 'Dr. Perera',
      previousAlerts: 2,
      riskScore: 65,
      interventions: 1,
    },
    {
      id: 4,
      student: 'Lahiru Weerasinghe',
      studentId: 'CS/2020/067',
      type: 'Academic Stress',
      severity: 'low',
      timestamp: '2025-03-01T07:30:00',
      time: '3 hours ago',
      description: 'Missed daily check-ins for 3 consecutive days. Academic performance declining.',
      source: 'System',
      status: 'pending',
      assignedTo: 'Unassigned',
      previousAlerts: 1,
      riskScore: 35,
      interventions: 0,
    },
    {
      id: 5,
      student: 'Sunil Fernando',
      studentId: 'CS/2020/089',
      type: 'Social Withdrawal',
      severity: 'medium',
      timestamp: '2025-02-28T23:00:00',
      time: '12 hours ago',
      description: 'Isolating from peers. Not responding to messages. Reduced social interaction.',
      source: 'Behavioral Analysis',
      status: 'in-progress',
      assignedTo: 'Dr. Perera',
      previousAlerts: 2,
      riskScore: 55,
      interventions: 1,
    },
    {
      id: 6,
      student: 'Malini Fernando',
      studentId: 'CS/2020/156',
      type: 'Self-Harm Indicators',
      severity: 'critical',
      timestamp: '2025-02-28T22:00:00',
      time: '14 hours ago',
      description: 'Mentioned cutting behaviors in private journal. Expressed desire to hurt self.',
      source: 'Journal Entry',
      status: 'pending',
      assignedTo: 'Unassigned',
      previousAlerts: 0,
      riskScore: 92,
      interventions: 0,
    },
  ];

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'critical': return '#f44336';
      case 'high': return '#ff9800';
      case 'medium': return '#2196f3';
      case 'low': return '#4caf50';
      default: return '#757575';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#f44336';
      case 'acknowledged': return '#ff9800';
      case 'in-progress': return '#2196f3';
      case 'resolved': return '#4caf50';
      default: return '#757575';
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffMs = now - alertTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeverity = filterSeverity === 'all' || alert.severity === filterSeverity;
    const matchesType = filterType === 'all' || alert.type === filterType;

    return matchesSearch && matchesSeverity && matchesType;
  });

  const criticalAlerts = filteredAlerts.filter(a => a.severity === 'critical');
  const pendingAlerts = filteredAlerts.filter(a => a.status === 'pending');
  const resolvedAlerts = filteredAlerts.filter(a => a.status === 'resolved');

  const menuItems = [
    { text: 'Dashboard', icon: <Person />, path: '/counselor' },
    { text: 'Students', icon: <Person />, path: '/counselor/students' },
    { text: 'Alerts', icon: <Warning />, path: '/counselor/alerts', badge: pendingAlerts.length },
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
                    Alert Management
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Monitor and respond to student alerts
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TextField
                  size="small"
                  placeholder="Search alerts..."
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
                <Tooltip title="Filter">
                  <IconButton onClick={() => setFilterDialogOpen(true)}>
                    <FilterList />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Refresh">
                  <IconButton>
                    <Refresh />
                  </IconButton>
                </Tooltip>
                <Badge badgeContent={pendingAlerts.length} color="error">
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
                    <Typography color="text.secondary" gutterBottom>
                      Total Alerts
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: '#4A90E2' }}>
                      {alerts.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Last 24 hours
                    </Typography>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Zoom in={true} timeout={700}>
                <Card sx={{ bgcolor: 'rgba(255,255,255,0.95)' }}>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Critical
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: '#f44336' }}>
                      {criticalAlerts.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Require immediate action
                    </Typography>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Zoom in={true} timeout={900}>
                <Card sx={{ bgcolor: 'rgba(255,255,255,0.95)' }}>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Pending
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: '#ff9800' }}>
                      {pendingAlerts.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Awaiting response
                    </Typography>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Zoom in={true} timeout={1100}>
                <Card sx={{ bgcolor: 'rgba(255,255,255,0.95)' }}>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Resolved
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: '#4caf50' }}>
                      {resolvedAlerts.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Actions completed
                    </Typography>
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
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Warning /> All Alerts
                  </Box>
                } 
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Error sx={{ color: '#f44336' }} /> Critical
                    {criticalAlerts.length > 0 && (
                      <Chip size="small" label={criticalAlerts.length} sx={{ bgcolor: '#f44336', color: 'white' }} />
                    )}
                  </Box>
                } 
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Schedule sx={{ color: '#ff9800' }} /> Pending
                    {pendingAlerts.length > 0 && (
                      <Chip size="small" label={pendingAlerts.length} sx={{ bgcolor: '#ff9800', color: 'white' }} />
                    )}
                  </Box>
                } 
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle sx={{ color: '#4caf50' }} /> Resolved
                  </Box>
                } 
              />
            </Tabs>
          </Paper>

          {/* All Alerts Tab */}
          <TabPanel value={tabValue} index={0}>
            <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.95)' }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Student</TableCell>
                      <TableCell>Alert Type</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Severity</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Assigned To</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredAlerts.map((alert) => (
                      <TableRow key={alert.id} sx={{ 
                        bgcolor: alert.severity === 'critical' ? 'rgba(244, 67, 54, 0.05)' : 'inherit',
                        '&:hover': {
                          bgcolor: 'rgba(74, 144, 226, 0.05)',
                        }
                      }}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ bgcolor: getSeverityColor(alert.severity) }}>
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
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {alert.type}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {alert.source}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Tooltip title={alert.description}>
                            <Typography variant="body2" sx={{ 
                              maxWidth: 200,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {alert.description}
                            </Typography>
                          </Tooltip>
                        </TableCell>
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
                        <TableCell>
                          <Tooltip title={new Date(alert.timestamp).toLocaleString()}>
                            <Typography variant="body2">
                              {alert.time}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={alert.status.toUpperCase()}
                            size="small"
                            sx={{ 
                              bgcolor: getStatusColor(alert.status),
                              color: 'white'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {alert.assignedTo}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="View Details">
                              <IconButton 
                                size="small"
                                onClick={() => {
                                  setSelectedAlert(alert);
                                  setAlertDialogOpen(true);
                                }}
                              >
                                <MoreVert />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Chat with Student">
                              <IconButton 
                                size="small"
                                onClick={() => navigate(`/counselor/chat/${alert.studentId}`)}
                              >
                                <Chat />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Call Student">
                              <IconButton size="small">
                                <Call />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Showing {filteredAlerts.length} of {alerts.length} alerts
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button startIcon={<Download />} variant="outlined">
                    Export
                  </Button>
                  <Button variant="contained" sx={{ bgcolor: '#4A90E2' }}>
                    Refresh
                  </Button>
                </Box>
              </Box>
            </Paper>
          </TabPanel>

          {/* Critical Alerts Tab */}
          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={3}>
              {criticalAlerts.map((alert) => (
                <Grid item xs={12} md={6} key={alert.id}>
                  <Fade in={true} timeout={500}>
                    <Card sx={{ 
                      bgcolor: 'rgba(255,255,255,0.95)',
                      borderLeft: `6px solid ${getSeverityColor(alert.severity)}`,
                      '&:hover': {
                        transform: 'scale(1.02)',
                        boxShadow: '0 10px 30px rgba(244, 67, 54, 0.2)',
                      },
                      transition: 'all 0.3s ease'
                    }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ bgcolor: getSeverityColor(alert.severity) }}>
                              {alert.student.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="h6">{alert.student}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {alert.studentId}
                              </Typography>
                            </Box>
                          </Box>
                          <Chip 
                            label="CRITICAL"
                            sx={{ bgcolor: '#f44336', color: 'white', fontWeight: 700 }}
                          />
                        </Box>

                        <Alert severity="error" sx={{ mb: 2 }}>
                          <Typography variant="subtitle2">{alert.type}</Typography>
                          <Typography variant="body2">{alert.description}</Typography>
                        </Alert>

                        <Grid container spacing={2} sx={{ mb: 2 }}>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">
                              Risk Score
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ flex: 1 }}>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={alert.riskScore}
                                  sx={{ 
                                    height: 8, 
                                    borderRadius: 4,
                                    bgcolor: '#ffcdd2',
                                    '& .MuiLinearProgress-bar': {
                                      bgcolor: '#f44336'
                                    }
                                  }}
                                />
                              </Box>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {alert.riskScore}%
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">
                              Previous Alerts
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {alert.previousAlerts} in last 30 days
                            </Typography>
                          </Grid>
                        </Grid>

                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <Button 
                            variant="contained" 
                            color="error"
                            onClick={() => {
                              setSelectedAlert(alert);
                              setAlertDialogOpen(true);
                            }}
                          >
                            Respond Now
                          </Button>
                          <Button 
                            variant="outlined"
                            onClick={() => navigate(`/counselor/student/${alert.studentId}`)}
                          >
                            View Profile
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Fade>
                </Grid>
              ))}
            </Grid>
          </TabPanel>

          {/* Pending Alerts Tab */}
          <TabPanel value={tabValue} index={2}>
            <TableContainer component={Paper} sx={{ bgcolor: 'rgba(255,255,255,0.95)' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student</TableCell>
                    <TableCell>Alert Type</TableCell>
                    <TableCell>Severity</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Wait Time</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingAlerts.map((alert) => {
                    const waitTime = Math.floor((new Date() - new Date(alert.timestamp)) / 60000);
                    return (
                      <TableRow key={alert.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ bgcolor: getSeverityColor(alert.severity) }}>
                              {alert.student.charAt(0)}
                            </Avatar>
                            {alert.student}
                          </Box>
                        </TableCell>
                        <TableCell>{alert.type}</TableCell>
                        <TableCell>
                          <Chip 
                            label={alert.severity}
                            size="small"
                            sx={{ 
                              bgcolor: getSeverityColor(alert.severity),
                              color: 'white'
                            }}
                          />
                        </TableCell>
                        <TableCell>{alert.time}</TableCell>
                        <TableCell>
                          <Chip 
                            label={`${waitTime} mins`}
                            size="small"
                            sx={{ 
                              bgcolor: waitTime > 30 ? '#f44336' : waitTime > 15 ? '#ff9800' : '#4caf50',
                              color: 'white'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="contained" 
                            size="small"
                            sx={{ bgcolor: '#4A90E2' }}
                            onClick={() => {
                              setSelectedAlert(alert);
                              setAlertDialogOpen(true);
                            }}
                          >
                            Take Action
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Resolved Alerts Tab */}
          <TabPanel value={tabValue} index={3}>
            <TableContainer component={Paper} sx={{ bgcolor: 'rgba(255,255,255,0.95)' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student</TableCell>
                    <TableCell>Alert Type</TableCell>
                    <TableCell>Resolved Time</TableCell>
                    <TableCell>Response Time</TableCell>
                    <TableCell>Actions Taken</TableCell>
                    <TableCell>Outcome</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {resolvedAlerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ bgcolor: getSeverityColor(alert.severity) }}>
                            {alert.student.charAt(0)}
                          </Avatar>
                          {alert.student}
                        </Box>
                      </TableCell>
                      <TableCell>{alert.type}</TableCell>
                      <TableCell>{alert.time}</TableCell>
                      <TableCell>
                        <Chip 
                          label="15 mins"
                          size="small"
                          sx={{ bgcolor: '#4caf50', color: 'white' }}
                        />
                      </TableCell>
                      <TableCell>{alert.interventions} interventions</TableCell>
                      <TableCell>
                        <Chip 
                          label="Stable"
                          size="small"
                          sx={{ bgcolor: '#4caf50', color: 'white' }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        </Container>
      </Box>

      {/* Filter Dialog */}
      <Dialog open={filterDialogOpen} onClose={() => setFilterDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Filter Alerts</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Severity</InputLabel>
                <Select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  label="Severity"
                >
                  <MenuItem value="all">All Severities</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Alert Type</InputLabel>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  label="Alert Type"
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="Suicidal Ideation">Suicidal Ideation</MenuItem>
                  <MenuItem value="Severe Anxiety">Severe Anxiety</MenuItem>
                  <MenuItem value="Depression Indicators">Depression Indicators</MenuItem>
                  <MenuItem value="Self-Harm Indicators">Self-Harm Indicators</MenuItem>
                  <MenuItem value="Academic Stress">Academic Stress</MenuItem>
                  <MenuItem value="Social Withdrawal">Social Withdrawal</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFilterDialogOpen(false)}>Cancel</Button>
          <Button onClick={() => setFilterDialogOpen(false)} variant="contained" sx={{ bgcolor: '#4A90E2' }}>
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>

      {/* Alert Response Dialog */}
      <Dialog open={alertDialogOpen} onClose={() => setAlertDialogOpen(false)} maxWidth="md" fullWidth>
        {selectedAlert && (
          <>
            <DialogTitle sx={{ 
              bgcolor: getSeverityColor(selectedAlert.severity),
              color: 'white'
            }}>
              Respond to Alert: {selectedAlert.type}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Student Information</Typography>
                  <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                    <Typography><strong>Name:</strong> {selectedAlert.student}</Typography>
                    <Typography><strong>ID:</strong> {selectedAlert.studentId}</Typography>
                    <Typography><strong>Risk Score:</strong> {selectedAlert.riskScore}%</Typography>
                    <Typography><strong>Previous Alerts:</strong> {selectedAlert.previousAlerts}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Alert Details</Typography>
                  <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                    <Typography><strong>Time:</strong> {new Date(selectedAlert.timestamp).toLocaleString()}</Typography>
                    <Typography><strong>Source:</strong> {selectedAlert.source}</Typography>
                    <Typography><strong>Status:</strong> {selectedAlert.status}</Typography>
                    <Typography><strong>Assigned To:</strong> {selectedAlert.assignedTo}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>Alert Description</Typography>
                  <Paper sx={{ p: 2, bgcolor: '#ffebee' }}>
                    <Typography>{selectedAlert.description}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>Response Actions</Typography>
                  <FormControl component="fieldset">
                    <RadioGroup>
                      <FormControlLabel value="immediate" control={<Radio />} label="Immediate Crisis Intervention" />
                      <FormControlLabel value="contact" control={<Radio />} label="Contact Emergency Contacts" />
                      <FormControlLabel value="monitor" control={<Radio />} label="Continue Monitoring" />
                      <FormControlLabel value="escalate" control={<Radio />} label="Escalate to Senior Counselor" />
                      <FormControlLabel value="schedule" control={<Radio />} label="Schedule Emergency Session" />
                    </RadioGroup>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Response Notes"
                    placeholder="Document your response and observations..."
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setAlertDialogOpen(false)}>Close</Button>
              <Button 
                onClick={() => {
                  setAlertDialogOpen(false);
                  navigate(`/counselor/student/${selectedAlert.studentId}`);
                }} 
                variant="contained" 
                sx={{ bgcolor: '#4A90E2' }}
              >
                Go to Student Profile
              </Button>
              <Button 
                onClick={() => setAlertDialogOpen(false)} 
                variant="contained" 
                sx={{ bgcolor: getSeverityColor(selectedAlert.severity) }}
              >
                Submit Response
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </VideoBackground>
  );
};

export default AlertsView;