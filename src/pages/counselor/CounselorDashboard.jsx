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
  TextField,
  InputAdornment,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Avatar,
  Divider,
  Snackbar,
} from '@mui/material';
import {
  Search as SearchIcon,
  Warning as WarningIcon,
  Visibility as VisibilityIcon,
  FileDownload as FileDownloadIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Menu as MenuIcon,
  Sort as SortIcon,
  FilterList as FilterListIcon,
  Chat as ChatIcon,
  Videocam as VideocamIcon,
  VideocamOff as VideocamOffIcon,
  Close as CloseIcon,
  EmojiEmotions as EmojiEmotionsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import counselorService from '../../services/counselorService';
import FacialEmotionDetection from '../../components/FacialEmotionDetection';

const CounselorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // State management
  const [students, setStudents] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [alertsPage, setAlertsPage] = useState(0);
  const [alertsRowsPerPage, setAlertsRowsPerPage] = useState(5);
  const [sortBy, setSortBy] = useState('name');
  const [statsData, setStatsData] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');
  const [emotionDialogOpen, setEmotionDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch dashboard data on mount
  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch high-risk users, alerts, and analytics in parallel
      const [highRiskData, alertsData, analyticsData] = await Promise.all([
        counselorService.getHighRiskUsers({ risk_level: 'HIGH', limit: 100 }),
        counselorService.getAlerts({ limit: 50 }),
        counselorService.getAnalyticsSummary({ days: 30 }),
      ]);

      setStudents(highRiskData.high_risk_users || []);
      setAlerts(alertsData.alerts || []);
      setStatsData(analyticsData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.detail || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Camera management
  const handleOpenCamera = async () => {
    setCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setSnackbar({
        open: true,
        message: 'Failed to access camera',
        severity: 'error',
      });
    }
  };

  const handleCloseCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setCameraOpen(false);
  };

  const handleToggleCamera = () => {
    if (cameraActive && streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setCameraActive(!cameraActive);
    }
  };

  // Session management
  const handleCreateSession = async () => {
    if (!selectedStudent) return;
    try {
      await counselorService.createSession({
        user_id: selectedStudent.user_id,
        counselor_notes: sessionNotes,
      });
      setSnackbar({
        open: true,
        message: 'Session created successfully',
        severity: 'success',
      });
      setSessionDialogOpen(false);
      setSessionNotes('');
    } catch (err) {
      console.error('Error creating session:', err);
      setSnackbar({
        open: true,
        message: 'Failed to create session',
        severity: 'error',
      });
    }
  };

  // Alert management
  const handleMarkAlertAsRead = async (alertId) => {
    try {
      await counselorService.markAlertAsRead(alertId);
      setAlerts(alerts.map(a => a.id === alertId ? { ...a, is_read: true } : a));
    } catch (err) {
      console.error('Error marking alert as read:', err);
    }
  };

  // Filter and search students
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = riskFilter === 'ALL' || student.risk_level === riskFilter;
    return matchesSearch && matchesRisk;
  });

  // Sort students
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name?.localeCompare(b.name);
    } else if (sortBy === 'risk') {
      const riskOrder = { 'SEVERE': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };
      return (riskOrder[a.risk_level] || 999) - (riskOrder[b.risk_level] || 999);
    } else if (sortBy === 'recent') {
      return new Date(b.last_assessment) - new Date(a.last_assessment);
    }
    return 0;
  });

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeAlertsPage = (event, newPage) => {
    setAlertsPage(newPage);
  };

  const handleChangeAlertsRowsPerPage = (event) => {
    setAlertsRowsPerPage(parseInt(event.target.value, 10));
    setAlertsPage(0);
  };

  // Get risk level color
  const getRiskLevelColor = (riskLevel) => {
    const colors = {
      'LOW': '#4CAF50',
      'MEDIUM': '#FF9800',
      'HIGH': '#F44336',
      'SEVERE': '#9C27B0',
    };
    return colors[riskLevel] || '#757575';
  };

  const paginatedStudents = sortedStudents.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const paginatedAlerts = alerts.slice(
    alertsPage * alertsRowsPerPage,
    alertsPage * alertsRowsPerPage + alertsRowsPerPage
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Counselor Dashboard
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Welcome, {user?.full_name || 'Counselor'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<PeopleIcon />}
              onClick={() => navigate('/counselor/students')}
              sx={{ backgroundColor: '#667eea' }}
            >
              View All Students
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchDashboardData}
            >
              Refresh
            </Button>
          </Box>
        </Box>

        {/* Quick Stats Cards */}
        {statsData && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography color="rgba(255,255,255,0.7)" gutterBottom>
                        Total Students
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                        {statsData.total_students || 0}
                      </Typography>
                    </Box>
                    <PeopleIcon sx={{ fontSize: 40, opacity: 0.5 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography color="rgba(255,255,255,0.7)" gutterBottom>
                        At-Risk Students
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                        {statsData.at_risk_students || 0}
                      </Typography>
                    </Box>
                    <WarningIcon sx={{ fontSize: 40, opacity: 0.5 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white',
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography color="rgba(255,255,255,0.7)" gutterBottom>
                        Sessions
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                        {statsData.sessions_completed || 0}
                      </Typography>
                    </Box>
                    <CheckCircleIcon sx={{ fontSize: 40, opacity: 0.5 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{
                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                color: 'white',
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography color="rgba(255,255,255,0.7)" gutterBottom>
                        Risk %
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                        {statsData.risk_percentage?.toFixed(1)}%
                      </Typography>
                    </Box>
                    <TrendingUpIcon sx={{ fontSize: 40, opacity: 0.5 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert
          severity="error"
          onClose={() => setError(null)}
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
      )}

      {/* Tabs Navigation */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Student Alerts
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Alerts Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      ) : alerts.length === 0 ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          No alerts at this time.
        </Alert>
      ) : (
        <Paper sx={{ mb: 4 }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Student</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Alert Type</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Severity</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedAlerts.map((alert) => (
                  <TableRow key={alert.id} hover>
                    <TableCell>{alert.student_name}</TableCell>
                    <TableCell>{alert.alert_type || 'Risk Alert'}</TableCell>
                    <TableCell>
                      <Chip
                        label={alert.severity || 'HIGH'}
                        size="small"
                        sx={{
                          backgroundColor: getRiskLevelColor(alert.severity),
                          color: 'white',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(alert.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Mark as Read">
                        <IconButton
                          size="small"
                          onClick={() => handleMarkAlertAsRead(alert.id)}
                          color={alert.is_read ? 'default' : 'primary'}
                        >
                          <CheckCircleIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 20]}
            component="div"
            count={alerts.length}
            rowsPerPage={alertsRowsPerPage}
            page={alertsPage}
            onPageChange={handleChangeAlertsPage}
            onRowsPerPageChange={handleChangeAlertsRowsPerPage}
          />
        </Paper>
      )}

      {/* Search and Filter Bar */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
          High-Risk Students
        </Typography>
      </Box>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Risk Level</InputLabel>
              <Select
                value={riskFilter}
                label="Risk Level"
                onChange={(e) => {
                  setRiskFilter(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="ALL">All Levels</MenuItem>
                <MenuItem value="LOW">Low Risk</MenuItem>
                <MenuItem value="MEDIUM">Medium Risk</MenuItem>
                <MenuItem value="HIGH">High Risk</MenuItem>
                <MenuItem value="SEVERE">Severe Risk</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="name">Name (A-Z)</MenuItem>
                <MenuItem value="risk">Risk Level</MenuItem>
                <MenuItem value="recent">Recent Assessment</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Students Table */}
      {filteredStudents.length === 0 ? (
        <Alert severity="info">
          No students found matching your criteria.
        </Alert>
      ) : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Risk Level</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Score</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Last Assessment</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedStudents.map((student) => (
                  <TableRow key={student.user_id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {student.name?.charAt(0).toUpperCase()}
                        </Avatar>
                        {student.name}
                      </Box>
                    </TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={student.risk_level}
                        size="small"
                        sx={{
                          backgroundColor: getRiskLevelColor(student.risk_level),
                          color: 'white',
                        }}
                      />
                    </TableCell>
                    <TableCell>{student.composite_score?.toFixed(1)}%</TableCell>
                    <TableCell>
                      {new Date(student.last_assessment).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View Profile">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/counselor/student/${student.user_id}`)}
                          color="primary"
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Send Message">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/counselor/chat?student=${student.user_id}`)}
                          color="primary"
                        >
                          <ChatIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Create Session">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedStudent(student);
                            setSessionDialogOpen(true);
                          }}
                          color="primary"
                        >
                          <AddIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Generate Report">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedStudent(student);
                            setDetailsDialogOpen(true);
                          }}
                          color="secondary"
                        >
                          <FileDownloadIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredStudents.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      )}

      {/* Camera Preview Dialog */}
      <Dialog
        open={cameraOpen}
        onClose={handleCloseCamera}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Camera Preview
          <IconButton onClick={handleCloseCamera} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{
              width: '100%',
              borderRadius: '8px',
              backgroundColor: '#000',
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            startIcon={cameraActive ? <VideocamIcon /> : <VideocamOffIcon />}
            onClick={handleToggleCamera}
          >
            {cameraActive ? 'Turn Off' : 'Turn On'}
          </Button>
          <Button onClick={handleCloseCamera}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Session Creation Dialog */}
      <Dialog
        open={sessionDialogOpen}
        onClose={() => setSessionDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create Counseling Session</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedStudent && (
            <Box>
              <Typography variant="body2" gutterBottom>
                <strong>Student:</strong> {selectedStudent.name}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Session Notes"
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="Enter notes for this session..."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSessionDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateSession}
          >
            Create Session
          </Button>
        </DialogActions>
      </Dialog>

      {/* Emotion Detection Dialog */}
      <Dialog
        open={emotionDialogOpen}
        onClose={() => setEmotionDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Facial Emotion Detection
          <IconButton onClick={() => setEmotionDialogOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <FacialEmotionDetection />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEmotionDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Student Details Dialog */}
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Student Quick View</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedStudent && (
            <Box>
              <Typography variant="body2" gutterBottom>
                <strong>Name:</strong> {selectedStudent.name}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Email:</strong> {selectedStudent.email}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Risk Level:</strong>
                {' '}
                <Chip
                  label={selectedStudent.risk_level}
                  size="small"
                  sx={{
                    backgroundColor: getRiskLevelColor(selectedStudent.risk_level),
                    color: 'white',
                  }}
                />
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Composite Score:</strong> {selectedStudent.composite_score?.toFixed(1)}%
              </Typography>
              <Typography variant="body2">
                <strong>Last Assessment:</strong> {new Date(selectedStudent.last_assessment).toLocaleString()}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              navigate(`/counselor/student/${selectedStudent.user_id}`);
              setDetailsDialogOpen(false);
            }}
            startIcon={<VisibilityIcon />}
          >
            View Full Profile
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Buttons */}
      <Box sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}>
        <Tooltip title="Open Camera">
          <IconButton
            size="large"
            sx={{
              backgroundColor: '#667eea',
              color: 'white',
              '&:hover': { backgroundColor: '#5568d3' },
            }}
            onClick={handleOpenCamera}
          >
            <VideocamIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Facial Emotion Detection">
          <IconButton
            size="large"
            sx={{
              backgroundColor: '#f093fb',
              color: 'white',
              '&:hover': { backgroundColor: '#e073d9' },
            }}
            onClick={() => setEmotionDialogOpen(true)}
          >
            <EmojiEmotionsIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="View Alerts">
          <IconButton
            size="large"
            sx={{
              backgroundColor: '#f5576c',
              color: 'white',
              '&:hover': { backgroundColor: '#d94555' },
            }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <WarningIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Snackbar Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Container>
  );
};

export default CounselorDashboard;
