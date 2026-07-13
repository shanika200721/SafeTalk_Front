import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Alert,
  Chip,
  LinearProgress,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  People as PeopleIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  Videocam as VideocamIcon,
  VideocamOff as VideocamOffIcon,
  Close as CloseIcon,
  VideoCall as VideoCallIcon,
  Visibility as VisibilityIcon,
  EmojiEmotions as EmotionsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import counselorService from '../../services/counselorService';
import { useAuth } from '../../context/AuthContext';
import FacialEmotionDetection from '../../components/FacialEmotionDetection';

/**
 * COMPONENT: CounselorDashboardOverview
 * 
 * PURPOSE:
 * - Display counselor's main dashboard with key metrics
 * - Show real-time data from database via API
 * - Display recent high-risk alerts
 * - Provide quick access to high-risk students
 * 
 * DATABASE CONNECTION:
 * - Fetches from: /api/counselor/analytics/summary
 * - Fetches from: /api/counselor/alerts
 * - Fetches from: /api/counselor/high-risk-users
 * 
 * HOW IT WORKS:
 * 1. Component mounts → useEffect triggers
 * 2. Calls 3 API endpoints to fetch data
 * 3. Displays metrics cards, alert table, student table
 * 4. Real-time updates every 5 minutes
 * 5. User can click on alerts/students to view details
 */

