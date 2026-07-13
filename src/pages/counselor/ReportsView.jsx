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
import Psychology from '@mui/icons-material/Psychology';
import Menu from '@mui/icons-material/Menu';
import Assessment from '@mui/icons-material/Assessment';
import BarChart from '@mui/icons-material/BarChart';
import PieChart from '@mui/icons-material/PieChart';
import Timeline from '@mui/icons-material/Timeline';
import Download from '@mui/icons-material/Download';
import Print from '@mui/icons-material/Print';
import Share from '@mui/icons-material/Share';
import PictureAsPdf from '@mui/icons-material/PictureAsPdf';
import TableChart from '@mui/icons-material/TableChart';
import InsertChart from '@mui/icons-material/InsertChart';
import DateRange from '@mui/icons-material/DateRange';
import FilterList from '@mui/icons-material/FilterList';
import Refresh from '@mui/icons-material/Refresh';
import Notifications from '@mui/icons-material/Notifications';
import Person from '@mui/icons-material/Person';
import School from '@mui/icons-material/School';
import Warning from '@mui/icons-material/Warning';
import Chat from '@mui/icons-material/Chat';
import Settings from '@mui/icons-material/Settings';
import ExitToApp from '@mui/icons-material/ExitToApp';

// Tab Panel Component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`reports-tabpanel-${index}`}
      aria-labelledby={`reports-tab-${index}`}
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

