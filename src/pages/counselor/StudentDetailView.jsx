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
  LinearProgress,
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
import { Sidebar } from '../../components/layout/Sidebar';
import counselorService from '../../services/counselorService';

const reviewStatuses = ['NEW', 'UNDER_REVIEW', 'FOLLOW_UP_REQUIRED', 'REFERRED', 'CLOSED'];
const riskColors = {
  LOW: 'success',
  MEDIUM: 'warning',
  HIGH: 'error',
  SEVERE: 'secondary',
  low: 'success',
  medium: 'warning',
  high: 'error',
  severe: 'secondary',
};
const modelOrder = ['profile', 'dass21', 'mood', 'text', 'speech', 'face', 'behavioral'];
const modelLabels = {
  profile: 'Profile',
  dass21: 'DASS-21',
  mood: 'Mood',
  text: 'Text',
  speech: 'Speech',
  face: 'Face',
  behavioral: 'Behavioral',
};
const DASS21_MAX_SCORE = 126;

const formatDateTime = (value) => (value ? new Date(value).toLocaleString() : 'N/A');
const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : 'N/A');
const valueOrNA = (value) => (value === null || value === undefined ? 'N/A' : value);
const asNumber = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};
const boundedPercent = (value) => {
  const numeric = asNumber(value);
  if (numeric === null) return null;
  return Math.max(0, Math.min(100, numeric));
};
const riskPercentFromAssessment = (assessment = {}) => {
  if (!assessment) return null;
  if (assessment.risk_percentage !== null && assessment.risk_percentage !== undefined) {
    return boundedPercent(assessment.risk_percentage);
  }
  if (assessment.final_score !== null && assessment.final_score !== undefined) {
    return boundedPercent(assessment.final_score);
  }
  if (assessment.final_probability !== null && assessment.final_probability !== undefined) {
    return boundedPercent(Number(assessment.final_probability) * 100);
  }
  if (assessment.model_score !== null && assessment.model_score !== undefined) {
    const score = Number(assessment.model_score);
    return boundedPercent(score <= 1 ? score * 100 : score);
  }
  return null;
};
const riskPercentFromEvidence = (evidence = {}) => {
  if (evidence.risk_percentage !== null && evidence.risk_percentage !== undefined) {
    return boundedPercent(evidence.risk_percentage);
  }
  if (evidence.score_0_100 !== null && evidence.score_0_100 !== undefined) {
    return boundedPercent(evidence.score_0_100);
  }
  if (evidence.probability !== null && evidence.probability !== undefined) {
    return boundedPercent(Number(evidence.probability) * 100);
  }
  return null;
};
const riskPercentFromDass = (assessment = {}) => {
  if (!assessment) return null;
  if (assessment.risk_percentage !== null && assessment.risk_percentage !== undefined) {
    return boundedPercent(assessment.risk_percentage);
  }
  const total = asNumber(assessment.total_dass21_score);
  return total === null ? null : boundedPercent((total / DASS21_MAX_SCORE) * 100);
};
const contextualEvidenceFrom = (evidence, fallbackLimitation) => {
  if (!evidence) return null;
  const metadata = evidence.metadata || {};
  const rawOutput = evidence.raw_output || {};
  const available = evidence.status === 'succeeded' && evidence.is_available !== false;
  return {
    status: evidence.status || 'missing',
    availability: available ? 'available' : 'N/A',
    analyzedAt: evidence.generated_at || evidence.source_timestamp,
    label: available
      ? metadata.emotion_label || metadata.anomaly_label || rawOutput.emotion_label || rawOutput.label || evidence.label || evidence.predicted_class || 'N/A'
      : 'N/A',
    confidence: evidence.confidence ?? rawOutput.confidence,
    confidenceBand: metadata.confidence_band || 'unknown',
    dataQuality: evidence.data_quality_status || metadata.data_quality_status || 'not_evaluated',
    modelVersion: evidence.model_version || metadata.model_version,
    preprocessingVersion: evidence.preprocessing_version || metadata.preprocessing_version,
    technicalStatus: metadata.technical_status || evidence.status || 'not_verified',
    fusionStatus: metadata.fusion_status || (evidence.included ? 'included' : 'excluded_contextual_only'),
    failure: evidence.failure_message_safe || metadata.failure_message_safe || rawOutput.failure_message_safe,
    limitation: metadata.limitation || fallbackLimitation,
  };
};
const formatPercent = (value) => {
  const numeric = boundedPercent(value);
  return numeric === null ? 'N/A' : `${numeric.toFixed(1)}%`;
};
const formatCompactNumber = (value) => {
  const numeric = asNumber(value);
  return numeric === null ? 'N/A' : numeric.toFixed(numeric % 1 === 0 ? 0 : 2);
};
const riskColorFromPercent = (value) => {
  const numeric = boundedPercent(value);
  if (numeric === null) return 'default';
  if (numeric >= 75) return 'error';
  if (numeric >= 50) return 'warning';
  if (numeric >= 25) return 'info';
  return 'success';
};
const averagePercent = (values) => {
  const present = values.map(boundedPercent).filter((value) => value !== null);
  if (!present.length) return null;
  return present.reduce((sum, value) => sum + value, 0) / present.length;
};

