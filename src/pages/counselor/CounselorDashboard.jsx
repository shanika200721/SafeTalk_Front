import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import counselorService from '../../services/counselorService';

const riskColors = {
  LOW: '#2e7d32',
  MEDIUM: '#ed6c02',
  HIGH: '#d32f2f',
  SEVERE: '#6a1b9a',
  UNKNOWN: '#607d8b',
};

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : 'N/A');
const pct = (value) => `${Math.round((value || 0) * 100)}%`;

const CounselorDashboard = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [dashboardData, studentData] = await Promise.all([
        counselorService.getDashboard(),
        counselorService.getAllStudents({ limit: 100 }),
      ]);
      setDashboard(dashboardData);
      setStudents(studentData.students || []);
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.error || 'Unable to load counselor dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredStudents = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return students;
    return students.filter((student) =>
      [student.full_name, student.email, student.department, student.risk_level]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(needle)),
    );
  }, [students, search]);

  if (loading) {
    return (
      <Box sx={{ minHeight: '70vh', display: 'grid', placeItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Counselor Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Assignment-scoped view for review, follow-up, and student reports
          </Typography>
        </Box>
        <Button startIcon={<RefreshIcon />} variant="outlined" onClick={fetchData}>
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          ['Assigned Students', dashboard?.assigned_students ?? 0],
          ['Average DASS-21', dashboard?.average_dass21 ?? 0],
          ['Average Mood', dashboard?.average_mood ?? 0],
          ['Review Completion', pct(dashboard?.review_completion_rate)],
          ['Follow-Up Rate', pct(dashboard?.follow_up_rate)],
        ].map(([label, value]) => (
          <Grid item xs={12} sm={6} md={2.4} key={label}>
            <Card sx={{ borderRadius: 2, height: '100%' }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  {label}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, mt: 1 }}>
                  {value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 2, borderRadius: 2, height: 340 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Mood, Stress, and Fusion Trend
            </Typography>
            <ResponsiveContainer width="100%" height="82%">
              <LineChart data={dashboard?.charts?.trend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip />
                <Legend />
                <Line type="monotone" dataKey="mood" stroke="#1976d2" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="stress" stroke="#ed6c02" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="fusion" stroke="#7b1fa2" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2, borderRadius: 2, height: 340 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Assessment Completion
            </Typography>
            <ResponsiveContainer width="100%" height="82%">
              <BarChart data={dashboard?.charts?.assessment_completion || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <ChartTooltip />
                <Bar dataKey="value" fill="#1976d2" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2, borderRadius: 2, height: 340 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Risk Distribution
            </Typography>
            <ResponsiveContainer width="100%" height="82%">
              <PieChart>
                <Pie data={dashboard?.charts?.risk_distribution || []} dataKey="value" nameKey="name" outerRadius={92} label>
                  {(dashboard?.charts?.risk_distribution || []).map((entry) => (
                    <Cell key={entry.name} fill={riskColors[entry.name] || riskColors.UNKNOWN} />
                  ))}
                </Pie>
                <ChartTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ borderRadius: 2 }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="h6">Assigned Student List</Typography>
            <Typography variant="body2" color="text.secondary">
              Students visible here are limited by counselor assignment unless the account is admin.
            </Typography>
          </Box>
          <TextField
            size="small"
            label="Search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Risk</TableCell>
                <TableCell>Fusion</TableCell>
                <TableCell>DASS-21</TableCell>
                <TableCell>Last Check-In</TableCell>
                <TableCell>Open Reviews</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow hover key={student.id}>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {student.full_name || student.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {student.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={student.risk_level || 'UNKNOWN'}
                      sx={{ bgcolor: riskColors[student.risk_level || 'UNKNOWN'], color: 'white' }}
                    />
                  </TableCell>
                  <TableCell>{student.fusion_score ?? 'N/A'}</TableCell>
                  <TableCell>{student.avg_dass21_score ?? 'N/A'}</TableCell>
                  <TableCell>{formatDate(student.last_checkin)}</TableCell>
                  <TableCell>{student.open_reviews}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="View student detail">
                      <IconButton onClick={() => navigate(`/counselor/student/${student.id}`)} size="small">
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Download PDF report">
                      <IconButton onClick={() => counselorService.downloadStudentReport(student.id, 'pdf')} size="small">
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {filteredStudents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                      <AssessmentIcon color="disabled" />
                      <Typography color="text.secondary">No assigned students found.</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default CounselorDashboard;