const ReportsView = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [dateRange, setDateRange] = useState('week');
  const [reportType, setReportType] = useState('summary');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeTables, setIncludeTables] = useState(true);

  // Mock reports data
  const reports = {
    weekly: {
      period: 'Feb 24 - Mar 02, 2025',
      totalSessions: 24,
      newStudents: 5,
      highRiskCases: 8,
      interventions: 15,
      crisisInterventions: 3,
      averageEffectiveness: 4.2,
      studentSatisfaction: 94,
      topConcerns: [
        { issue: 'Anxiety', count: 12 },
        { issue: 'Depression', count: 8 },
        { issue: 'Academic Stress', count: 6 },
        { issue: 'Relationship Issues', count: 4 },
        { issue: 'Suicidal Ideation', count: 3 },
      ],
      dailyBreakdown: [
        { day: 'Mon', sessions: 5, alerts: 2 },
        { day: 'Tue', sessions: 4, alerts: 1 },
        { day: 'Wed', sessions: 6, alerts: 3 },
        { day: 'Thu', sessions: 3, alerts: 1 },
        { day: 'Fri', sessions: 4, alerts: 2 },
        { day: 'Sat', sessions: 2, alerts: 0 },
        { day: 'Sun', sessions: 0, alerts: 0 },
      ],
    },
    monthly: {
      period: 'February 2025',
      totalSessions: 98,
      newStudents: 21,
      highRiskCases: 12,
      interventions: 67,
      crisisInterventions: 8,
      averageEffectiveness: 4.3,
      studentSatisfaction: 95,
      topConcerns: [
        { issue: 'Anxiety', count: 45 },
        { issue: 'Depression', count: 32 },
        { issue: 'Academic Stress', count: 28 },
        { issue: 'Relationship Issues', count: 18 },
        { issue: 'Suicidal Ideation', count: 8 },
      ],
    },
    quarterly: {
      period: 'Q1 2025',
      totalSessions: 287,
      newStudents: 58,
      highRiskCases: 15,
      interventions: 189,
      crisisInterventions: 21,
      averageEffectiveness: 4.1,
      studentSatisfaction: 92,
    },
  };

  const menuItems = [
    { text: 'Dashboard', icon: <Person />, path: '/counselor' },
    { text: 'Students', icon: <School />, path: '/counselor/students' },
    { text: 'Alerts', icon: <Warning />, path: '/counselor/alerts' },
    { text: 'Sessions', icon: <Chat />, path: '/counselor/sessions' },
    { text: 'Reports', icon: <Assessment />, path: '/counselor/reports' },
    { text: 'Settings', icon: <Settings />, path: '/counselor/settings' },
  ];

  const reportTemplates = [
    {
      id: 1,
      name: 'Weekly Summary Report',
      type: 'summary',
      description: 'Overview of weekly activities, sessions, and key metrics',
      icon: <BarChart />,
      color: '#4A90E2',
    },
    {
      id: 2,
      name: 'Student Progress Report',
      type: 'progress',
      description: 'Detailed progress tracking for individual students',
      icon: <Timeline />,
      color: '#50E3C2',
    },
    {
      id: 3,
      name: 'Risk Assessment Report',
      type: 'risk',
      description: 'Analysis of high-risk cases and intervention effectiveness',
      icon: <Warning />,
      color: '#f44336',
    },
    {
      id: 4,
      name: 'Crisis Intervention Report',
      type: 'crisis',
      description: 'Detailed log of crisis interventions and outcomes',
      icon: <Assessment />,
      color: '#ff9800',
    },
    {
      id: 5,
      name: 'Outcome Analysis Report',
      type: 'outcome',
      description: 'Effectiveness analysis and treatment outcomes',
      icon: <PieChart />,
      color: '#4caf50',
    },
    {
      id: 6,
      name: 'Comparative Analysis',
      type: 'comparative',
      description: 'Compare metrics across different time periods',
      icon: <Timeline />,
      color: '#9c27b0',
    },
  ];

  const handleGenerateReport = (template) => {
    setSelectedReport(template);
    setReportDialogOpen(true);
  };

  const handleDownloadReport = (format) => {
    setSnackbarMessage(`Report downloaded as ${format.toUpperCase()}`);
    setSnackbarOpen(true);
    setReportDialogOpen(false);
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
                    Reports & Analytics
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Generate and analyze counseling reports
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button 
                  variant="contained" 
                  startIcon={<BarChart />}
                  onClick={() => setReportDialogOpen(true)}
                  sx={{ bgcolor: '#4A90E2' }}
                >
                  Generate Report
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

          {/* Quick Stats */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Zoom in={true} timeout={500}>
                <Card sx={{ bgcolor: 'rgba(255,255,255,0.95)' }}>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Total Sessions
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: '#4A90E2' }}>
                      287
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      +12% from last month
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
                      Avg Effectiveness
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: '#50E3C2' }}>
                      4.2
                    </Typography>
                    <Rating value={4.2} precision={0.5} readOnly size="small" />
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Zoom in={true} timeout={900}>
                <Card sx={{ bgcolor: 'rgba(255,255,255,0.95)' }}>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Crisis Interventions
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: '#f44336' }}>
                      21
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      This quarter
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
                      Student Satisfaction
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: '#4caf50' }}>
                      94%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Based on 156 responses
                    </Typography>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
          </Grid>

          {/* Report Templates */}
          <Typography variant="h6" gutterBottom sx={{ color: 'white', mb: 2 }}>
            Report Templates
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {reportTemplates.map((template) => (
              <Grid item xs={12} sm={6} md={4} key={template.id}>
                <Fade in={true} timeout={500 + template.id * 100}>
                  <Card 
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.95)',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'scale(1.02)',
                        boxShadow: `0 10px 30px ${template.color}40`,
                      },
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => handleGenerateReport(template)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar sx={{ bgcolor: template.color }}>
                          {template.icon}
                        </Avatar>
                        <Typography variant="h6">{template.name}</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {template.description}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Tooltip title="Generate">
                          <IconButton size="small">
                            <Assessment />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download PDF">
                          <IconButton size="small">
                            <PictureAsPdf />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Share">
                          <IconButton size="small">
                            <Share />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>

          {/* Tabs for different reports */}
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
              <Tab icon={<BarChart />} label="Weekly Summary" />
              <Tab icon={<Timeline />} label="Monthly Report" />
              <Tab icon={<PieChart />} label="Quarterly Analysis" />
            </Tabs>
          </Paper>

          {/* Weekly Report Tab */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.95)' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6">Weekly Summary Report</Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button startIcon={<PictureAsPdf />} variant="outlined">PDF</Button>
                      <Button startIcon={<TableChart />} variant="outlined">Excel</Button>
                      <Button startIcon={<Print />} variant="outlined">Print</Button>
                      <Button startIcon={<Share />} variant="outlined">Share</Button>
                    </Box>
                  </Box>

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" gutterBottom>Period: {reports.weekly.period}</Typography>
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableBody>
                            <TableRow>
                              <TableCell>Total Sessions</TableCell>
                              <TableCell align="right">{reports.weekly.totalSessions}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>New Students</TableCell>
                              <TableCell align="right">{reports.weekly.newStudents}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>High Risk Cases</TableCell>
                              <TableCell align="right">{reports.weekly.highRiskCases}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Interventions</TableCell>
                              <TableCell align="right">{reports.weekly.interventions}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Crisis Interventions</TableCell>
                              <TableCell align="right">{reports.weekly.crisisInterventions}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Average Effectiveness</TableCell>
                              <TableCell align="right">{reports.weekly.averageEffectiveness}/5</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Student Satisfaction</TableCell>
                              <TableCell align="right">{reports.weekly.studentSatisfaction}%</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" gutterBottom>Top Concerns</Typography>
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Issue</TableCell>
                              <TableCell align="right">Count</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {reports.weekly.topConcerns.map((concern) => (
                              <TableRow key={concern.issue}>
                                <TableCell>{concern.issue}</TableCell>
                                <TableCell align="right">{concern.count}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom>Daily Breakdown</Typography>
                      <TableContainer component={Paper} variant="outlined">
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Day</TableCell>
                              <TableCell align="right">Sessions</TableCell>
                              <TableCell align="right">Alerts</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {reports.weekly.dailyBreakdown.map((day) => (
                              <TableRow key={day.day}>
                                <TableCell>{day.day}</TableCell>
                                <TableCell align="right">{day.sessions}</TableCell>
                                <TableCell align="right">
                                  <Chip 
                                    label={day.alerts}
                                    size="small"
                                    sx={{ 
                                      bgcolor: day.alerts > 2 ? '#f44336' : day.alerts > 0 ? '#ff9800' : '#4caf50',
                                      color: 'white'
                                    }}
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Monthly Report Tab */}
          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.95)' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6">Monthly Report - {reports.monthly.period}</Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button startIcon={<PictureAsPdf />} variant="outlined">PDF</Button>
                      <Button startIcon={<TableChart />} variant="outlined">Excel</Button>
                    </Box>
                  </Box>

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <Card sx={{ bgcolor: '#f5f5f5' }}>
                        <CardContent>
                          <Typography color="text.secondary">Total Sessions</Typography>
                          <Typography variant="h4">{reports.monthly.totalSessions}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Card sx={{ bgcolor: '#f5f5f5' }}>
                        <CardContent>
                          <Typography color="text.secondary">New Students</Typography>
                          <Typography variant="h4">{reports.monthly.newStudents}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Card sx={{ bgcolor: '#f5f5f5' }}>
                        <CardContent>
                          <Typography color="text.secondary">Crisis Interventions</Typography>
                          <Typography variant="h4">{reports.monthly.crisisInterventions}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  <TableContainer sx={{ mt: 3 }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Metric</TableCell>
                          <TableCell align="right">Value</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>High Risk Cases</TableCell>
                          <TableCell align="right">{reports.monthly.highRiskCases}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Interventions</TableCell>
                          <TableCell align="right">{reports.monthly.interventions}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Average Effectiveness</TableCell>
                          <TableCell align="right">{reports.monthly.averageEffectiveness}/5</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Student Satisfaction</TableCell>
                          <TableCell align="right">{reports.monthly.studentSatisfaction}%</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Quarterly Report Tab */}
          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.95)' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6">Quarterly Analysis - {reports.quarterly.period}</Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button startIcon={<PictureAsPdf />} variant="outlined">PDF</Button>
                      <Button startIcon={<BarChart />} variant="outlined">Export</Button>
                    </Box>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6">{reports.quarterly.totalSessions}</Typography>
                          <Typography color="text.secondary">Total Sessions</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6">{reports.quarterly.newStudents}</Typography>
                          <Typography color="text.secondary">New Students</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6">{reports.quarterly.highRiskCases}</Typography>
                          <Typography color="text.secondary">High Risk Cases</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6">{reports.quarterly.crisisInterventions}</Typography>
                          <Typography color="text.secondary">Crisis Interventions</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>Key Insights</Typography>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Crisis interventions increased by 15% compared to previous quarter.
                    </Alert>
                    <Alert severity="success">
                      Student satisfaction remains high at 92%.
                    </Alert>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>
        </Container>
      </Box>

      {/* Generate Report Dialog */}
      <Dialog open={reportDialogOpen} onClose={() => setReportDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Assessment sx={{ color: '#4A90E2' }} />
            Generate Report
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Report Type</InputLabel>
                <Select 
                  value={reportType} 
                  onChange={(e) => setReportType(e.target.value)}
                  label="Report Type"
                >
                  <MenuItem value="summary">Summary Report</MenuItem>
                  <MenuItem value="detailed">Detailed Report</MenuItem>
                  <MenuItem value="comparative">Comparative Analysis</MenuItem>
                  <MenuItem value="individual">Individual Student Report</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Date Range</InputLabel>
                <Select 
                  value={dateRange} 
                  onChange={(e) => setDateRange(e.target.value)}
                  label="Date Range"
                >
                  <MenuItem value="today">Today</MenuItem>
                  <MenuItem value="week">This Week</MenuItem>
                  <MenuItem value="month">This Month</MenuItem>
                  <MenuItem value="quarter">This Quarter</MenuItem>
                  <MenuItem value="year">This Year</MenuItem>
                  <MenuItem value="custom">Custom Range</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Format</InputLabel>
                <Select defaultValue="pdf" label="Format">
                  <MenuItem value="pdf">PDF Document</MenuItem>
                  <MenuItem value="excel">Excel Spreadsheet</MenuItem>
                  <MenuItem value="csv">CSV File</MenuItem>
                  <MenuItem value="word">Word Document</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>Include in Report:</Typography>
              <FormControlLabel 
                control={<Checkbox checked={includeCharts} onChange={(e) => setIncludeCharts(e.target.checked)} />}
                label="Charts and Graphs"
              />
              <FormControlLabel 
                control={<Checkbox checked={includeTables} onChange={(e) => setIncludeTables(e.target.checked)} />}
                label="Data Tables"
              />
              <FormControlLabel 
                control={<Checkbox />}
                label="Executive Summary"
              />
              <FormControlLabel 
                control={<Checkbox />}
                label="Recommendations"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Additional Notes"
                multiline
                rows={3}
                placeholder="Enter any specific requirements or notes for this report..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => handleDownloadReport('pdf')}
            variant="contained" 
            sx={{ bgcolor: '#4A90E2' }}
          >
            Generate Report
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

export default ReportsView;