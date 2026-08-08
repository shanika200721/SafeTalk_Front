import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
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
  LinearProgress,
  Paper,
  Stack,
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
  EventAvailable as EventAvailableIcon,
  FactCheck as FactCheckIcon,
  Groups as GroupsIcon,
  HealthAndSafety as HealthAndSafetyIcon,
  Insights as InsightsIcon,
  MonitorHeart as MonitorHeartIcon,
  PersonSearch as PersonSearchIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  Visibility as VisibilityIcon,
  WarningAmber as WarningAmberIcon,
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

const riskPalette = {
  LOW: { main: '#15803d', soft: '#dcfce7', text: '#14532d' },
  MEDIUM: { main: '#ca8a04', soft: '#fef9c3', text: '#713f12' },
  HIGH: { main: '#dc2626', soft: '#fee2e2', text: '#7f1d1d' },
  SEVERE: { main: '#7e22ce', soft: '#f3e8ff', text: '#581c87' },
  UNKNOWN: { main: '#64748b', soft: '#f1f5f9', text: '#334155' },
};

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : 'N/A');
const pct = (value) => `${Math.round((value || 0) * 100)}%`;
const scoreOrNA = (value) => (value === null || value === undefined ? 'N/A' : value);

const chartCardSx = {
  p: 2.25,
  borderRadius: 2,
  height: 360,
  border: '1px solid rgba(15, 23, 42, 0.08)',
  boxShadow: '0 18px 45px rgba(15, 23, 42, 0.08)',
  background: '#ffffff',
};

