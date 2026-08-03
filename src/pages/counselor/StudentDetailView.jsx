import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  NoteAdd as NoteAddIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import counselorService from '../../services/counselorService';

const reviewStatuses = ['NEW', 'UNDER_REVIEW', 'FOLLOW_UP_REQUIRED', 'REFERRED', 'CLOSED'];
const riskColors = {
  LOW: 'success',
  MEDIUM: 'warning',
  HIGH: 'error',
  SEVERE: 'secondary',
};

const formatDateTime = (value) => (value ? new Date(value).toLocaleString() : 'N/A');
const valueOrNA = (value) => (value === null || value === undefined ? 'N/A' : value);

const TabPanel = ({ children, value, index }) => (
  <Box role="tabpanel" hidden={value !== index} sx={{ pt: 2 }}>
    {value === index ? children : null}
  </Box>
);

const StudentDetailView = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [detail, setDetail] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [reviewForm, setReviewForm] = useState({
    assessment_id: '',
    status: 'NEW',
    review_notes: '',
    decision: '',
    risk_judgement: '',
  });
  const [noteForm, setNoteForm] = useState({ note_text: '', note_type: 'clinical' });

  const fetchDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [studentData, timelineData] = await Promise.all([
        counselorService.getStudent(userId),
        counselorService.getStudentTimeline(userId),
      ]);
      setDetail(studentData);
      setTimeline(timelineData.events || []);
      setReviewForm((current) => ({
        ...current,
        assessment_id: studentData.latest_assessment?.id || '',
      }));
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.error || 'Unable to load student detail');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const trendData = useMemo(() => {
    if (!detail) return [];
    const byDate = {};
    detail.recent_checkins?.forEach((checkin) => {
      const key = checkin.created_at?.slice(0, 10);
      if (!key) return;
      byDate[key] = { ...(byDate[key] || { date: key }), mood: checkin.mood, stress: checkin.stress_level };
    });
    detail.assessments?.forEach((assessment) => {
      const key = assessment.created_at?.slice(0, 10);
      if (!key) return;
      byDate[key] = { ...(byDate[key] || { date: key }), fusion: assessment.final_score ?? assessment.model_score };
    });
    return Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));
  }, [detail]);

  const completionData = useMemo(() => {
    if (!detail) return [];
    return [
      { name: 'DASS-21', value: detail.dass21_assessments?.length || 0 },
      { name: 'Mood', value: detail.recent_checkins?.length || 0 },
      { name: 'Fusion', value: detail.assessments?.length || 0 },
      { name: 'Reviews', value: detail.reviews?.length || 0 },
    ];
  }, [detail]);

  const handleCreateReview = async () => {
    try {
      setSaving(true);
      setNotice('');
      await counselorService.createReview({
        student_id: Number(userId),
        assessment_id: reviewForm.assessment_id ? Number(reviewForm.assessment_id) : null,
        status: reviewForm.status,
        review_notes: reviewForm.review_notes,
        decision: reviewForm.decision,
        risk_judgement: reviewForm.risk_judgement,
      });
      setReviewForm((current) => ({ ...current, review_notes: '', decision: '', risk_judgement: '' }));
      setNotice('Review saved.');
      await fetchDetail();
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.error || 'Unable to save review');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateReviewStatus = async (reviewId, statusValue) => {
    try {
      setSaving(true);
      await counselorService.updateReview(reviewId, { status: statusValue });
      setNotice('Review status updated.');
      await fetchDetail();
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.error || 'Unable to update review');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateNote = async () => {
    try {
      setSaving(true);
      setNotice('');
      await counselorService.createNote({
        student_id: Number(userId),
        note_text: noteForm.note_text,
        note_type: noteForm.note_type,
      });
      setNoteForm({ note_text: '', note_type: 'clinical' });
      setNotice('Note saved.');
      await fetchDetail();
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.error || 'Unable to save note');
    } finally {
      setSaving(false);
    }
  };

  const handleArchiveNote = async (noteId) => {
    try {
      setSaving(true);
      await counselorService.updateNote(noteId, { active: false });
      setNotice('Note archived without deletion.');
      await fetchDetail();
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.error || 'Unable to update note');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '70vh', display: 'grid', placeItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!detail) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Alert severity="error">{error || 'Student detail is unavailable.'}</Alert>
      </Container>
    );
  }

  const student = detail.student || detail.user || {};
  const latest = detail.latest_assessment || {};

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <Tooltip title="Back">
            <IconButton onClick={() => navigate('/counselor/students')}>
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {student.full_name || student.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {student.email} {student.department ? `- ${student.department}` : ''}
            </Typography>
          </Box>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button startIcon={<RefreshIcon />} variant="outlined" onClick={fetchDetail}>
            Refresh
          </Button>
          <Button startIcon={<DownloadIcon />} variant="outlined" onClick={() => counselorService.downloadStudentReport(userId, 'csv')}>
            CSV
          </Button>
          <Button startIcon={<DownloadIcon />} variant="contained" onClick={() => counselorService.downloadStudentReport(userId, 'pdf')}>
            PDF
          </Button>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {notice && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setNotice('')}>
          {notice}
        </Alert>
      )}
      <Alert severity="info" sx={{ mb: 3 }}>
        {detail.model_disclaimer}
      </Alert>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          ['Model Risk', latest.risk_level || latest.model_risk_level || 'UNKNOWN'],
          ['Fusion Score', valueOrNA(latest.final_score ?? latest.model_score)],
          ['Evidence Coverage', valueOrNA(latest.evidence_coverage)],
          ['Coverage Category', latest.coverage_category || 'N/A'],
          ['Open Reviews', detail.reviews?.filter((review) => review.status !== 'CLOSED').length || 0],
        ].map(([label, value]) => (
          <Grid item xs={12} sm={6} md={2.4} key={label}>
            <Card sx={{ borderRadius: 2, height: '100%' }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  {label}
                </Typography>
                <Typography variant="h6" sx={{ mt: 1, fontWeight: 700 }}>
                  {value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ borderRadius: 2, p: 2 }}>
        <Tabs value={tab} onChange={(event, nextTab) => setTab(nextTab)} variant="scrollable" allowScrollButtonsMobile>
          <Tab label="Summary" />
          <Tab label="Assessments" />
          <Tab label="Modality Evidence" />
          <Tab label="Trends" />
          <Tab label="Notes" />
          <Tab label="Actions" />
        </Tabs>

        <TabPanel value={tab} index={0}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Student Summary
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableBody>
                    {[
                      ['Name', student.full_name || student.name],
                      ['Email', student.email],
                      ['Department', student.department || 'N/A'],
                      ['Year', student.year_of_study || 'N/A'],
                      ['Assigned Date', formatDateTime(detail.assignment?.assigned_date)],
                      ['Assignment Reason', detail.assignment?.assignment_reason || 'N/A'],
                    ].map(([label, value]) => (
                      <TableRow key={label}>
                        <TableCell sx={{ fontWeight: 700 }}>{label}</TableCell>
                        <TableCell>{value}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Recent Timeline
              </Typography>
              <Stack spacing={1}>
                {timeline.slice(0, 6).map((event) => (
                  <Paper key={`${event.type}-${event.timestamp}-${event.label}`} variant="outlined" sx={{ p: 1.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {event.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDateTime(event.timestamp)}
                    </Typography>
                  </Paper>
                ))}
                {timeline.length === 0 && <Typography color="text.secondary">No timeline events yet.</Typography>}
              </Stack>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tab} index={1}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Risk</TableCell>
                  <TableCell>Fusion</TableCell>
                  <TableCell>Model Score</TableCell>
                  <TableCell>Evidence</TableCell>
                  <TableCell>Screening Only</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {detail.assessments?.map((assessment) => (
                  <TableRow key={assessment.id}>
                    <TableCell>{formatDateTime(assessment.created_at)}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={assessment.risk_level || assessment.model_risk_level || 'UNKNOWN'}
                        color={riskColors[assessment.risk_level || assessment.model_risk_level] || 'default'}
                      />
                    </TableCell>
                    <TableCell>{valueOrNA(assessment.final_score)}</TableCell>
                    <TableCell>{valueOrNA(assessment.model_score)}</TableCell>
                    <TableCell>{valueOrNA(assessment.evidence_coverage)}</TableCell>
                    <TableCell>{assessment.screening_only ? 'Yes' : 'No'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>
            DASS-21 History
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Depression</TableCell>
                  <TableCell>Anxiety</TableCell>
                  <TableCell>Stress</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Complete</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {detail.dass21_assessments?.map((assessment) => (
                  <TableRow key={assessment.id}>
                    <TableCell>{formatDateTime(assessment.created_at)}</TableCell>
                    <TableCell>{assessment.depression_score}</TableCell>
                    <TableCell>{assessment.anxiety_score}</TableCell>
                    <TableCell>{assessment.stress_score}</TableCell>
                    <TableCell>{assessment.total_dass21_score}</TableCell>
                    <TableCell>{assessment.is_complete ? 'Yes' : 'No'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tab} index={2}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Generated</TableCell>
                  <TableCell>Modality</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Score</TableCell>
                  <TableCell>Probability</TableCell>
                  <TableCell>Confidence</TableCell>
                  <TableCell>Boundary</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {detail.modality_evidence?.map((evidence) => (
                  <TableRow key={evidence.id}>
                    <TableCell>{formatDateTime(evidence.generated_at)}</TableCell>
                    <TableCell>{evidence.modality}</TableCell>
                    <TableCell>{evidence.status}</TableCell>
                    <TableCell>{valueOrNA(evidence.score_0_100)}</TableCell>
                    <TableCell>{valueOrNA(evidence.probability)}</TableCell>
                    <TableCell>{valueOrNA(evidence.confidence)}</TableCell>
                    <TableCell>{evidence.clinical_use_boundary}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tab} index={3}>
          <Grid container spacing={2}>
            <Grid item xs={12} lg={8}>
              <Paper variant="outlined" sx={{ p: 2, height: 360 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Mood, Stress, and Fusion
                </Typography>
                <ResponsiveContainer width="100%" height="82%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip />
                    <Legend />
                    <Line type="monotone" dataKey="mood" stroke="#1976d2" strokeWidth={2} />
                    <Line type="monotone" dataKey="stress" stroke="#ed6c02" strokeWidth={2} />
                    <Line type="monotone" dataKey="fusion" stroke="#7b1fa2" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid item xs={12} lg={4}>
              <Paper variant="outlined" sx={{ p: 2, height: 360 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Assessment Completion
                </Typography>
                <ResponsiveContainer width="100%" height="82%">
                  <BarChart data={completionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <ChartTooltip />
                    <Bar dataKey="value" fill="#1976d2" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tab} index={4}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={5}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                New Counselor Note
              </Typography>
              <Stack spacing={2}>
                <FormControl size="small">
                  <InputLabel>Type</InputLabel>
                  <Select
                    label="Type"
                    value={noteForm.note_type}
                    onChange={(event) => setNoteForm((current) => ({ ...current, note_type: event.target.value }))}
                  >
                    <MenuItem value="clinical">Clinical</MenuItem>
                    <MenuItem value="follow_up">Follow-Up</MenuItem>
                    <MenuItem value="referral">Referral</MenuItem>
                    <MenuItem value="administrative">Administrative</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Note"
                  value={noteForm.note_text}
                  minRows={5}
                  multiline
                  onChange={(event) => setNoteForm((current) => ({ ...current, note_text: event.target.value }))}
                />
                <Button
                  startIcon={<NoteAddIcon />}
                  variant="contained"
                  disabled={saving || !noteForm.note_text.trim()}
                  onClick={handleCreateNote}
                >
                  Save Note
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={7}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Note History
              </Typography>
              <Stack spacing={1}>
                {detail.notes?.map((note) => (
                  <Paper key={note.id} variant="outlined" sx={{ p: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {note.note_type} {note.active ? '' : '(archived)'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDateTime(note.updated_at)}
                        </Typography>
                      </Box>
                      {note.active && (
                        <Button size="small" onClick={() => handleArchiveNote(note.id)}>
                          Archive
                        </Button>
                      )}
                    </Box>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {note.note_text}
                    </Typography>
                  </Paper>
                ))}
                {detail.notes?.length === 0 && <Typography color="text.secondary">No counselor notes yet.</Typography>}
              </Stack>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tab} index={5}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={5}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Human Review
              </Typography>
              <Stack spacing={2}>
                <FormControl size="small">
                  <InputLabel>Assessment</InputLabel>
                  <Select
                    label="Assessment"
                    value={reviewForm.assessment_id}
                    onChange={(event) => setReviewForm((current) => ({ ...current, assessment_id: event.target.value }))}
                  >
                    <MenuItem value="">No linked assessment</MenuItem>
                    {detail.assessments?.map((assessment) => (
                      <MenuItem value={assessment.id} key={assessment.id}>
                        {formatDateTime(assessment.created_at)} - {assessment.risk_level || assessment.model_risk_level || 'UNKNOWN'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    label="Status"
                    value={reviewForm.status}
                    onChange={(event) => setReviewForm((current) => ({ ...current, status: event.target.value }))}
                  >
                    {reviewStatuses.map((statusValue) => (
                      <MenuItem value={statusValue} key={statusValue}>
                        {statusValue}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="Review Notes"
                  value={reviewForm.review_notes}
                  multiline
                  minRows={3}
                  onChange={(event) => setReviewForm((current) => ({ ...current, review_notes: event.target.value }))}
                />
                <TextField
                  label="Decision"
                  value={reviewForm.decision}
                  onChange={(event) => setReviewForm((current) => ({ ...current, decision: event.target.value }))}
                />
                <TextField
                  label="Risk Judgement"
                  value={reviewForm.risk_judgement}
                  onChange={(event) => setReviewForm((current) => ({ ...current, risk_judgement: event.target.value }))}
                />
                <Button startIcon={<SaveIcon />} variant="contained" disabled={saving} onClick={handleCreateReview}>
                  Save Review
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={7}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Review History
              </Typography>
              <Stack spacing={1}>
                {detail.reviews?.map((review) => (
                  <Paper key={review.id} variant="outlined" sx={{ p: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                      <Box>
                        <Chip size="small" label={review.status} />
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          {formatDateTime(review.updated_at)}
                        </Typography>
                      </Box>
                      <FormControl size="small" sx={{ minWidth: 190 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                          label="Status"
                          value={review.status}
                          onChange={(event) => handleUpdateReviewStatus(review.id, event.target.value)}
                        >
                          {reviewStatuses.map((statusValue) => (
                            <MenuItem value={statusValue} key={statusValue}>
                              {statusValue}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {review.review_notes || 'No notes recorded.'}
                    </Typography>
                    {review.decision && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Decision: {review.decision}
                      </Typography>
                    )}
                    {review.risk_judgement && (
                      <Typography variant="body2" color="text.secondary">
                        Human judgement: {review.risk_judgement}
                      </Typography>
                    )}
                  </Paper>
                ))}
                {detail.reviews?.length === 0 && <Typography color="text.secondary">No human reviews yet.</Typography>}
              </Stack>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default StudentDetailView;
