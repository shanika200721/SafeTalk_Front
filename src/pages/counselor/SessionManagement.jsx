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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip,
  IconButton,
  LinearProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  CallEnd as CallEndIcon,
  AccessTime as ClockIcon,
  Note as NoteIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import counselorService from '../../services/counselorService';

/**
 * COMPONENT: SessionManagement
 * 
 * PURPOSE:
 * - Manage counselor sessions with students
 * - Create, view, edit, and close sessions
 * - Add interventions and outcomes
 * - Schedule follow-ups
 * - Track session progress
 * 
 * DATABASE CONNECTION:
 * - Uses POST/PUT: /api/counselor/sessions
 * - Uses GET: /api/counselor/sessions/{id}
 * - Uses GET: /api/counselor/sessions/user/{user_id}
 * - Modifies CounselorSession table
 * - Tracks: notes, interventions, outcomes, follow-ups
 * 
 * DATA FLOW:
 * 1. Can be opened as modal or standalone page
 * 2. User provides session details (type, risk level, notes)
 * 3. Session created in database
 * 4. Counselor can edit session while active
 * 5. Add intervention type (therapy, counseling, referral, etc.)
 * 6. Record outcome when complete
 * 7. Schedule follow-up appointment
 * 8. Session marked as completed
 */

// Session statuses with colors
const SESSION_STATUSES = {
  pending: { label: 'Pending', color: 'warning' },
  in_progress: { label: 'In Progress', color: 'info' },
  completed: { label: 'Completed', color: 'success' },
};

// Intervention types
const INTERVENTION_TYPES = [
  'cognitive_behavioral_therapy',
  'motivational_interviewing',
  'crisis_intervention',
  'peer_support',
  'referral_to_psychiatrist',
  'medication_review',
  'family_therapy',
  'other',
];

// Map intervention types to display names
const INTERVENTION_LABELS = {
  cognitive_behavioral_therapy: 'Cognitive Behavioral Therapy',
  motivational_interviewing: 'Motivational Interviewing',
  crisis_intervention: 'Crisis Intervention',
  peer_support: 'Peer Support',
  referral_to_psychiatrist: 'Referral to Psychiatrist',
  medication_review: 'Medication Review',
  family_therapy: 'Family Therapy',
  other: 'Other',
};