const CounselorDashboardOverview = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // STATE FOR ANALYTICS DATA
  const [analytics, setAnalytics] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [highRiskUsers, setHighRiskUsers] = useState([]);
  
  // STATE FOR LOADING & ERRORS
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // STATE FOR SESSION CREATION DIALOG
  const [openSessionDialog, setOpenSessionDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [sessionNotes, setSessionNotes] = useState('');
  const [creatingSession, setCreatingSession] = useState(false);

  // STATE FOR CAMERA ACCESS
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // STATE FOR FACIAL EMOTION DETECTION
  const [facialEmotionOpen, setFacialEmotionOpen] = useState(false);

  /**
   * FETCH ALL DASHBOARD DATA
   * Called on component mount and when user clicks refresh
   */
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📡 Fetching dashboard data...');

      // Fetch all data in parallel for better performance
      const [analyticsData, alertsData, highRiskData] = await Promise.all([
        counselorService.getAnalyticsSummary({ days: 30 }),
        counselorService.getAlerts({ unread_only: false, limit: 10 }),
        counselorService.getHighRiskUsers({ limit: 10 }),
      ]);

      console.log('✅ Data fetched successfully:', { analyticsData, alertsData, highRiskData });
      setAnalytics(analyticsData);
      setAlerts(alertsData?.alerts || []);  // Extract alerts array from nested response
      setHighRiskUsers(highRiskData?.high_risk_users || []);  // Extract high_risk_users array from nested response
    } catch (err) {
      console.error('❌ Error fetching dashboard data:', err);
      console.error('Error details:', { message: err.message, response: err.response?.data });
      setError('Failed to load dashboard data. Please check console for details.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * LIFECYCLE: Fetch data when component mounts
   */
  useEffect(() => {
    console.log('🎯 DashboardOverview component mounted');
    console.log('👤 Current user:', user);
    fetchDashboardData();

    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  /**
   * HANDLE: Create new counselor session with student
   */
  const handleCreateSession = async () => {
    if (!selectedStudent) return;

    try {
      setCreatingSession(true);
      
      const sessionData = {
        user_id: selectedStudent.user_id || selectedStudent.id,
        session_type: 'auto_escalated',
        risk_level_at_escalation: selectedStudent.risk_level || 'HIGH',
        counselor_notes: sessionNotes,
      };

      const response = await counselorService.createSession(sessionData);
      
      // Refresh data after creating session
      await fetchDashboardData();
      
      setOpenSessionDialog(false);
      setSelectedStudent(null);
      setSessionNotes('');
      
      // Navigate to session details
      navigate(`/counselor/sessions/${response.id}`);
    } catch (err) {
      console.error('Error creating session:', err);
      setError('Failed to create session. Please try again.');
    } finally {
      setCreatingSession(false);
    }
  };

  /**
   * HANDLE: Mark alert as read
   */
  const handleMarkAlertAsRead = async (alertId) => {
    try {
      await counselorService.markAlertAsRead(alertId);
      setAlerts(alerts.map(a => a.id === alertId ? { ...a, is_read: true } : a));
    } catch (err) {
      console.error('Error marking alert as read:', err);
    }
  };

  /**
   * HANDLE: Open camera preview dialog (with live view)
   */
  const handleOpenCameraPreview = async () => {
    try {
      setCameraError(null);
      setCameraOpen(true);
      
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      streamRef.current = stream;

      // Attach stream to video element when it's ready
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
        console.log('✅ Camera preview opened successfully');
      }
    } catch (err) {
      console.error('❌ Error accessing camera:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera access denied. Please allow camera access in your browser settings.'
          : 'Failed to access camera. Please ensure your device has a camera.'
      );
      setCameraActive(false);
    }
  };

  /**
   * HANDLE: Simple camera toggle (ON/OFF without preview)
   */
  const handleToggleCameraSimple = async () => {
    if (cameraActive) {
      // Turn OFF
      handleCloseCameraPreview();
    } else {
      // Turn ON (without showing preview)
      try {
        setCameraError(null);
        
        // Request camera access
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });

        streamRef.current = stream;
        setCameraActive(true);
        console.log('✅ Camera turned ON (background mode)');
      } catch (err) {
        console.error('❌ Error accessing camera:', err);
        setCameraError(
          err.name === 'NotAllowedError'
            ? 'Camera access denied.'
            : 'Failed to access camera.'
        );
        setCameraActive(false);
      }
    }
  };

  /**
   * HANDLE: Close camera preview dialog
   */
  const handleCloseCameraPreview = () => {
    try {
      // Stop all tracks in the stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
        streamRef.current = null;
      }

      // Clear video element
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      setCameraActive(false);
      setCameraOpen(false);
      setCameraError(null);
      console.log('✅ Camera closed successfully');
    } catch (err) {
      console.error('Error closing camera:', err);
    }
  };

  /**
   * CLEANUP: Stop camera stream on component unmount
   */
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, []);

  // RENDER: Loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress size={60} />
        <Typography sx={{ mt: 2 }}>Loading dashboard data...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* HEADER */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
            👋 Welcome, {user?.full_name}
          </Typography>
          <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
            Counselor Dashboard - Real-time Student Mental Health Overview
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tooltip title="Chat with students">
            <Button
              variant="outlined"
              color="success"
              startIcon={<MoreVertIcon />}
              onClick={() => navigate('/counselor/chat')}
              sx={{
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: '#e8f5e9',
                  transform: 'scale(1.05)',
                },
              }}
            >
              💬 Student Chat
            </Button>
          </Tooltip>
          <Tooltip title="Analyze mood from facial expression">
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<EmotionsIcon />}
              onClick={() => setFacialEmotionOpen(true)}
              sx={{
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: '#f3e5f5',
                  transform: 'scale(1.05)',
                },
              }}
            >
              😊 Mood Analysis
            </Button>
          </Tooltip>
          <Tooltip title="Preview camera with live view">
            <Button
              variant="outlined"
              color="primary"
              startIcon={<VisibilityIcon />}
              onClick={handleOpenCameraPreview}
              sx={{
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: '#e3f2fd',
                  transform: 'scale(1.05)',
                },
              }}
            >
              👁️ Preview Camera
            </Button>
          </Tooltip>
          <Tooltip title={cameraActive ? '🔴 Camera is ON - Click to turn OFF' : '⚪ Camera is OFF - Click to turn ON'}>
            <Button
              variant={cameraActive ? 'contained' : 'outlined'}
              color={cameraActive ? 'error' : 'primary'}
              startIcon={cameraActive ? <VideocamOffIcon /> : <VideocamIcon />}
              onClick={handleToggleCameraSimple}
              sx={{
                transition: 'all 0.3s ease',
                backgroundColor: cameraActive ? '#ef5350' : 'transparent',
                borderColor: cameraActive ? '#ef5350' : '#1976d2',
                color: cameraActive ? 'white' : '#1976d2',
                '&:hover': {
                  backgroundColor: cameraActive ? '#e53935' : '#f5f5f5',
                  borderColor: cameraActive ? '#e53935' : '#1565c0',
                  transform: 'scale(1.05)',
                },
                fontWeight: 'bold',
                boxShadow: cameraActive ? '0 0 15px rgba(239, 83, 80, 0.5)' : 'none',
              }}
            >
              {cameraActive ? '🎥 Camera OFF' : '📹 Camera ON'}
            </Button>
          </Tooltip>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchDashboardData}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* ERROR MESSAGE */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* METRICS CARDS ROW */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {/* Card 1: Total Students */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Total Students
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
                    {analytics?.total_students || 0}
                  </Typography>
                </Box>
                <PeopleIcon sx={{ fontSize: 50, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Card 2: At-Risk Students */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    At-Risk Students
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
                    {analytics?.at_risk_students || 0}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    ({analytics?.risk_percentage || 0}%)
                  </Typography>
                </Box>
                <WarningIcon sx={{ fontSize: 50, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Card 3: Sessions This Month */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Sessions This Month
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
                    {analytics?.counselor_sessions || 0}
                  </Typography>
                </Box>
                <CheckCircleIcon sx={{ fontSize: 50, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Card 4: Completed Sessions */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Completed Sessions
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
                    {analytics?.sessions_completed || 0}
                  </Typography>
                </Box>
                <TrendingIcon sx={{ fontSize: 50, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* ALERTS SECTION */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
          🚨 Recent High-Risk Alerts (Latest 10)
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell><strong>Student</strong></TableCell>
                <TableCell><strong>Alert Type</strong></TableCell>
                <TableCell><strong>Risk Level</strong></TableCell>
                <TableCell><strong>Message</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Action</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {alerts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 3 }}>
                    <Typography sx={{ color: '#999' }}>
                      No recent alerts - All students appear to be in good condition
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                alerts.map((alert) => (
                  <TableRow key={alert.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                    <TableCell>{alert.student_name}</TableCell>
                    <TableCell>
                      <Chip
                        label={alert.alert_type}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={alert.risk_level}
                        size="small"
                        color={alert.risk_level === 'CRITICAL' ? 'error' : 'warning'}
                      />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 300 }}>{alert.message}</TableCell>
                    <TableCell>
                      <Chip
                        label={alert.is_read ? 'Read' : 'Unread'}
                        size="small"
                        variant={alert.is_read ? 'filled' : 'outlined'}
                        color={alert.is_read ? 'default' : 'warning'}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => {
                          navigate(`/counselor/student/${alert.user_id}`);
                        }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* HIGH-RISK STUDENTS SECTION */}
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
          ⚠️ High-Risk Students (Requiring Attention)
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell><strong>Student Name</strong></TableCell>
                <TableCell><strong>Risk Level</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Last Check-in</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {highRiskUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: 'center', py: 3 }}>
                    <Typography sx={{ color: '#999' }}>
                      No high-risk students at this time
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                highRiskUsers.map((student) => (
                  <TableRow key={student.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>{student.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={student.risk_level || 'UNKNOWN'}
                        color={student.risk_level === 'CRITICAL' ? 'error' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.last_assessment ? new Date(student.last_assessment).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="outlined"
                        sx={{ mr: 1 }}
                        onClick={() => navigate(`/counselor/student/${student.id}`)}
                      >
                        View Dashboard
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => {
                          setSelectedStudent(student);
                          setOpenSessionDialog(true);
                        }}
                      >
                        Start Session
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* CAMERA DIALOG */}
      <Dialog open={cameraOpen} onClose={handleCloseCameraPreview} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <VideocamIcon />
            <span>Device Camera Preview</span>
          </Box>
          <Button onClick={handleCloseCameraPreview} color="error" size="small">
            <CloseIcon />
          </Button>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', py: 2 }}>
          {cameraError ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {cameraError}
            </Alert>
          ) : null}
          <Box
            sx={{
              width: '100%',
              maxWidth: '100%',
              borderRadius: 2,
              overflow: 'hidden',
              backgroundColor: '#000',
              minHeight: 400,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: 8,
              }}
            />
          </Box>
          <Typography variant="body2" sx={{ mt: 2, color: '#666' }}>
            {cameraActive ? '✅ Camera is ON' : '⚠️ Camera is OFF'}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ pb: 2, pr: 2 }}>
          <Button onClick={handleCloseCameraPreview} variant="contained" color="error">
            Close Preview
          </Button>
        </DialogActions>
      </Dialog>

      {/* SESSION CREATION DIALOG */}
      <Dialog open={openSessionDialog} onClose={() => setOpenSessionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Counselor Session</DialogTitle>
        <DialogContent>
          {selectedStudent && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>Student:</strong> {selectedStudent.name}
              </Typography>
              <Typography variant="body2" sx={{ mb: 3 }}>
                <strong>Risk Level:</strong> {selectedStudent.risk_level || 'UNKNOWN'}
              </Typography>
              <TextField
                fullWidth
                label="Session Notes"
                multiline
                rows={4}
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="Document your initial observations and concerns..."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSessionDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreateSession}
            variant="contained"
            disabled={creatingSession}
          >
            {creatingSession ? 'Creating...' : 'Create Session'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* FACIAL EMOTION DETECTION DIALOG */}
      <FacialEmotionDetection
        open={facialEmotionOpen}
        onClose={() => setFacialEmotionOpen(false)}
      />
    </Container>
  );
};

export default CounselorDashboardOverview;