const PercentBar = ({ value, color = 'primary' }) => {
  const numeric = boundedPercent(value);
  const progressColor = ['primary', 'secondary', 'error', 'info', 'success', 'warning', 'inherit'].includes(color)
    ? color
    : 'inherit';
  return (
    <Box sx={{ minWidth: 120 }}>
      <Typography variant="body2" sx={{ fontWeight: 700 }}>
        {formatPercent(numeric)}
      </Typography>
      <LinearProgress
        variant="determinate"
        color={numeric === null ? 'inherit' : progressColor}
        value={numeric || 0}
        sx={{ mt: 0.5, height: 7, borderRadius: 999 }}
      />
    </Box>
  );
};

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
      byDate[key] = {
        ...(byDate[key] || { date: key }),
        fusion: riskPercentFromAssessment(assessment),
        riskStatus: assessment.risk_level || assessment.model_risk_level || 'UNKNOWN',
      };
    });
    detail.dass21_assessments?.forEach((assessment) => {
      const key = assessment.created_at?.slice(0, 10);
      if (!key) return;
      byDate[key] = {
        ...(byDate[key] || { date: key }),
        dass21Risk: riskPercentFromDass(assessment),
      };
    });
    return Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));
  }, [detail]);

  const modelSummaryData = useMemo(() => {
    if (!detail) return [];
    const apiRows = detail.model_component_summary || [];
    if (apiRows.length) {
      const byModality = new Map(apiRows.map((row) => [row.modality, row]));
      return modelOrder.map((modality) => {
        const row = byModality.get(modality) || {};
        return {
          modality,
          label: row.label || modelLabels[modality],
          status: row.status || 'missing',
          riskPercentage: boundedPercent(row.risk_percentage ?? row.component_percentage),
          contributionPercentage: boundedPercent(row.contribution_percentage),
          baseWeightPercentage: boundedPercent(row.base_weight_percentage),
          weightPercentage: boundedPercent(row.effective_weight_percentage),
          included: Boolean(row.included),
          sourceTimestamp: row.source_timestamp || row.generated_at,
          reason: row.reason,
        };
      });
    }

    const latestByModality = new Map();
    detail.modality_evidence?.forEach((evidence) => {
      if (!latestByModality.has(evidence.modality)) {
        latestByModality.set(evidence.modality, evidence);
      }
    });
    return modelOrder.map((modality) => {
      const evidence = latestByModality.get(modality);
      const fallbackDass = modality === 'dass21' ? detail.dass21_assessments?.[0] : null;
      return {
        modality,
        label: modelLabels[modality],
        status: evidence?.status || 'missing',
        riskPercentage: riskPercentFromEvidence(evidence) ?? riskPercentFromDass(fallbackDass),
        contributionPercentage: null,
        baseWeightPercentage: null,
        weightPercentage: null,
        included: false,
        sourceTimestamp: evidence?.source_timestamp || evidence?.generated_at || fallbackDass?.created_at,
        reason: evidence ? 'not_in_latest_fusion' : 'missing',
      };
    });
  }, [detail]);

  const latestSpeechEvidence = useMemo(() => {
    const evidence = detail?.modality_evidence?.find((item) => item.modality === 'speech');
    return contextualEvidenceFrom(
      evidence,
      'Voice emotion was analyzed, but it is not included in the final fused screening score because the project does not currently have an approved emotion-to-risk mapping.'
    );
  }, [detail]);

  const latestFaceEvidence = useMemo(() => {
    const evidence = detail?.modality_evidence?.find((item) => item.modality === 'face');
    return contextualEvidenceFrom(
      evidence,
      'Facial-emotion output is contextual only and is not included in the final fused screening score.'
    );
  }, [detail]);

  const latestBehavioralEvidence = useMemo(() => {
    const evidence = detail?.modality_evidence?.find((item) => item.modality === 'behavioral');
    return contextualEvidenceFrom(
      evidence,
      'Behavioral anomaly output is contextual only and is not included in the final fused screening score.'
    );
  }, [detail]);

  const dailyModalityRows = useMemo(() => {
    if (!detail) return [];
    const byDate = {};
    const ensureDate = (dateKey) => {
      if (!byDate[dateKey]) byDate[dateKey] = { date: dateKey, modalities: {} };
      return byDate[dateKey];
    };

    detail.modality_evidence?.forEach((evidence) => {
      const key = (evidence.source_timestamp || evidence.generated_at)?.slice(0, 10);
      if (!key || !evidence.modality) return;
      const row = ensureDate(key);
      if (row.modalities[evidence.modality] === undefined) {
        row.modalities[evidence.modality] = riskPercentFromEvidence(evidence);
      }
    });

    detail.dass21_assessments?.forEach((assessment) => {
      const key = assessment.created_at?.slice(0, 10);
      if (!key) return;
      const row = ensureDate(key);
      if (row.modalities.dass21 === undefined) {
        row.modalities.dass21 = riskPercentFromDass(assessment);
      }
    });

    detail.assessments?.forEach((assessment) => {
      const key = assessment.created_at?.slice(0, 10);
      if (!key) return;
      const row = ensureDate(key);
      row.overallRisk = riskPercentFromAssessment(assessment);
      row.riskStatus = assessment.risk_level || assessment.model_risk_level || 'UNKNOWN';
    });

    return Object.values(byDate)
      .map((row) => ({
        ...row,
        averageModelRisk: averagePercent(modelOrder.map((modality) => row.modalities[modality])),
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [detail]);

  const riskStatusData = useMemo(() => {
    if (!detail) return [];
    const counts = {};
    detail.assessments?.forEach((assessment) => {
      const statusValue = assessment.risk_level || assessment.model_risk_level || 'UNKNOWN';
      counts[statusValue] = (counts[statusValue] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [detail]);

  const riskTrendData = useMemo(() => {
    const byDate = new Map(trendData.map((row) => [row.date, { ...row }]));
    dailyModalityRows.forEach((row) => {
      const current = byDate.get(row.date) || { date: row.date };
      byDate.set(row.date, {
        ...current,
        overallRisk: row.overallRisk ?? current.fusion,
        averageModelRisk: row.averageModelRisk,
        riskStatus: row.riskStatus || current.riskStatus,
      });
    });
    return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [dailyModalityRows, trendData]);

  const latestDassRisk = useMemo(
    () => riskPercentFromDass(detail?.dass21_assessments?.[0]),
    [detail]
  );

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

  const renderCounselorShell = (content) => (
    <div className="student-shell">
      <Sidebar variant="counselor" />
      <main className="student-main">
        {content}
      </main>
    </div>
  );

  const renderContextualSignal = (title, evidence, emptyText) => (
    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        {title}
      </Typography>
      {evidence ? (
        <Grid container spacing={1.5}>
          {[
            ['Status', evidence.status],
            ['Availability', evidence.availability],
            ['Latest timestamp', formatDateTime(evidence.analyzedAt)],
            ['Latest label', evidence.label],
            ['Confidence band', evidence.confidenceBand],
            ['Confidence', evidence.confidence === null || evidence.confidence === undefined ? 'N/A' : formatPercent(evidence.confidence * 100)],
            ['Data quality', evidence.dataQuality],
            ['Model version', evidence.modelVersion || 'N/A'],
            ['Preprocessing', evidence.preprocessingVersion || 'N/A'],
            ['Technical status', evidence.technicalStatus],
            ['Fusion status', evidence.fusionStatus],
          ].map(([label, value]) => (
            <Grid item xs={12} sm={6} md={4} key={label}>
              <Typography variant="caption" color="text.secondary">{label}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>{value || 'N/A'}</Typography>
            </Grid>
          ))}
          {evidence.failure && (
            <Grid item xs={12}>
              <Alert severity="warning">{evidence.failure}</Alert>
            </Grid>
          )}
          <Grid item xs={12}>
            <Alert severity="info" sx={{ mt: 1 }}>
              {evidence.limitation}
            </Alert>
          </Grid>
        </Grid>
      ) : (
        <Typography color="text.secondary">{emptyText}</Typography>
      )}
    </Paper>
  );

  if (loading) {
    return renderCounselorShell(
      <Box sx={{ minHeight: '70vh', display: 'grid', placeItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!detail) {
    return renderCounselorShell(
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Alert severity="error">{error || 'Student detail is unavailable.'}</Alert>
      </Container>
    );
  }

  const student = detail.student || detail.user || {};
  const latest = detail.latest_assessment || null;
  const latestRiskPercentage = riskPercentFromAssessment(latest);
  const latestRiskStatus = latest ? (latest.risk_level || latest.model_risk_level || 'Not yet evaluated') : 'Not yet evaluated';

  return (
    renderCounselorShell(<Container maxWidth="xl" sx={{ py: 3 }}>
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
          ['Model Risk', latestRiskStatus],
          ['Final Risk %', formatPercent(latestRiskPercentage)],
          ['DASS-21 Risk %', formatPercent(latestDassRisk)],
          ['Evidence Coverage', latest ? formatPercent((latest.evidence_coverage ?? 0) * 100) : 'N/A'],
          ['Coverage Category', latest?.coverage_category || 'N/A'],
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
            <Grid item xs={12} md={5}>
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
            <Grid item xs={12} md={7}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Latest Risk Summary
              </Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary">Final risk percentage</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
                      {formatPercent(latestRiskPercentage)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary">Risk status</Typography>
                    <Chip
                      sx={{ mt: 1 }}
                      label={latestRiskStatus}
                      color={riskColors[latestRiskStatus] || riskColors[String(latestRiskStatus).toLowerCase()] || 'default'}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary">Latest DASS-21 risk</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>
                      {formatPercent(latestDassRisk)}
                    </Typography>
                  </Grid>
                </Grid>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  Component percentages show each model signal on a 0-100 risk scale. Contribution percentage is shown when that model was included in the latest fused score.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              {renderContextualSignal('Voice Emotion Signal', latestSpeechEvidence, 'No student voice-emotion analysis is available.')}
              {renderContextualSignal('Face Contextual Signal', latestFaceEvidence, 'No student facial-emotion analysis is available.')}
              {renderContextualSignal('Behavioral Contextual Signal', latestBehavioralEvidence, 'No behavioral contextual evidence is available.')}
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Seven-Model Component Summary
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Component</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Risk %</TableCell>
                      <TableCell>Base Weight</TableCell>
                      <TableCell>Effective Weight</TableCell>
                      <TableCell>Contribution %</TableCell>
                      <TableCell>Latest Evidence</TableCell>
                      <TableCell>Fusion Use</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {modelSummaryData.map((model) => (
                      <TableRow key={model.modality}>
                        <TableCell sx={{ fontWeight: 700 }}>{model.label}</TableCell>
                        <TableCell>
                          <Chip size="small" label={model.status} color={model.status === 'succeeded' ? 'success' : 'default'} />
                        </TableCell>
                        <TableCell>
                          <PercentBar value={model.riskPercentage} color={riskColorFromPercent(model.riskPercentage)} />
                        </TableCell>
                        <TableCell>{formatPercent(model.baseWeightPercentage)}</TableCell>
                        <TableCell>{formatPercent(model.weightPercentage)}</TableCell>
                        <TableCell>{formatPercent(model.contributionPercentage)}</TableCell>
                        <TableCell>{formatDateTime(model.sourceTimestamp)}</TableCell>
                        <TableCell>{model.included ? 'Included' : model.reason || 'Not included'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Recent Timeline
              </Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ overflowX: 'auto', pb: 1 }}>
                {timeline.slice(0, 6).map((event) => (
                  <Paper key={`${event.type}-${event.timestamp}-${event.label}`} variant="outlined" sx={{ p: 1.5, minWidth: 220 }}>
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
                  <TableCell>Risk %</TableCell>
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
                    <TableCell>{formatPercent(riskPercentFromAssessment(assessment))}</TableCell>
                    <TableCell>{formatCompactNumber(assessment.final_score)}</TableCell>
                    <TableCell>{formatCompactNumber(assessment.model_score)}</TableCell>
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
                  <TableCell>Risk %</TableCell>
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
                    <TableCell>
                      <Chip
                        size="small"
                        label={formatPercent(riskPercentFromDass(assessment))}
                        color={riskColorFromPercent(riskPercentFromDass(assessment))}
                      />
                    </TableCell>
                    <TableCell>{assessment.is_complete ? 'Yes' : 'No'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tab} index={2}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Daily Modality Risk Matrix
          </Typography>
          <TableContainer sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  {modelOrder.map((modality) => (
                    <TableCell key={modality}>{modelLabels[modality]}</TableCell>
                  ))}
                  <TableCell>Overall Risk %</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dailyModalityRows.map((row) => (
                  <TableRow key={row.date}>
                    <TableCell sx={{ fontWeight: 700 }}>{formatDate(row.date)}</TableCell>
                    {modelOrder.map((modality) => (
                      <TableCell key={modality}>
                        <Chip
                          size="small"
                          label={formatPercent(row.modalities[modality])}
                          color={riskColorFromPercent(row.modalities[modality])}
                          variant={row.modalities[modality] === undefined ? 'outlined' : 'filled'}
                        />
                      </TableCell>
                    ))}
                    <TableCell>
                      <Chip
                        size="small"
                        label={formatPercent(row.overallRisk)}
                        color={riskColorFromPercent(row.overallRisk)}
                        variant={row.overallRisk === undefined ? 'outlined' : 'filled'}
                      />
                    </TableCell>
                    <TableCell>{row.riskStatus || 'N/A'}</TableCell>
                  </TableRow>
                ))}
                {dailyModalityRows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={modelOrder.length + 3}>No modality evidence yet.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Prediction Evidence Log
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Generated</TableCell>
                  <TableCell>Modality</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Score</TableCell>
                  <TableCell>Probability</TableCell>
                  <TableCell>Risk %</TableCell>
                  <TableCell>Confidence</TableCell>
                  <TableCell>Overall Risk %</TableCell>
                  <TableCell>Boundary</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {detail.modality_evidence?.map((evidence) => {
                  const evidenceDate = (evidence.source_timestamp || evidence.generated_at)?.slice(0, 10);
                  const sameDay = dailyModalityRows.find((row) => row.date === evidenceDate);
                  return (
                    <TableRow key={evidence.id}>
                      <TableCell>{formatDateTime(evidence.generated_at)}</TableCell>
                      <TableCell>{modelLabels[evidence.modality] || evidence.modality}</TableCell>
                      <TableCell>{evidence.status}</TableCell>
                      <TableCell>{formatCompactNumber(evidence.score_0_100)}</TableCell>
                      <TableCell>{formatCompactNumber(evidence.probability)}</TableCell>
                      <TableCell>{formatPercent(riskPercentFromEvidence(evidence))}</TableCell>
                      <TableCell>{formatCompactNumber(evidence.confidence)}</TableCell>
                      <TableCell>{formatPercent(sameDay?.overallRisk)}</TableCell>
                      <TableCell>{evidence.clinical_use_boundary}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tab} index={3}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                <Typography variant="body2" color="text.secondary">Latest overall risk</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 1 }}>
                  {formatPercent(latestRiskPercentage)}
                </Typography>
                <Chip
                  size="small"
                  sx={{ mt: 1 }}
                  label={latestRiskStatus}
                  color={riskColors[latestRiskStatus] || riskColors[String(latestRiskStatus).toLowerCase()] || 'default'}
                />
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                <Typography variant="body2" color="text.secondary">Latest DASS-21 risk</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 1 }}>
                  {formatPercent(latestDassRisk)}
                </Typography>
                <Typography variant="caption" color="text.secondary">From overall DASS-21 percentage</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                <Typography variant="body2" color="text.secondary">Average model signal</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 1 }}>
                  {formatPercent(averagePercent(modelSummaryData.map((model) => model.riskPercentage)))}
                </Typography>
                <Typography variant="caption" color="text.secondary">Latest available components</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                <Typography variant="body2" color="text.secondary">Risk records</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 1 }}>
                  {detail.assessments?.length || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">Fused assessments</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} lg={8}>
              <Paper variant="outlined" sx={{ p: 2, height: 360 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Risk Percentage Trend
                </Typography>
                <ResponsiveContainer width="100%" height="82%">
                  <LineChart data={riskTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                    <ChartTooltip />
                    <Legend />
                    <Line type="monotone" name="Overall Risk %" dataKey="overallRisk" stroke="#c62828" strokeWidth={2.5} connectNulls />
                    <Line type="monotone" name="DASS-21 Risk %" dataKey="dass21Risk" stroke="#1565c0" strokeWidth={2} connectNulls />
                    <Line type="monotone" name="Average Model Risk %" dataKey="averageModelRisk" stroke="#2e7d32" strokeWidth={2} connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid item xs={12} lg={4}>
              <Paper variant="outlined" sx={{ p: 2, height: 360 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Latest Component Risk %
                </Typography>
                <ResponsiveContainer width="100%" height="82%">
                  <BarChart data={modelSummaryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" interval={0} angle={-25} textAnchor="end" height={72} />
                    <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                    <ChartTooltip />
                    <Bar name="Risk %" dataKey="riskPercentage" fill="#1565c0" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid item xs={12} lg={6}>
              <Paper variant="outlined" sx={{ p: 2, height: 320 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Risk Status Distribution
                </Typography>
                <ResponsiveContainer width="100%" height="80%">
                  <BarChart data={riskStatusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <ChartTooltip />
                    <Bar name="Assessments" dataKey="value" fill="#6a1b9a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid item xs={12} lg={6}>
              <Paper variant="outlined" sx={{ p: 2, height: 320 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Evidence Volume
                </Typography>
                <ResponsiveContainer width="100%" height="80%">
                  <BarChart data={completionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <ChartTooltip />
                    <Bar dataKey="value" fill="#00897b" radius={[4, 4, 0, 0]} />
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
    </Container>)
  );
};

export default StudentDetailView;
