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
  Avatar,
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
  TextField,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  School as SchoolIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  History as HistoryIcon,
  Download as DownloadIcon,
  Chat as ChatIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import counselorService from '../../services/counselorService';

/**
 * COMPONENT: StudentDetailView
 * 
 * PURPOSE:
 * - Display comprehensive student profile pulled from database
 * - Show student's assessment history, check-ins, and risk data
 * - Allow counselor to view all student information in one place
 * - Enable quick session creation and follow-up scheduling
 * 
 * DATABASE CONNECTION:
 * - Main API: GET /api/counselor/student/{user_id}/dashboard
 * - Returns all student data from:
 *   - Users table (name, email, phone, enrollment)
 *   - Assessments table (risk scores, recommendations)
 *   - DailyCheckIn table (mood, stress, check-in history)
 *   - DASS21Assessment table (depression, anxiety, stress scores)
 *   - ProfileAssessment table (academic, family, social data)
 *   - CounselorSession table (session history)
 *   - Alerts table (critical alerts)
 * 
 * HOW IT WORKS:
 * 1. URL: /counselor/student/{user_id}
 * 2. Component mounts → useEffect triggers
 * 3. Calls counselorService.getStudentDashboard(user_id)
 * 4. Backend fetches all student data from multiple tables
 * 5. Frontend displays in organized tabs/cards
 * 6. Counselor can view, analyze, and take action
 */

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`student-tabpanel-${index}`}
      aria-labelledby={`student-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const StudentDetailView = () => {
  const navigate = useNavigate();
  const { userId } = useParams();

  // STATE FOR STUDENT DATA
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  // STATE FOR SESSION CREATION
  const [openSessionDialog, setOpenSessionDialog] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');
  const [creatingSession, setCreatingSession] = useState(false);

  /**
   * FETCH STUDENT DATA FROM BACKEND
   * Calls API that queries multiple database tables
   */
  const fetchStudentData = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await counselorService.getStudentDashboard(userId);
      setStudent(data);
    } catch (err) {
      console.error('Error fetching student data:', err);
      setError('Failed to load student data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * LIFECYCLE: Fetch data on component mount
   */
  useEffect(() => {
    fetchStudentData();
  }, [userId]);

  /**
   * HANDLE: Create new session for this student
   */
  const handleCreateSession = async () => {
    if (!student) return;

    try {
      setCreatingSession(true);

      const sessionData = {
        user_id: student.user.id,
        session_type: 'scheduled',
        risk_level_at_escalation: student.latest_assessment?.risk_level || 'MEDIUM',
        counselor_notes: sessionNotes,
      };

      const response = await counselorService.createSession(sessionData);

      // Refresh student data
      await fetchStudentData();

      setOpenSessionDialog(false);
      setSessionNotes('');

      // Show success
      alert('Session created successfully!');
    } catch (err) {
      console.error('Error creating session:', err);
      setError('Failed to create session. Please try again.');
    } finally {
      setCreatingSession(false);
    }
  };

  /**
   * HANDLE: Download student report as PDF
   */
  const handleDownloadReport = () => {
    alert('Report download feature coming soon!');
  };

  // RENDER: Loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  // RENDER: Error state
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/counselor')}
          sx={{ mb: 2 }}
        >
          Back to Dashboard
        </Button>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!student) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Student not found</Alert>
      </Container>
    );
  }

  // Safe destructuring with defaults
  const {
    user = {},
    latest_assessment = {},
    today_checkin = {},
    recent_checkins = [],
    profile_data = {},
    dass21_scores = {},
    critical_alerts = [],
    sessions_history = []
  } = student || {};

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* HEADER / BACK BUTTON */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/counselor')}
        sx={{ mb: 3 }}
      >
        Back to Dashboard
      </Button>

      {/* STUDENT PROFILE CARD */}
      <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Grid container spacing={3} alignItems="center">
          {/* Avatar */}
          <Grid item>
            <Avatar
              sx={{
                width: 100,
                height: 100,
                background: 'rgba(255,255,255,0.3)',
                fontSize: '3rem',
              }}
            >
              {user?.full_name?.charAt(0).toUpperCase()}
            </Avatar>
          </Grid>

          {/* Student Info */}
          <Grid item xs>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              {user?.full_name}
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmailIcon />
                  <Typography variant="body2">{user?.email}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhoneIcon />
                  <Typography variant="body2">{user?.phone || 'N/A'}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SchoolIcon />
                  <Typography variant="body2">{profile_data?.academic_year || 'N/A'}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Chip
                  label={latest_assessment?.risk_level || 'UNKNOWN'}
                  color={
                    latest_assessment?.risk_level === 'CRITICAL'
                      ? 'error'
                      : latest_assessment?.risk_level === 'HIGH'
                      ? 'warning'
                      : 'success'
                  }
                  sx={{ color: 'white' }}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Action Buttons */}
          <Grid item>
            <Box sx={{ display: 'flex', gap: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
              <Button
                variant="contained"
                sx={{ background: 'white', color: '#667eea', fontWeight: 'bold' }}
                onClick={() => setOpenSessionDialog(true)}
              >
                Start Session
              </Button>
              <Button
                variant="outlined"
                sx={{ borderColor: 'white', color: 'white' }}
                startIcon={<DownloadIcon />}
                onClick={handleDownloadReport}
              >
                Report
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* CRITICAL ALERTS */}
      {critical_alerts && critical_alerts.length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <strong>⚠️ Critical Alerts:</strong>
          {critical_alerts.map((alert, idx) => (
            <div key={idx}>- {alert.message}</div>
          ))}
        </Alert>
      )}

      {/* TABS NAVIGATION */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: '1px solid #ddd' }}
        >
          <Tab label="✓ Overview" />
          <Tab label="📊 Assessments" />
          <Tab label="📝 Check-ins" />
          <Tab label="🎓 Profile" />
          <Tab label="📋 Sessions" />
        </Tabs>
      </Paper>

      {/* TAB 1: OVERVIEW */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {/* Risk Assessment Card */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="📊 Current Risk Assessment" />
              <CardContent>
                {latest_assessment ? (
                  <Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        Risk Level
                      </Typography>
                      <Chip
                        label={latest_assessment.risk_level}
                        color={
                          latest_assessment.risk_level === 'CRITICAL'
                            ? 'error'
                            : latest_assessment.risk_level === 'HIGH'
                            ? 'warning'
                            : 'success'
                        }
                        sx={{ mt: 1 }}
                      />
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        Composite Score
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 1 }}>
                        {latest_assessment.composite_score?.toFixed(2) || 'N/A'}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min((latest_assessment.composite_score || 0) / 100 * 100, 100)}
                        sx={{ mt: 1 }}
                      />
                    </Box>

                    <Box>
                      <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                        Recommendations:
                      </Typography>
                      <Typography variant="body2">
                        {latest_assessment.recommendations || 'No specific recommendations at this time.'}
                      </Typography>
                    </Box>

                    <Typography variant="caption" sx={{ color: '#999', mt: 2, display: 'block' }}>
                      Last Updated: {new Date(latest_assessment.created_at).toLocaleString()}
                    </Typography>
                  </Box>
                ) : (
                  <Typography sx={{ color: '#999' }}>No assessment data available</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Today's Check-in Card */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="📱 Today's Check-in" />
              <CardContent>
                {today_checkin ? (
                  <Box>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box>
                          <Typography variant="body2" sx={{ color: '#666' }}>
                            Mood
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 1 }}>
                            {today_checkin.mood || 'Not recorded'}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box>
                          <Typography variant="body2" sx={{ color: '#666' }}>
                            Stress Level
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 1 }}>
                            {today_checkin.stress_level}/10
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box>
                          <Typography variant="body2" sx={{ color: '#666' }}>
                            Anxiety Level
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 1 }}>
                            {today_checkin.anxiety_level}/10
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box>
                          <Typography variant="body2" sx={{ color: '#666' }}>
                            Sleep Quality
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 1 }}>
                            {today_checkin.sleep_quality}/10
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                    <Typography variant="caption" sx={{ color: '#999', mt: 2, display: 'block' }}>
                      Recorded: {new Date(today_checkin.checkin_date).toLocaleString()}
                    </Typography>
                  </Box>
                ) : (
                  <Typography sx={{ color: '#999' }}>No check-in recorded today</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* TAB 2: ASSESSMENTS */}
      <TabPanel value={tabValue} index={1}>
        <Card>
          <CardHeader title="🧠 DASS21 Assessment Scores" />
          <CardContent>
            {dass21_scores ? (
              <Grid container spacing={3}>
                {/* Depression */}
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, background: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="subtitle2" sx={{ color: '#666' }}>
                      Depression
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1, color: '#d32f2f' }}>
                      {dass21_scores.depression_score}
                    </Typography>
                    <Chip
                      label={dass21_scores.depression_severity}
                      color="error"
                      size="small"
                      sx={{ mt: 1 }}
                    />
                    <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#999' }}>
                      Severity: {dass21_scores.depression_severity}
                    </Typography>
                  </Box>
                </Grid>

                {/* Anxiety */}
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, background: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="subtitle2" sx={{ color: '#666' }}>
                      Anxiety
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1, color: '#f57c00' }}>
                      {dass21_scores.anxiety_score}
                    </Typography>
                    <Chip
                      label={dass21_scores.anxiety_severity}
                      color="warning"
                      size="small"
                      sx={{ mt: 1 }}
                    />
                    <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#999' }}>
                      Severity: {dass21_scores.anxiety_severity}
                    </Typography>
                  </Box>
                </Grid>

                {/* Stress */}
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, background: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="subtitle2" sx={{ color: '#666' }}>
                      Stress
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1, color: '#388e3c' }}>
                      {dass21_scores.stress_score}
                    </Typography>
                    <Chip
                      label={dass21_scores.stress_severity}
                      color="success"
                      size="small"
                      sx={{ mt: 1 }}
                    />
                    <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#999' }}>
                      Severity: {dass21_scores.stress_severity}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            ) : (
              <Typography sx={{ color: '#999' }}>No DASS21 assessment available</Typography>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* TAB 3: CHECK-INS HISTORY */}
      <TabPanel value={tabValue} index={2}>
        <Card>
          <CardHeader title="📊 Check-in History (Last 7 Days)" />
          <CardContent>
            {recent_checkins && recent_checkins.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell>
                        <strong>Date</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Mood</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Stress</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Anxiety</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Sleep</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recent_checkins.map((checkin, idx) => (
                      <TableRow key={idx} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                        <TableCell>{new Date(checkin.checkin_date).toLocaleDateString()}</TableCell>
                        <TableCell>{checkin.mood}</TableCell>
                        <TableCell>{checkin.stress_level}/10</TableCell>
                        <TableCell>{checkin.anxiety_level}/10</TableCell>
                        <TableCell>{checkin.sleep_quality}/10</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography sx={{ color: '#999' }}>No check-in history available</Typography>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* TAB 4: PROFILE DATA */}
      <TabPanel value={tabValue} index={3}>
        <Grid container spacing={3}>
          {profile_data ? (
            <>
              {/* Academic Profile */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="🎓 Academic Profile" />
                  <CardContent>
                    <List dense>
                      <ListItem>
                        <ListItemText
                          primary="Faculty"
                          secondary={profile_data.faculty || 'Not provided'}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Academic Year"
                          secondary={profile_data.academic_year || 'Not provided'}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="GPA"
                          secondary={profile_data.gpa || 'Not provided'}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Academic Stress"
                          secondary={profile_data.academic_stress_level || 'Not provided'}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              {/* Family & Social Profile */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="👨‍👩‍👧‍👦 Family & Social" />
                  <CardContent>
                    <List dense>
                      <ListItem>
                        <ListItemText
                          primary="Family Support"
                          secondary={profile_data.family_support_level || 'Not provided'}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Social Connection"
                          secondary={profile_data.social_connection_level || 'Not provided'}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Life Events"
                          secondary={profile_data.recent_life_events || 'None reported'}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Substance Use"
                          secondary={profile_data.substance_use_indication || 'Not indicated'}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </>
          ) : (
            <Grid item xs={12}>
              <Typography sx={{ color: '#999' }}>No profile data available</Typography>
            </Grid>
          )}
        </Grid>
      </TabPanel>

      {/* TAB 5: SESSION HISTORY */}
      <TabPanel value={tabValue} index={4}>
        <Card>
          <CardHeader title="📋 Counselor Session History" />
          <CardContent>
            {sessions_history && sessions_history.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell>
                        <strong>Date</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Type</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Status</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Outcome</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Follow-up</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sessions_history.map((session, idx) => (
                      <TableRow key={idx} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                        <TableCell>{new Date(session.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Chip label={session.session_type} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={session.status}
                            color={session.status === 'completed' ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{session.outcome || 'N/A'}</TableCell>
                        <TableCell>
                          {session.follow_up_needed ? (
                            <Chip
                              label={`${new Date(session.follow_up_date).toLocaleDateString()}`}
                              color="warning"
                              size="small"
                            />
                          ) : (
                            'None'
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography sx={{ color: '#999' }}>No session history available</Typography>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* START SESSION DIALOG */}
      <Dialog open={openSessionDialog} onClose={() => setOpenSessionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Start New Counselor Session</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Session Notes"
            multiline
            rows={5}
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            placeholder="Document your initial observations, concerns, and session plan..."
            variant="outlined"
          />
          <Typography variant="caption" sx={{ color: '#999', mt: 2, display: 'block' }}>
            Student: {user?.full_name} | Current Risk: {latest_assessment?.risk_level}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSessionDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreateSession}
            variant="contained"
            disabled={creatingSession}
            startIcon={<SaveIcon />}
          >
            {creatingSession ? 'Creating...' : 'Create Session'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StudentDetailView;