const tableHeadSx = {
  '& .MuiTableCell-head': {
    bgcolor: '#f8fafc',
    color: '#475569',
    fontSize: '0.74rem',
    fontWeight: 800,
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
};

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

  const highPriorityCount = students.filter((student) =>
    ['HIGH', 'SEVERE'].includes(student.risk_level),
  ).length;
  const openReviewCount = students.reduce(
    (total, student) => total + Number(student.open_reviews || 0),
    0,
  );
  const recentlyCheckedIn = students.filter((student) => {
    if (!student.last_checkin) return false;
    const diffMs = Date.now() - new Date(student.last_checkin).getTime();
    return diffMs >= 0 && diffMs <= 7 * 24 * 60 * 60 * 1000;
  }).length;
  const riskDistribution = dashboard?.charts?.risk_distribution || [];
  const trendData = dashboard?.charts?.trend || [];
  const completionData = dashboard?.charts?.assessment_completion || [];
  const topPriorityStudents = students
    .filter((student) => ['HIGH', 'SEVERE'].includes(student.risk_level))
    .slice(0, 4);
  const coverageRate = students.length ? recentlyCheckedIn / students.length : 0;
  const todayLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const MetricCard = ({ label, value, note, icon, color = '#0f766e' }) => (
    <Card
      sx={{
        height: '100%',
        borderRadius: 2,
        border: '1px solid rgba(15, 23, 42, 0.08)',
        boxShadow: '0 16px 40px rgba(15, 23, 42, 0.08)',
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Box>
            <Typography sx={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 800 }}>
              {label}
            </Typography>
            <Typography sx={{ color: '#0f172a', fontSize: '2rem', lineHeight: 1, fontWeight: 900, mt: 1 }}>
              {value}
            </Typography>
          </Box>
          <Avatar sx={{ bgcolor: `${color}18`, color, width: 46, height: 46 }}>
            {icon}
          </Avatar>
        </Stack>
        {note && (
          <Typography sx={{ color: '#64748b', fontSize: '0.82rem', mt: 2 }}>
            {note}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  const SectionTitle = ({ eyebrow, title, action }) => (
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ mb: 2 }}>
      <Box>
        <Typography sx={{ color: '#0f766e', fontSize: '0.74rem', fontWeight: 900, letterSpacing: 0, textTransform: 'uppercase' }}>
          {eyebrow}
        </Typography>
        <Typography variant="h6" sx={{ color: '#0f172a', fontWeight: 900 }}>
          {title}
        </Typography>
      </Box>
      {action}
    </Stack>
  );

  if (loading) {
    return (
      <Box sx={{ minHeight: '70vh', display: 'grid', placeItems: 'center', bgcolor: '#f8fafc' }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />
          <Typography sx={{ color: '#64748b', fontWeight: 700 }}>
            Loading counselor dashboard...
          </Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#eef7f6' }}>
      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3.5 } }}>
        <Paper
          sx={{
            p: { xs: 2.5, md: 4 },
            mb: 3,
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid rgba(13, 148, 136, 0.16)',
            boxShadow: '0 24px 70px rgba(15, 23, 42, 0.12)',
            background:
              'linear-gradient(135deg, #0f766e 0%, #0d9488 58%, #14b8a6 100%)',
            color: '#ffffff',
          }}
        >
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'center' }}
            spacing={3}
          >
            <Box sx={{ maxWidth: 760 }}>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 900, letterSpacing: 0, textTransform: 'uppercase', opacity: 0.86 }}>
                Counselor Workspace
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: 0, mt: 0.75 }}>
                Student Support Dashboard
              </Typography>
              <Typography sx={{ maxWidth: 680, mt: 1.25, color: 'rgba(255,255,255,0.88)', fontSize: '1rem', lineHeight: 1.7 }}>
                Monitor assigned students, review wellbeing signals, and move quickly
                from risk visibility to supportive follow-up.
              </Typography>
            </Box>

            <Stack spacing={1.25} alignItems={{ xs: 'stretch', sm: 'flex-end' }} sx={{ width: { xs: '100%', md: 'auto' } }}>
              <Chip
                icon={<EventAvailableIcon />}
                label={todayLabel}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.18)',
                  color: '#ffffff',
                  fontWeight: 800,
                  '& .MuiChip-icon': { color: '#ffffff' },
                }}
              />
              <Button
                startIcon={<RefreshIcon />}
                variant="contained"
                onClick={fetchData}
                sx={{
                  bgcolor: '#ffffff',
                  color: '#0f766e',
                  fontWeight: 900,
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#ecfeff', boxShadow: 'none' },
                }}
              >
                Refresh
              </Button>
            </Stack>
          </Stack>
        </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} lg={2.4}>
          <MetricCard
            label="Assigned Students"
            value={dashboard?.assigned_students ?? students.length}
            note={`${filteredStudents.length} visible after search`}
            icon={<GroupsIcon />}
            color="#0f766e"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={2.4}>
          <MetricCard
            label="Needs Attention"
            value={highPriorityCount}
            note="High or severe risk students"
            icon={<WarningAmberIcon />}
            color="#dc2626"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={2.4}>
          <MetricCard
            label="Average DASS-21"
            value={scoreOrNA(dashboard?.average_dass21)}
            note="Counselor-only clinical indicator"
            icon={<HealthAndSafetyIcon />}
            color="#7e22ce"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={2.4}>
          <MetricCard
            label="Review Completion"
            value={pct(dashboard?.review_completion_rate)}
            note={`${openReviewCount} open reviews`}
            icon={<FactCheckIcon />}
            color="#2563eb"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={2.4}>
          <MetricCard
            label="Follow-Up Rate"
            value={pct(dashboard?.follow_up_rate)}
            note={`${recentlyCheckedIn} checked in this week`}
            icon={<TrendingUpIcon />}
            color="#0891b2"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} lg={6}>
          <Paper sx={chartCardSx}>
            <SectionTitle eyebrow="Signal Trend" title="Mood, Stress, and Fusion" />
            <ResponsiveContainer width="100%" height="82%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                <ChartTooltip />
                <Legend />
                <Line type="monotone" dataKey="mood" stroke="#0d9488" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="stress" stroke="#f59e0b" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="fusion" stroke="#7c3aed" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={chartCardSx}>
            <SectionTitle eyebrow="Coverage" title="Assessment Completion" />
            <ResponsiveContainer width="100%" height="82%">
              <BarChart data={completionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <ChartTooltip />
                <Bar dataKey="value" fill="#0d9488" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={chartCardSx}>
            <SectionTitle eyebrow="Triage" title="Risk Distribution" />
            <ResponsiveContainer width="100%" height="82%">
              <PieChart>
                <Pie data={riskDistribution} dataKey="value" nameKey="name" innerRadius={46} outerRadius={88} paddingAngle={2} label>
                  {riskDistribution.map((entry) => (
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

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2.5, borderRadius: 2, border: '1px solid rgba(15, 23, 42, 0.08)', boxShadow: '0 18px 45px rgba(15, 23, 42, 0.08)' }}>
            <SectionTitle eyebrow="Priority List" title="Students Needing Attention" />
            <Stack spacing={1.25}>
              {topPriorityStudents.length === 0 ? (
                <Typography sx={{ color: '#64748b' }}>No high priority students currently listed.</Typography>
              ) : (
                topPriorityStudents.map((student) => {
                  const palette = riskPalette[student.risk_level || 'UNKNOWN'] || riskPalette.UNKNOWN;
                  return (
                    <Stack
                      key={student.id}
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      spacing={2}
                      sx={{ p: 1.25, border: '1px solid #e2e8f0', borderRadius: 2, bgcolor: '#ffffff' }}
                    >
                      <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
                        <Avatar sx={{ bgcolor: palette.soft, color: palette.text, fontWeight: 900 }}>
                          {(student.full_name || student.name || '?').charAt(0).toUpperCase()}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography sx={{ color: '#0f172a', fontWeight: 900 }} noWrap>
                            {student.full_name || student.name}
                          </Typography>
                          <Typography sx={{ color: '#64748b', fontSize: '0.8rem' }} noWrap>
                            {student.email || 'No email'}
                          </Typography>
                        </Box>
                      </Stack>
                      <Chip
                        size="small"
                        label={student.risk_level || 'UNKNOWN'}
                        sx={{ bgcolor: palette.soft, color: palette.text, fontWeight: 900 }}
                      />
                    </Stack>
                  );
                })
              )}
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2.5, borderRadius: 2, border: '1px solid rgba(15, 23, 42, 0.08)', boxShadow: '0 18px 45px rgba(15, 23, 42, 0.08)' }}>
            <SectionTitle eyebrow="Operational Snapshot" title="Review Readiness" />
            <Stack spacing={2}>
              <Box>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
                  <Typography sx={{ color: '#334155', fontWeight: 800 }}>Recent check-in coverage</Typography>
                  <Typography sx={{ color: '#0f766e', fontWeight: 900 }}>{pct(coverageRate)}</Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(100, Math.round(coverageRate * 100))}
                  sx={{
                    height: 10,
                    borderRadius: 999,
                    bgcolor: '#ccfbf1',
                    '& .MuiLinearProgress-bar': { bgcolor: '#0d9488', borderRadius: 999 },
                  }}
                />
              </Box>
              <Grid container spacing={1.5}>
                {[
                  ['Average Mood', scoreOrNA(dashboard?.average_mood), <MonitorHeartIcon />],
                  ['Open Reviews', openReviewCount, <FactCheckIcon />],
                  ['Filtered Students', filteredStudents.length, <PersonSearchIcon />],
                ].map(([label, value, icon]) => (
                  <Grid item xs={12} sm={4} key={label}>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ color: '#0f766e' }}>
                        {icon}
                        <Typography sx={{ color: '#64748b', fontSize: '0.78rem', fontWeight: 800 }}>
                          {label}
                        </Typography>
                      </Stack>
                      <Typography sx={{ color: '#0f172a', fontSize: '1.45rem', fontWeight: 900, mt: 0.5 }}>
                        {value}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(15, 23, 42, 0.08)', boxShadow: '0 18px 45px rgba(15, 23, 42, 0.08)' }}>
        <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <SectionTitle
            eyebrow="Assigned Caseload"
            title="Student List"
            action={(
              <Chip
                icon={<InsightsIcon />}
                label={`${filteredStudents.length} students`}
                sx={{ bgcolor: '#ecfeff', color: '#0f766e', fontWeight: 900 }}
              />
            )}
          />
          <TextField
            size="small"
            label="Search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            sx={{ minWidth: { xs: '100%', sm: 280 } }}
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
          <Table size="small" sx={tableHeadSx}>
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
              {filteredStudents.map((student) => {
                const palette = riskPalette[student.risk_level || 'UNKNOWN'] || riskPalette.UNKNOWN;
                return (
                  <TableRow
                    hover
                    key={student.id}
                    sx={{
                      '& td': { borderColor: '#e2e8f0' },
                      '&:hover': { bgcolor: '#f8fafc' },
                    }}
                  >
                    <TableCell>
                      <Stack direction="row" spacing={1.25} alignItems="center">
                        <Avatar sx={{ bgcolor: palette.soft, color: palette.text, width: 38, height: 38, fontWeight: 900 }}>
                          {(student.full_name || student.name || '?').charAt(0).toUpperCase()}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" sx={{ color: '#0f172a', fontWeight: 900 }} noWrap>
                            {student.full_name || student.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748b' }} noWrap>
                            {student.email || 'No email'}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={student.risk_level || 'UNKNOWN'}
                        sx={{ bgcolor: palette.soft, color: palette.text, fontWeight: 900 }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#334155' }}>{scoreOrNA(student.fusion_score)}</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#334155' }}>{scoreOrNA(student.avg_dass21_score)}</TableCell>
                    <TableCell sx={{ color: '#475569' }}>{formatDate(student.last_checkin)}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={student.open_reviews ?? 0}
                        sx={{ bgcolor: Number(student.open_reviews || 0) > 0 ? '#eff6ff' : '#f8fafc', color: '#1e40af', fontWeight: 900 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View student detail">
                        <IconButton
                          onClick={() => navigate(`/counselor/student/${student.id}`)}
                          size="small"
                          sx={{ color: '#0f766e' }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Download PDF report">
                        <IconButton
                          onClick={() => counselorService.downloadStudentReport(student.id, 'pdf')}
                          size="small"
                          sx={{ color: '#334155' }}
                        >
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
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
    </Box>
  );
};

export default CounselorDashboard;
