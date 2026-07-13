import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Tooltip,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  FileDownload as FileDownloadIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Chat as ChatIcon,
  Assessment as AssessmentIcon,
  Psychology as PsychologyIcon,
  School as SchoolIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import counselorService from '../../services/counselorService';
import reportService from '../../services/reportService';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ViewStudentProfile = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  
  // State management
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportFormat, setReportFormat] = useState('pdf');
  const [generatingReport, setGeneratingReport] = useState(false);

  // Fetch student data on mount
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await counselorService.getStudentDashboard(userId);
        setStudentData(data);
      } catch (err) {
        console.error('Error fetching student data:', err);
        setError(err.response?.data?.detail || 'Failed to load student profile');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchStudentData();
    }
  }, [userId]);

  // Generate report handler
  const handleGenerateReport = async () => {
    try {
      setGeneratingReport(true);
      
      if (reportFormat === 'pdf') {
        await reportService.generatePDFReport(studentData);
      } else {
        await reportService.generateCSVReport(studentData);
      }
      
      setReportDialogOpen(false);
    } catch (err) {
      console.error('Error generating report:', err);
      setError('Failed to generate report');
    } finally {
      setGeneratingReport(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/counselor')}
            sx={{ mb: 2 }}
          >
            Back to Dashboard
          </Button>
          <Alert severity="error">{error}</Alert>
        </Box>
      </Container>
    );
  }

  if (!studentData) {
    return <Typography>No student data available</Typography>;
  }

  const { user, profile_assessment, dass21_assessment, today_checkin, latest_risk_assessment, critical_alerts } = studentData;

  // Helper function to get risk level color
  const getRiskLevelColor = (riskLevel) => {
    const colors = {
      'LOW': '#4CAF50',
      'MEDIUM': '#FF9800',
      'HIGH': '#F44336',
      'SEVERE': '#9C27B0',
    };
    return colors[riskLevel] || '#757575';
  };

  // Helper function to get severity color
  const getSeverityColor = (severity) => {
    const colors = {
      'Normal': '#4CAF50',
      'Mild': '#8BC34A',
      'Moderate': '#FF9800',
      'Severe': '#F44336',
      'Very Severe': '#9C27B0',
    };
    return colors[severity] || '#757575';
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/counselor')} size="small">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4">Student Profile</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={() => window.print()}
          >
            Print
          </Button>
          <Button
            variant="contained"
            startIcon={<FileDownloadIcon />}
            onClick={() => setReportDialogOpen(true)}
          >
            Generate Report
          </Button>
        </Box>
      </Box>

      {/* Student Info Card */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm="auto">
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  backgroundColor: 'rgba(255,255,255,0.3)',
                  fontSize: '2rem',
                }}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
            </Grid>
            <Grid item xs={12} sm>
              <Typography variant="h5" gutterBottom>{user?.name}</Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmailIcon fontSize="small" />
                  <Typography variant="body2">{user?.email}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SchoolIcon fontSize="small" />
                  <Typography variant="body2">
                    {user?.department} - Year {user?.year_of_study}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            {latest_risk_assessment && (
              <Grid item xs={12} sm="auto">
                <Chip
                  label={`Risk: ${latest_risk_assessment.risk_level}`}
                  sx={{
                    backgroundColor: getRiskLevelColor(latest_risk_assessment.risk_level),
                    color: 'white',
                    fontSize: '0.9rem',
                  }}
                />
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      {latest_risk_assessment && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Composite Score
                    </Typography>
                    <Typography variant="h5">
                      {latest_risk_assessment.composite_score?.toFixed(1)}%
                    </Typography>
                  </Box>
                  <PsychologyIcon sx={{ fontSize: 40, color: '#667eea', opacity: 0.5 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Risk Level
                    </Typography>
                    <Typography variant="h5">
                      {latest_risk_assessment.risk_level}
                    </Typography>
                  </Box>
                  <WarningIcon sx={{ fontSize: 40, color: getRiskLevelColor(latest_risk_assessment.risk_level), opacity: 0.5 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Escalation
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {latest_risk_assessment.needs_escalation ? (
                        <CancelIcon sx={{ color: '#F44336' }} />
                      ) : (
                        <CheckCircleIcon sx={{ color: '#4CAF50' }} />
                      )}
                      <Typography variant="h6">
                        {latest_risk_assessment.needs_escalation ? 'Yes' : 'No'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Assessment Date
                    </Typography>
                    <Typography variant="body2">
                      {new Date(latest_risk_assessment.created_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <AssessmentIcon sx={{ fontSize: 40, color: '#FF9800', opacity: 0.5 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Main Tabs */}
      <Paper>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="DASS21 Assessment" icon={<AssessmentIcon />} iconPosition="start" />
          <Tab label="Profile Assessment" icon={<Psychology />} iconPosition="start" />
          <Tab label="Check-ins" icon={<Schedule />} iconPosition="start" />
          <Tab label="Risk Assessment" icon={<TrendingUpIcon />} iconPosition="start" />
          <Tab label="Alerts" icon={<WarningIcon />} iconPosition="start" />
        </Tabs>

        {/* DASS21 Assessment Tab */}
        <TabPanel value={tabValue} index={0}>
          {dass21_assessment ? (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      DASS21 Scores
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Assessment Date: {new Date(dass21_assessment.created_at).toLocaleDateString()}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    
                    <Grid container spacing={2}>
                      {/* Depression */}
                      <Grid item xs={12} sm={6} md={4}>
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" fontWeight="bold">
                              Depression
                            </Typography>
                            <Chip
                              label={dass21_assessment.depression_severity}
                              size="small"
                              sx={{
                                backgroundColor: getSeverityColor(dass21_assessment.depression_severity),
                                color: 'white',
                              }}
                            />
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min((dass21_assessment.depression_score / 42) * 100, 100)}
                            sx={{ mb: 1 }}
                          />
                          <Typography variant="caption">
                            Score: {dass21_assessment.depression_score}/42
                          </Typography>
                        </Box>
                      </Grid>

                      {/* Anxiety */}
                      <Grid item xs={12} sm={6} md={4}>
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" fontWeight="bold">
                              Anxiety
                            </Typography>
                            <Chip
                              label={dass21_assessment.anxiety_severity}
                              size="small"
                              sx={{
                                backgroundColor: getSeverityColor(dass21_assessment.anxiety_severity),
                                color: 'white',
                              }}
                            />
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min((dass21_assessment.anxiety_score / 42) * 100, 100)}
                            sx={{ mb: 1 }}
                          />
                          <Typography variant="caption">
                            Score: {dass21_assessment.anxiety_score}/42
                          </Typography>
                        </Box>
                      </Grid>

                      {/* Stress */}
                      <Grid item xs={12} sm={6} md={4}>
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" fontWeight="bold">
                              Stress
                            </Typography>
                            <Chip
                              label={dass21_assessment.stress_severity}
                              size="small"
                              sx={{
                                backgroundColor: getSeverityColor(dass21_assessment.stress_severity),
                                color: 'white',
                              }}
                            />
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min((dass21_assessment.stress_score / 42) * 100, 100)}
                            sx={{ mb: 1 }}
                          />
                          <Typography variant="caption">
                            Score: {dass21_assessment.stress_score}/42
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" fontWeight="bold">
                        Total DASS21 Score:
                      </Typography>
                      <Chip
                        label={dass21_assessment.total_dass21_score}
                        size="small"
                        sx={{
                          backgroundColor: getSeverityColor(dass21_assessment.depression_severity),
                          color: 'white',
                          fontSize: '1rem',
                          height: 'auto',
                          padding: '8px',
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          ) : (
            <Alert severity="info">No DASS21 assessment found for this student</Alert>
          )}
        </TabPanel>

        {/* Profile Assessment Tab */}
        <TabPanel value={tabValue} index={1}>
          {profile_assessment ? (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Profile Assessment
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2">Profile Score:</Typography>
                    <Chip label={profile_assessment.profile_score?.toFixed(1)} />
                  </Box>
                  <Typography variant="caption" color="textSecondary">
                    Last Updated: {new Date(profile_assessment.updated_at).toLocaleDateString()}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ) : (
            <Alert severity="info">No profile assessment found for this student</Alert>
          )}
        </TabPanel>

        {/* Check-ins Tab */}
        <TabPanel value={tabValue} index={2}>
          {today_checkin ? (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Today's Check-in
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">Mood</Typography>
                    <Typography variant="body1">{today_checkin.mood}/10</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">Stress Level</Typography>
                    <Typography variant="body1">{today_checkin.stress_level}/10</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">Anxiety Level</Typography>
                    <Typography variant="body1">{today_checkin.anxiety_level}/10</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">Self-Harm Thoughts</Typography>
                    <Chip
                      label={today_checkin.self_harm_thoughts ? 'Yes' : 'No'}
                      color={today_checkin.self_harm_thoughts ? 'error' : 'success'}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="textSecondary">
                      Check-in Date: {new Date(today_checkin.created_at).toLocaleDateString()}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ) : (
            <Alert severity="info">No check-in for today</Alert>
          )}
        </TabPanel>

        {/* Risk Assessment Tab */}
        <TabPanel value={tabValue} index={3}>
          {latest_risk_assessment ? (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Latest Risk Assessment
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">Composite Score</Typography>
                    <Typography variant="h6">{latest_risk_assessment.composite_score?.toFixed(1)}%</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">Risk Level</Typography>
                    <Chip
                      label={latest_risk_assessment.risk_level}
                      sx={{
                        backgroundColor: getRiskLevelColor(latest_risk_assessment.risk_level),
                        color: 'white',
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Recommendations:
                    </Typography>
                    <List dense>
                      {latest_risk_assessment.recommendations?.map((rec, idx) => (
                        <ListItem key={idx} disableGutters>
                          <ListItemIcon sx={{ minWidth: 0, mr: 1 }}>
                            <CheckCircleIcon sx={{ color: '#4CAF50', fontSize: '1.2rem' }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={rec}
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="textSecondary">
                      Assessment Date: {new Date(latest_risk_assessment.created_at).toLocaleDateString()}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ) : (
            <Alert severity="info">No risk assessment found for this student</Alert>
          )}
        </TabPanel>

        {/* Alerts Tab */}
        <TabPanel value={tabValue} index={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Critical Alerts (Last 7 Days)
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{
                    p: 2,
                    backgroundColor: '#FFEBEE',
                    borderRadius: 1,
                    textAlign: 'center',
                  }}>
                    <WarningIcon sx={{ color: '#F44336', mb: 1 }} />
                    <Typography variant="body2" color="textSecondary">
                      Self-Harm Thoughts
                    </Typography>
                    <Typography variant="h5" sx={{ color: '#F44336' }}>
                      {critical_alerts?.self_harm_thoughts || 0}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{
                    p: 2,
                    backgroundColor: '#FFF3E0',
                    borderRadius: 1,
                    textAlign: 'center',
                  }}>
                    <InfoIcon sx={{ color: '#FF9800', mb: 1 }} />
                    <Typography variant="body2" color="textSecondary">
                      Negative Thoughts
                    </Typography>
                    <Typography variant="h5" sx={{ color: '#FF9800' }}>
                      {critical_alerts?.negative_thoughts || 0}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{
                    p: 2,
                    backgroundColor: '#F3E5F5',
                    borderRadius: 1,
                    textAlign: 'center',
                  }}>
                    <WarningIcon sx={{ color: '#9C27B0', mb: 1 }} />
                    <Typography variant="body2" color="textSecondary">
                      Substance Use
                    </Typography>
                    <Typography variant="h5" sx={{ color: '#9C27B0' }}>
                      {critical_alerts?.substance_use || 0}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </TabPanel>
      </Paper>

      {/* Generate Report Dialog */}
      <Dialog open={reportDialogOpen} onClose={() => setReportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generate Report</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="body2" sx={{ mb: 3 }}>
            Choose the format for the student report:
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Card
              sx={{
                flex: 1,
                cursor: 'pointer',
                border: reportFormat === 'pdf' ? '2px solid #667eea' : '1px solid #e0e0e0',
                '&:hover': { boxShadow: 2 },
              }}
              onClick={() => setReportFormat('pdf')}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <FileDownloadIcon sx={{ fontSize: 40, color: '#667eea', mb: 1 }} />
                <Typography variant="body2" fontWeight="bold">PDF Report</Typography>
                <Typography variant="caption" color="textSecondary">
                  Professional document format
                </Typography>
              </CardContent>
            </Card>
            <Card
              sx={{
                flex: 1,
                cursor: 'pointer',
                border: reportFormat === 'csv' ? '2px solid #667eea' : '1px solid #e0e0e0',
                '&:hover': { boxShadow: 2 },
              }}
              onClick={() => setReportFormat('csv')}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <AssessmentIcon sx={{ fontSize: 40, color: '#667eea', mb: 1 }} />
                <Typography variant="body2" fontWeight="bold">CSV Report</Typography>
                <Typography variant="caption" color="textSecondary">
                  Spreadsheet format
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleGenerateReport}
            variant="contained"
            disabled={generatingReport}
            startIcon={generatingReport ? <CircularProgress size={20} /> : <DownloadIcon />}
          >
            {generatingReport ? 'Generating...' : 'Generate'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ViewStudentProfile;
