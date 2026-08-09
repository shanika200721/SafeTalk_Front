import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import counselorService from '../../services/counselorService';
import { Sidebar } from '../../components/layout/Sidebar';

const riskColors = {
  LOW: 'success',
  MEDIUM: 'warning',
  HIGH: 'error',
  SEVERE: 'secondary',
};

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : 'N/A');

const AllStudentsView = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await counselorService.getAllStudents({ limit: 200 });
      setStudents(data.students || []);
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.error || 'Unable to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return students.filter((student) => {
      const matchesRisk = riskFilter === 'ALL' || student.risk_level === riskFilter;
      const matchesSearch =
        !needle ||
        [student.full_name, student.email, student.department, student.year_of_study?.toString()]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(needle));
      return matchesRisk && matchesSearch;
    });
  }, [riskFilter, search, students]);

  const pageRows = filteredStudents.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const exportCsv = () => {
    const header = ['Name', 'Email', 'Risk', 'Fusion', 'DASS21', 'Last Check-In', 'Open Reviews'];
    const rows = filteredStudents.map((student) => [
      student.full_name,
      student.email,
      student.risk_level || 'UNKNOWN',
      student.fusion_score ?? '',
      student.avg_dass21_score ?? '',
      formatDate(student.last_checkin),
      student.open_reviews ?? 0,
    ]);
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `assigned_students_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="student-shell">
        <Sidebar variant="counselor" />
        <main className="student-main">
          <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', pt: { xs: 6, lg: 0 } }}>
            <CircularProgress />
          </Box>
        </main>
      </div>
    );
  }

  return (
    <div className="student-shell">
      <Sidebar variant="counselor" />
      <main className="student-main">
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', pt: { xs: 6, lg: 0 } }}>
          <Container maxWidth="xl" sx={{ py: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', mb: 3 }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  Assigned Students
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Assignment-scoped student list with model output and human-review status kept separate.
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button startIcon={<RefreshIcon />} variant="outlined" onClick={fetchStudents}>
                  Refresh
                </Button>
                <Button startIcon={<DownloadIcon />} variant="outlined" onClick={exportCsv}>
                  CSV
                </Button>
              </Box>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                  size="small"
                  label="Search students"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(0);
                  }}
                  sx={{ minWidth: 280 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <InputLabel>Risk</InputLabel>
                  <Select
                    label="Risk"
                    value={riskFilter}
                    onChange={(event) => {
                      setRiskFilter(event.target.value);
                      setPage(0);
                    }}
                  >
                    {['ALL', 'LOW', 'MEDIUM', 'HIGH', 'SEVERE'].map((risk) => (
                      <MenuItem value={risk} key={risk}>
                        {risk}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Paper>

            <Paper sx={{ borderRadius: 2 }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Student</TableCell>
                      <TableCell>Department</TableCell>
                      <TableCell>Risk</TableCell>
                      <TableCell>Fusion</TableCell>
                      <TableCell>Evidence</TableCell>
                      <TableCell>DASS-21</TableCell>
                      <TableCell>Last Mood</TableCell>
                      <TableCell>Last Check-In</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pageRows.map((student) => (
                      <TableRow hover key={student.id}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {student.full_name || student.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {student.email}
                          </Typography>
                        </TableCell>
                        <TableCell>{student.department || 'N/A'}</TableCell>
                        <TableCell>
                          <Chip
                            label={student.risk_level || 'UNKNOWN'}
                            color={riskColors[student.risk_level] || 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{student.fusion_score ?? 'N/A'}</TableCell>
                        <TableCell>{student.evidence_coverage ?? 'N/A'}</TableCell>
                        <TableCell>{student.avg_dass21_score ?? 'N/A'}</TableCell>
                        <TableCell>{student.last_mood ?? 'N/A'}</TableCell>
                        <TableCell>{formatDate(student.last_checkin)}</TableCell>
                        <TableCell align="right">
                          <Tooltip title="Open student detail">
                            <IconButton size="small" onClick={() => navigate(`/counselor/student/${student.id}`)}>
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Download PDF report">
                            <IconButton size="small" onClick={() => counselorService.downloadStudentReport(student.id, 'pdf')}>
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                    {pageRows.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9}>
                          <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Typography color="text.secondary">No students match the current filters.</Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={filteredStudents.length}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={(event, nextPage) => setPage(nextPage)}
                onRowsPerPageChange={(event) => {
                  setRowsPerPage(Number(event.target.value));
                  setPage(0);
                }}
              />
            </Paper>
          </Container>
        </Box>
      </main>
    </div>
  );
};

export default AllStudentsView;