// Session outcomes
const SESSION_OUTCOMES = [
  { value: 'improved', label: '✅ Student Improved' },
  { value: 'stable', label: '➡️ Status Stable' },
  { value: 'concerned', label: '⚠️ Still Concerned' },
  { value: 'escalated', label: '🚨 Escalated to Psychiatrist' },
];

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`session-tabpanel-${index}`}
      aria-labelledby={`session-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const SessionManagement = ({ sessionId = null, userId = null, onClose = null }) => {
  const navigate = useNavigate();
  const params = useParams();
  const actualSessionId = sessionId || params.sessionId;
  const actualUserId = userId || params.userId;

  // STATE FOR SESSION DATA
  const [session, setSession] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [studentSessions, setStudentSessions] = useState([]);
  
  // STATE FOR UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);

  // STATE FOR EDITING
  const [editFormData, setEditFormData] = useState({
    counselor_notes: '',
    intervention_type: '',
    outcome: '',
    follow_up_needed: false,
    follow_up_date: '',
    status: 'in_progress',
  });

  // STATE FOR SESSION CREATION DIALOG
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [newSessionData, setNewSessionData] = useState({
    user_id: actualUserId || '',
    session_type: 'scheduled',
    risk_level_at_escalation: 'MEDIUM',
    counselor_notes: '',
  });

  /**
   * FETCH SESSION DETAILS
   * If sessionId provided, fetch specific session
   */
  const fetchSessionDetails = async () => {
    if (!actualSessionId) return;

    try {
      setLoading(true);
      const data = await counselorService.getSessionDetails(actualSessionId);
      setSession(data);
      
      // Pre-fill edit form with current session data
      setEditFormData({
        counselor_notes: data.counselor_notes || '',
        intervention_type: data.intervention_type || '',
        outcome: data.outcome || '',
        follow_up_needed: data.follow_up_needed || false,
        follow_up_date: data.follow_up_date ? new Date(data.follow_up_date).toISOString().split('T')[0] : '',
        status: data.status || 'in_progress',
      });
    } catch (err) {
      console.error('Error fetching session details:', err);
      setError('Failed to load session data.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * FETCH SESSIONS FOR A SPECIFIC USER
   * Shows all sessions for a student
   */
  const fetchStudentSessions = async () => {
    if (!actualUserId) return;

    try {
      const data = await counselorService.getStudentSessions(actualUserId);
      setStudentSessions(data);
    } catch (err) {
      console.error('Error fetching student sessions:', err);
    }
  };

  /**
   * LIFECYCLE: Fetch data on component mount
   */
  useEffect(() => {
    if (actualSessionId) {
      fetchSessionDetails();
    } else if (actualUserId) {
      fetchStudentSessions();
    }
  }, [actualSessionId, actualUserId]);

  /**
   * HANDLE: Create new session
   */
  const handleCreateSession = async () => {
    if (!newSessionData.user_id) {
      setError('Please select a student');
      return;
    }

    try {
      setLoading(true);
      const response = await counselorService.createSession(newSessionData);
      
      // Refresh sessions list
      if (actualUserId) {
        await fetchStudentSessions();
      }
      
      setOpenCreateDialog(false);
      setNewSessionData({
        user_id: actualUserId || '',
        session_type: 'scheduled',
        risk_level_at_escalation: 'MEDIUM',
        counselor_notes: '',
      });
      
      // Navigate to new session
      if (response.id) {
        navigate(`/counselor/session/${response.id}`);
      }
    } catch (err) {
      console.error('Error creating session:', err);
      setError('Failed to create session.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * HANDLE: Update session details
   * Saves changes to counselor notes, intervention, outcome, follow-up
   */
  const handleUpdateSession = async () => {
    if (!session) return;

    try {
      setLoading(true);
      
      const updateData = {
        status: editFormData.status,
        counselor_notes: editFormData.counselor_notes,
        intervention_type: editFormData.intervention_type,
        outcome: editFormData.outcome,
        follow_up_needed: editFormData.follow_up_needed,
        follow_up_date: editFormData.follow_up_needed ? editFormData.follow_up_date : null,
      };

      await counselorService.updateSession(session.id, updateData);
      
      // Refresh session data
      await fetchSessionDetails();
      
      setEditMode(false);
      alert('Session updated successfully!');
    } catch (err) {
      console.error('Error updating session:', err);
      setError('Failed to update session.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * HANDLE: End session (mark as completed)
   */
  const handleEndSession = async () => {
    if (
      window.confirm('Are you sure you want to mark this session as completed?')
    ) {
      try {
        await handleUpdateSession();
        setEditFormData({ ...editFormData, status: 'completed' });
      } catch (err) {
        console.error('Error ending session:', err);
      }
    }
  };

  // RENDER: Loading state
  if (loading && !session && !studentSessions.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  // RENDER: Session detail view (single session)
  if (actualSessionId && session) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* BACK BUTTON */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mb: 3 }}
        >
          Back
        </Button>

        {/* ERROR MESSAGE */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* HEADER CARD */}
        <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                Counselor Session
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                Student: {session.student_name}
              </Typography>
              <Chip
                label={SESSION_STATUSES[session.status]?.label || session.status}
                sx={{
                  background: 'rgba(255,255,255,0.3)',
                  color: 'white',
                  fontWeight: 'bold',
                }}
              />
            </Grid>
            <Grid item>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {session.status !== 'completed' && (
                  <>
                    <Button
                      variant="contained"
                      sx={{ background: 'white', color: '#667eea' }}
                      onClick={() => setEditMode(!editMode)}
                      startIcon={editMode ? <SaveIcon /> : <EditIcon />}
                    >
                      {editMode ? 'Cancel' : 'Edit'}
                    </Button>
                    <Button
                      variant="outlined"
                      sx={{ borderColor: 'white', color: 'white' }}
                      onClick={handleEndSession}
                      startIcon={<CallEndIcon />}
                    >
                      End Session
                    </Button>
                  </>
                )}
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* TABS */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="📋 Overview" />
            <Tab label="📝 Notes & Interventions" />
            <Tab label="📊 Outcome & Follow-up" />
            <Tab label="📅 Session Timeline" />
          </Tabs>
        </Paper>

        {/* TAB 1: OVERVIEW */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* Basic Info Card */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="📌 Session Information" />
                <CardContent>
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="Session Type"
                        secondary={session.session_type}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Status"
                        secondary={
                          <Chip
                            label={SESSION_STATUSES[session.status]?.label || session.status}
                            color={SESSION_STATUSES[session.status]?.color || 'default'}
                            size="small"
                            sx={{ mt: 1 }}
                          />
                        }
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Risk Level at Escalation"
                        secondary={
                          <Chip
                            label={session.risk_level_at_escalation}
                            color={
                              session.risk_level_at_escalation === 'CRITICAL'
                                ? 'error'
                                : 'warning'
                            }
                            size="small"
                            sx={{ mt: 1 }}
                          />
                        }
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Created At"
                        secondary={new Date(session.created_at).toLocaleString()}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Duration Card */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="⏱️ Session Duration" />
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                      Elapsed Time
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                      {Math.floor((new Date() - new Date(session.created_at)) / 60000)} minutes
                    </Typography>
                  </Box>
                  {session.updated_at && (
                    <Box>
                      <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                        Last Updated
                      </Typography>
                      <Typography variant="body2">
                        {new Date(session.updated_at).toLocaleString()}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* TAB 2: NOTES & INTERVENTIONS */}
        <TabPanel value={tabValue} index={1}>
          {editMode ? (
            <Grid container spacing={3}>
              {/* Counselor Notes */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  label="Counselor Notes"
                  value={editFormData.counselor_notes}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, counselor_notes: e.target.value })
                  }
                  variant="outlined"
                  placeholder="Document session observations, student responses, and clinical notes..."
                />
              </Grid>

              {/* Intervention Type */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Intervention Type</InputLabel>
                  <Select
                    value={editFormData.intervention_type}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, intervention_type: e.target.value })
                    }
                    label="Intervention Type"
                  >
                    <MenuItem value="">Select intervention...</MenuItem>
                    {INTERVENTION_TYPES.map((type) => (
                      <MenuItem key={type} value={type}>
                        {INTERVENTION_LABELS[type]}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Session Status */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Session Status</InputLabel>
                  <Select
                    value={editFormData.status}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, status: e.target.value })
                    }
                    label="Session Status"
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="in_progress">In Progress</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Save Button */}
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleUpdateSession}
                  disabled={loading}
                  fullWidth
                  sx={{ py: 1.5, fontSize: '1rem' }}
                >
                  Save Changes
                </Button>
              </Grid>
            </Grid>
          ) : (
            <Grid container spacing={3}>
              {/* View Mode */}
              <Grid item xs={12}>
                <Card>
                  <CardHeader title="📝 Counselor Notes" />
                  <CardContent>
                    <Typography variant="body1">
                      {session.counselor_notes || 'No notes recorded yet'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="🔧 Intervention Type" />
                  <CardContent>
                    {session.intervention_type ? (
                      <Chip
                        label={INTERVENTION_LABELS[session.intervention_type]}
                        color="primary"
                        variant="outlined"
                      />
                    ) : (
                      <Typography sx={{ color: '#999' }}>Not yet specified</Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="📊 Status" />
                  <CardContent>
                    <Chip
                      label={SESSION_STATUSES[session.status]?.label || session.status}
                      color={SESSION_STATUSES[session.status]?.color || 'default'}
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </TabPanel>

        {/* TAB 3: OUTCOME & FOLLOW-UP */}
        <TabPanel value={tabValue} index={2}>
          {editMode ? (
            <Grid container spacing={3}>
              {/* Session Outcome */}
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Session Outcome</InputLabel>
                  <Select
                    value={editFormData.outcome}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, outcome: e.target.value })
                    }
                    label="Session Outcome"
                  >
                    <MenuItem value="">Select outcome...</MenuItem>
                    {SESSION_OUTCOMES.map((outcome) => (
                      <MenuItem key={outcome.value} value={outcome.value}>
                        {outcome.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Follow-up Toggle */}
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Follow-up Needed</InputLabel>
                  <Select
                    value={editFormData.follow_up_needed ? 'yes' : 'no'}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        follow_up_needed: e.target.value === 'yes',
                      })
                    }
                    label="Follow-up Needed"
                  >
                    <MenuItem value="no">No Follow-up</MenuItem>
                    <MenuItem value="yes">Schedule Follow-up</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Follow-up Date */}
              {editFormData.follow_up_needed && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Follow-up Date"
                    value={editFormData.follow_up_date}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, follow_up_date: e.target.value })
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              )}

              {/* Save Button */}
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleUpdateSession}
                  disabled={loading}
                  fullWidth
                  sx={{ py: 1.5, fontSize: '1rem' }}
                >
                  Save Outcome & Follow-up
                </Button>
              </Grid>
            </Grid>
          ) : (
            <Grid container spacing={3}>
              {/* View Mode */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="✨ Session Outcome" />
                  <CardContent>
                    {session.outcome ? (
                      <Box>
                        {SESSION_OUTCOMES.find((o) => o.value === session.outcome) && (
                          <Chip
                            label={
                              SESSION_OUTCOMES.find((o) => o.value === session.outcome)
                                ?.label
                            }
                            size="medium"
                          />
                        )}
                      </Box>
                    ) : (
                      <Typography sx={{ color: '#999' }}>
                        Outcome not yet recorded
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="📅 Follow-up" />
                  <CardContent>
                    {session.follow_up_needed ? (
                      <Box>
                        <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                          Follow-up Scheduled:
                        </Typography>
                        <Chip
                          label={new Date(session.follow_up_date).toLocaleDateString()}
                          color="warning"
                          icon={<ScheduleIcon />}
                        />
                      </Box>
                    ) : (
                      <Typography sx={{ color: '#999' }}>
                        No follow-up scheduled
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </TabPanel>

        {/* TAB 4: TIMELINE */}
        <TabPanel value={tabValue} index={3}>
          <Card>
            <CardHeader title="📅 Session Timeline" />
            <CardContent>
              <List>
                <ListItem divider>
                  <ListItemIcon>
                    <AddIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Session Created"
                    secondary={new Date(session.created_at).toLocaleString()}
                  />
                </ListItem>

                {session.updated_at && (
                  <ListItem divider>
                    <ListItemIcon>
                      <EditIcon color="info" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Last Updated"
                      secondary={new Date(session.updated_at).toLocaleString()}
                    />
                  </ListItem>
                )}

                {session.status === 'completed' && (
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Session Completed"
                      secondary={new Date(session.updated_at).toLocaleString()}
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </TabPanel>
      </Container>
    );
  }

  // RENDER: Student sessions list view
  if (actualUserId && studentSessions.length > 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Student Session History
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenCreateDialog(true)}
          >
            New Session
          </Button>
        </Box>

        {/* SESSIONS TABLE */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell><strong>Type</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Intervention</strong></TableCell>
                <TableCell><strong>Outcome</strong></TableCell>
                <TableCell><strong>Follow-up</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {studentSessions.map((sess) => (
                <TableRow key={sess.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                  <TableCell>{new Date(sess.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Chip label={sess.session_type} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={SESSION_STATUSES[sess.status]?.label || sess.status}
                      color={SESSION_STATUSES[sess.status]?.color || 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {sess.intervention_type
                      ? INTERVENTION_LABELS[sess.intervention_type]
                      : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {sess.outcome ? SESSION_OUTCOMES.find((o) => o.value === sess.outcome)?.label : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {sess.follow_up_needed ? new Date(sess.follow_up_date).toLocaleDateString() : 'None'}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      onClick={() => navigate(`/counselor/session/${sess.id}`)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    );
  }

  // RENDER: Empty state
  return (
    <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
      <Typography variant="h6" sx={{ color: '#999' }}>
        No sessions found
      </Typography>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => setOpenCreateDialog(true)}
        sx={{ mt: 2 }}
      >
        Create First Session
      </Button>
    </Container>
  );
};

export default SessionManagement;
