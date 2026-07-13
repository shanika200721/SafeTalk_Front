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
  LinearProgress,
  Tabs,
  Tab,
  Radio,
  RadioGroup,
  FormControlLabel,
  Checkbox,
  Alert,
  Snackbar,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import VideoBackground from '../../components/common/VideoBackground';
import ArrowBack from '@mui/icons-material/ArrowBack';
import PsychologyIcon from '@mui/icons-material/Psychology';
import MenuIcon from '@mui/icons-material/Menu';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import WarningIcon from '@mui/icons-material/Warning';
import ChatIcon from '@mui/icons-material/Chat';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DateRangeIcon from '@mui/icons-material/DateRange';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';

// Tab Panel Component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
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

const AnalyticsView = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [dateRange, setDateRange] = useState('month');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Mock analytics data
  const analytics = {
    overview: {
      totalStudents: 156,
      activeStudents: 89,
      highRisk: 12,
      mediumRisk: 34,
      lowRisk: 110,
      sessionsThisMonth: 287,
      avgEffectiveness: 4.2,
      crisisInterventions: 21,
      satisfaction: 94,
    },
    trends: [
      { month: 'Jan', sessions: 245, alerts: 18, effectiveness: 4.0 },
      { month: 'Feb', sessions: 278, alerts: 22, effectiveness: 4.1 },
      { month: 'Mar', sessions: 287, alerts: 24, effectiveness: 4.2 },
      { month: 'Apr', sessions: 302, alerts: 28, effectiveness: 4.3 },
      { month: 'May', sessions: 315, alerts: 31, effectiveness: 4.2 },
      { month: 'Jun', sessions: 298, alerts: 26, effectiveness: 4.4 },
    ],
    riskDistribution: [
      { category: 'Suicidal Ideation', count: 8, trend: 'up' },
      { category: 'Severe Anxiety', count: 15, trend: 'up' },
      { category: 'Depression', count: 22, trend: 'flat' },
      { category: 'Academic Stress', count: 31, trend: 'down' },
      { category: 'Relationship Issues', count: 18, trend: 'flat' },
      { category: 'Self-Harm', count: 5, trend: 'up' },
    ],
    effectivenessByType: [
      { type: 'Crisis Intervention', score: 4.5, sessions: 21 },
      { type: 'Therapy Session', score: 4.3, sessions: 156 },
      { type: 'Assessment', score: 4.1, sessions: 45 },
      { type: 'Follow-up', score: 4.0, sessions: 65 },
    ],
    demographicData: [
      { faculty: 'Engineering', students: 45, highRisk: 5 },
      { faculty: 'Medicine', students: 32, highRisk: 3 },
      { faculty: 'Arts', students: 28, highRisk: 2 },
      { faculty: 'Business', students: 25, highRisk: 1 },
      { faculty: 'Science', students: 26, highRisk: 1 },
    ],
  };

  const menuItems = [
    { text: 'Dashboard', icon: <PersonIcon />, path: '/counselor' },
    { text: 'Students', icon: <SchoolIcon />, path: '/counselor/students' },
    { text: 'Alerts', icon: <WarningIcon />, path: '/counselor/alerts' },
    { text: 'Sessions', icon: <ChatIcon />, path: '/counselor/sessions' },
    { text: 'Reports', icon: <AssessmentIcon />, path: '/counselor/reports' },
    { text: 'Analytics', icon: <BarChartIcon />, path: '/counselor/analytics' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/counselor/settings' },
  ];

  const getTrendIcon = (trend) => {
    switch(trend) {
      case 'up': return <TrendingUpIcon sx={{ color: '#f44336' }} />;
      case 'down': return <TrendingDownIcon sx={{ color: '#4caf50' }} />;
      case 'flat': return <TrendingFlatIcon sx={{ color: '#ff9800' }} />;
      default: return null;
    }
  };

  const handleExport = () => {
    setSnackbarMessage('Analytics data exported successfully');
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
                    Analytics Dashboard
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Data-driven insights and trends
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <Select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="week">This Week</MenuItem>
                    <MenuItem value="month">This Month</MenuItem>
                    <MenuItem value="quarter">This Quarter</MenuItem>
                    <MenuItem value="year">This Year</MenuItem>
                  </Select>
                </FormControl>
                <Tooltip title="Refresh">
                  <IconButton>
                    <RefreshIcon />
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

          {/* Overview Stats */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Zoom in={true} timeout={500}>
                <Card sx={{ bgcolor: 'rgba(255,255,255,0.95)' }}>
                  <CardContent>
                    <Typography color="text.secondary">Total Students</Typography>
                    <Typography variant="h3">{analytics.overview.totalStudents}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {analytics.overview.activeStudents} active
                    </Typography>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Zoom in={true} timeout={700}>
                <Card sx={{ bgcolor: 'rgba(255,255,255,0.95)' }}>
                  <CardContent>
                    <Typography color="text.secondary">High Risk</Typography>
                    <Typography variant="h3" sx={{ color: '#f44336' }}>
                      {analytics.overview.highRisk}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {((analytics.overview.highRisk / analytics.overview.totalStudents) * 100).toFixed(1)}% of total
                    </Typography>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Zoom in={true} timeout={900}>
                <Card sx={{ bgcolor: 'rgba(255,255,255,0.95)' }}>
                  <CardContent>
                    <Typography color="text.secondary">Sessions</Typography>
                    <Typography variant="h3">{analytics.overview.sessionsThisMonth}</Typography>
                    <Typography variant="body2" color="text.secondary">this month</Typography>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Zoom in={true} timeout={1100}>
                <Card sx={{ bgcolor: 'rgba(255,255,255,0.95)' }}>
                  <CardContent>
                    <Typography color="text.secondary">Effectiveness</Typography>
                    <Typography variant="h3">{analytics.overview.avgEffectiveness}</Typography>
                    <Typography variant="body2" color="text.secondary">out of 5.0</Typography>
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
              <Tab icon={<ShowChartIcon />} label="Trends" />
              <Tab icon={<PieChartIcon />} label="Distribution" />
              <Tab icon={<BarChartIcon />} label="Effectiveness" />
              <Tab icon={<PersonIcon />} label="Demographics" />
            </Tabs>
          </Paper>

          {/* Trends Tab */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.95)' }}>
                  <Typography variant="h6" gutterBottom>Monthly Trends</Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Month</TableCell>
                          <TableCell align="right">Sessions</TableCell>
                          <TableCell align="right">Alerts</TableCell>
                          <TableCell align="right">Effectiveness</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {analytics.trends.map((trend) => (
                          <TableRow key={trend.month}>
                            <TableCell>{trend.month}</TableCell>
                            <TableCell align="right">{trend.sessions}</TableCell>
                            <TableCell align="right">
                              <Chip 
                                label={trend.alerts}
                                size="small"
                                sx={{ 
                                  bgcolor: trend.alerts > 25 ? '#f44336' : trend.alerts > 20 ? '#ff9800' : '#4caf50',
                                  color: 'white'
                                }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                <Rating value={trend.effectiveness} precision={0.1} readOnly size="small" />
                                <Typography sx={{ ml: 1 }}>({trend.effectiveness})</Typography>
                              </Box>
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

          {/* Distribution Tab */}
          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.95)' }}>
                  <Typography variant="h6" gutterBottom>Risk Distribution by Category</Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Category</TableCell>
                          <TableCell align="right">Count</TableCell>
                          <TableCell align="right">Trend</TableCell>
                          <TableCell>Distribution</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {analytics.riskDistribution.map((item) => (
                          <TableRow key={item.category}>
                            <TableCell>{item.category}</TableCell>
                            <TableCell align="right">{item.count}</TableCell>
                            <TableCell align="right">{getTrendIcon(item.trend)}</TableCell>
                            <TableCell>
                              <LinearProgress 
                                variant="determinate" 
                                value={(item.count / 50) * 100}
                                sx={{ 
                                  height: 8, 
                                  borderRadius: 4,
                                  bgcolor: '#e0e0e0',
                                  '& .MuiLinearProgress-bar': {
                                    bgcolor: item.count > 20 ? '#f44336' : item.count > 10 ? '#ff9800' : '#4caf50'
                                  }
                                }}
                              />
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

          {/* Effectiveness Tab */}
          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.95)' }}>
                  <Typography variant="h6" gutterBottom>Effectiveness by Session Type</Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Session Type</TableCell>
                          <TableCell align="right">Sessions</TableCell>
                          <TableCell align="right">Effectiveness Score</TableCell>
                          <TableCell>Performance</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {analytics.effectivenessByType.map((item) => (
                          <TableRow key={item.type}>
                            <TableCell>{item.type}</TableCell>
                            <TableCell align="right">{item.sessions}</TableCell>
                            <TableCell align="right">
                              <Rating value={item.score} precision={0.1} readOnly size="small" />
                            </TableCell>
                            <TableCell>
                              <LinearProgress 
                                variant="determinate" 
                                value={(item.score / 5) * 100}
                                sx={{ 
                                  height: 8, 
                                  borderRadius: 4,
                                  bgcolor: '#e0e0e0',
                                  '& .MuiLinearProgress-bar': {
                                    bgcolor: item.score > 4.3 ? '#4caf50' : item.score > 4.0 ? '#ff9800' : '#f44336'
                                  }
                                }}
                              />
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

          {/* Demographics Tab */}
          <TabPanel value={tabValue} index={3}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.95)' }}>
                  <Typography variant="h6" gutterBottom>Student Distribution by Faculty</Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Faculty</TableCell>
                          <TableCell align="right">Total Students</TableCell>
                          <TableCell align="right">High Risk</TableCell>
                          <TableCell>Risk Ratio</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {analytics.demographicData.map((item) => (
                          <TableRow key={item.faculty}>
                            <TableCell>{item.faculty}</TableCell>
                            <TableCell align="right">{item.students}</TableCell>
                            <TableCell align="right">
                              <Chip 
                                label={item.highRisk}
                                size="small"
                                sx={{ 
                                  bgcolor: item.highRisk > 4 ? '#f44336' : item.highRisk > 2 ? '#ff9800' : '#4caf50',
                                  color: 'white'
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <LinearProgress 
                                variant="determinate" 
                                value={(item.highRisk / item.students) * 100}
                                sx={{ 
                                  height: 8, 
                                  borderRadius: 4,
                                  bgcolor: '#e0e0e0',
                                  '& .MuiLinearProgress-bar': {
                                    bgcolor: (item.highRisk / item.students) > 0.15 ? '#f44336' : 
                                            (item.highRisk / item.students) > 0.1 ? '#ff9800' : '#4caf50'
                                  }
                                }}
                              />
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

export default AnalyticsView;