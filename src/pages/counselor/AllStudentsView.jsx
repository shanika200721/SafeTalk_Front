import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  TextField,
  InputAdornment,
  Tooltip,
  IconButton,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Avatar,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Chat as ChatIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import counselorService from '../../services/counselorService';

const AllStudentsView = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // State management
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [statsData, setStatsData] = useState(null);

  // Fetch all students on mount
  useEffect(() => {
    fetchAllStudents();
  }, []);

  const fetchAllStudents = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all students and analytics
      const [studentsData, analyticsData] = await Promise.all([
        counselorService.getAllStudents({ limit: 1000 }),
        counselorService.getAnalyticsSummary({ days: 30 }),
      ]);

      setStudents(studentsData.students || []);
      setStatsData(analyticsData);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError(err.response?.data?.detail || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  // Filter and search students
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.id?.toString().includes(searchTerm);
    const matchesRisk = riskFilter === 'ALL' || student.risk_level === riskFilter;
    return matchesSearch && matchesRisk;
  });

  // Pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Risk Level', 'Avg DASS21', 'Department', 'Last Assessment'];
    const rows = filteredStudents.map(s => [
      s.id,
      s.full_name,
      s.email,
      s.risk_level || 'N/A',
      s.avg_dass21_score || 'N/A',
      s.department || 'N/A',
      formatDate(s.last_assessment),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const paginatedStudents = filteredStudents.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              All Students in System
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Total Students: {filteredStudents.length}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchAllStudents}
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExportCSV}
            >
              Export CSV
            </Button>
          </Box>
        </Box>

        {/* Quick Stats */}
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
                        Risk %
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                        {statsData.risk_percentage?.toFixed(1)}%
                      </Typography>
                    </Box>
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
                        Sessions
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                        {statsData.sessions_completed || 0}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Search and Filter */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              placeholder="Search by name, email, or ID..."
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
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Risk Level Filter</InputLabel>
              <Select
                value={riskFilter}
                label="Risk Level Filter"
                onChange={(e) => {
                  setRiskFilter(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="ALL">All Risk Levels</MenuItem>
                <MenuItem value="LOW">Low Risk</MenuItem>
                <MenuItem value="MEDIUM">Medium Risk</MenuItem>
                <MenuItem value="HIGH">High Risk</MenuItem>
                <MenuItem value="SEVERE">Severe Risk</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Students Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      ) : filteredStudents.length === 0 ? (
        <Alert severity="info">No students found matching your criteria.</Alert>
      ) : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Risk Level</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Avg DASS21</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Department</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Last Assessment</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedStudents.map((student) => (
                  <TableRow key={student.id} hover>
                    <TableCell>#{student.id}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {student.full_name?.charAt(0).toUpperCase()}
                        </Avatar>
                        {student.full_name}
                      </Box>
                    </TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={student.risk_level || 'N/A'}
                        size="small"
                        sx={{
                          backgroundColor: getRiskLevelColor(student.risk_level),
                          color: 'white',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {student.avg_dass21_score ? `${student.avg_dass21_score.toFixed(1)}` : 'N/A'}
                    </TableCell>
                    <TableCell>{student.department || 'N/A'}</TableCell>
                    <TableCell>
                      {formatDate(student.last_assessment)}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View Profile & Analysis">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedStudent(student);
                            setDetailsDialogOpen(true);
                          }}
                          color="primary"
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View Profile">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/counselor/student/${student.id}/profile`)}
                          color="primary"
                        >
                          <AssessmentIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Chat with Student">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/counselor/chat?student=${student.id}`)}
                          color="primary"
                        >
                          <ChatIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50, 100]}
            component="div"
            count={filteredStudents.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      )}

      {/* Quick View Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Student Quick View</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedStudent && (
            <Box>
              <Typography variant="body2" gutterBottom>
                <strong>ID:</strong> {selectedStudent.id}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Name:</strong> {selectedStudent.full_name}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Email:</strong> {selectedStudent.email}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Department:</strong> {selectedStudent.department || 'N/A'}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Risk Level:</strong>{' '}
                <Chip
                  label={selectedStudent.risk_level || 'N/A'}
                  size="small"
                  sx={{
                    backgroundColor: getRiskLevelColor(selectedStudent.risk_level),
                    color: 'white',
                  }}
                />
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Avg DASS21:</strong> {selectedStudent.avg_dass21_score ? selectedStudent.avg_dass21_score.toFixed(1) : 'N/A'}
              </Typography>
              <Typography variant="body2">
                <strong>Last Assessment:</strong> {formatDate(selectedStudent.last_assessment)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              navigate(`/counselor/student/${selectedStudent.id}/profile`);
              setDetailsDialogOpen(false);
            }}
            startIcon={<VisibilityIcon />}
          >
            View Full Profile
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AllStudentsView;
