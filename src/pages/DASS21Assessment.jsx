import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControlLabel,
  LinearProgress,
  Radio,
  RadioGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import ArrowBack from '@mui/icons-material/ArrowBack';
import Assessment from '@mui/icons-material/Assessment';
import CheckCircle from '@mui/icons-material/CheckCircle';
import History from '@mui/icons-material/History';
import Psychology from '@mui/icons-material/Psychology';
import RestartAlt from '@mui/icons-material/RestartAlt';
import Save from '@mui/icons-material/Save';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { EmergencySOS } from '../components/common/EmergencySOS';
import api from '../services/api';

const questions = [
  'I found myself getting upset by quite trivial things.',
  'I was aware of dryness of my mouth.',
  "I couldn't seem to experience any positive feeling at all.",
  'I experienced breathing difficulty, such as rapid breathing or breathlessness without physical exertion.',
  'I found it difficult to work up the initiative to do things.',
  'I tended to over-react to situations.',
  'I experienced trembling, such as in the hands.',
  'I felt that I was using a lot of nervous energy.',
  'I was worried about situations in which I might panic and make a fool of myself.',
  'I felt that I had nothing to look forward to.',
  'I found myself getting upset rather easily.',
  'I felt that I was rather touchy.',
  'I was able to laugh and see the funny side of things.',
  'I felt downhearted and blue.',
  'I was intolerant of anything that kept me from getting on with what I was doing.',
  'I felt I was close to panic.',
  'I was unable to become enthusiastic about anything.',
  "I felt I wasn't worth much as a person.",
  'I felt that I was rather irritable.',
  'I felt I had a lot of nervous energy.',
  'I thought of myself as a worthless person.',
];

const responseLabels = [
  'Did not apply to me at all',
  'Applied to me to some degree',
  'Applied to me to a considerable degree',
  'Applied to me very much',
];

const DASS21Assessment = () => {
  const navigate = useNavigate();

  const [responses, setResponses] = useState(new Array(21).fill(null));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const loadAssessments = async () => {
      try {
        setLoading(true);

        try {
          const todayResponse = await api.get('/api/assessments/dass21/today');
          const today = todayResponse.data;
          setResponses(today.responses);
          setEditingId(today.id);
          setResult(today);
        } catch (err) {
          if (err.response?.status !== 404) {
            console.error("Error loading today's assessment:", err);
          }
        }

        try {
          const historyResponse = await api.get('/api/assessments/dass21/history', {
            params: { limit: 50 },
          });
          setHistory(historyResponse.data.assessments || []);
        } catch (err) {
          console.error('Error loading DASS-21 history:', err);
        }
      } catch (err) {
        console.error('Error loading assessments:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAssessments();
  }, []);

  const answeredCount = responses.filter((r) => r !== null && r !== undefined).length;
  const progressPercentage = (answeredCount / 21) * 100;
  const isComplete = responses.every((r) => r !== null && r !== undefined);

  const handleResponseChange = (index, value) => {
    const newResponses = [...responses];
    newResponses[index] = parseInt(value, 10);
    setResponses(newResponses);
  };

  const handleSubmit = async () => {
    if (!isComplete) {
      setError('Please answer all 21 questions before submitting.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const requestData = {
        responses,
      };

      let response;
      if (editingId) {
        response = await api.put(`/api/assessments/dass21/${editingId}`, requestData);
        setSuccess('DASS-21 self test updated successfully.');
      } else {
        response = await api.post('/api/assessments/dass21', requestData);
        setSuccess('DASS-21 self test submitted successfully.');
        setEditingId(response.data.id);
      }

      setResult(response.data);

      try {
        const historyResponse = await api.get('/api/assessments/dass21/history', {
          params: { limit: 50 },
        });
        setHistory(historyResponse.data.assessments || []);
      } catch (err) {
        console.error('Error refreshing DASS-21 history:', err);
      }
    } catch (err) {
      console.error('DASS21 error:', err);
      setError(
        `Failed to submit DASS-21 self test: ${
          err.response?.data?.detail || err.message
        }`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartNew = () => {
    setResponses(new Array(21).fill(null));
    setEditingId(null);
    setResult(null);
    setSuccess('');
    setError('');
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const renderStudentShell = (content) => (
    <div className="student-shell">
      <Sidebar />
      <main className="student-main">
        <div className="student-page student-dass-page">
          {content}
          <EmergencySOS />
        </div>
      </main>
    </div>
  );

  const TopBar = ({ showAssessmentAction = false }) => (
    <div className="student-dass-topbar">
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/dashboard')}
        className="student-dass-back"
      >
        Back to Dashboard
      </Button>
      {showAssessmentAction && (
        <Button
          startIcon={<Assessment />}
          variant="contained"
          onClick={() => setResult(null)}
          className="student-dass-primary-action"
        >
          Back to Self Test
        </Button>
      )}
    </div>
  );

  const StudentFriendlySummary = () => (
    <Card className="student-dass-card student-dass-private-summary">
      <CardContent>
        <div className="student-dass-section-head">
          <span className="student-dass-card-icon">
            <CheckCircle />
          </span>
          <div>
            <Typography className="student-dass-section-title">
              Thank you for completing the self test
            </Typography>
            <Typography className="student-dass-muted">
              Your responses have been saved securely. Your counselor can review
              the details and use them to plan supportive follow-up if needed.
            </Typography>
          </div>
        </div>

        <div className="student-dass-friendly-list">
          <div>
            <strong>Submitted</strong>
            <span>{formatDate(result.created_at)}</span>
          </div>
          <div>
            <strong>What happens next</strong>
            <span>
              You do not need to interpret any scores here. A counselor will see
              the assessment information and can discuss it with you in a safe,
              supportive way.
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const HistoryTable = () => (
    <Card className="student-dass-card">
      <CardContent>
        <div className="student-dass-section-head">
          <span className="student-dass-card-icon">
            <History />
          </span>
          <div>
            <Typography className="student-dass-section-title">
              DASS-21 History
            </Typography>
            <Typography className="student-dass-muted">
              Your completed self tests are listed here without scores.
            </Typography>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="student-dass-empty">
            <Typography>No completed DASS-21 self tests yet.</Typography>
          </div>
        ) : (
          <TableContainer className="student-dass-table-wrap">
            <Table size="small" className="student-dass-table">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Filled Assignment</TableCell>
                  <TableCell align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.map((assessment) => (
                  <TableRow key={assessment.id} hover>
                    <TableCell>
                      <div className="student-dass-date-cell">
                        <span>{formatDate(assessment.created_at)}</span>
                      </div>
                    </TableCell>
                    <TableCell>DASS-21 Self Test</TableCell>
                    <TableCell align="center">
                      <Chip label="Submitted" size="small" color="success" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return renderStudentShell(
      <div className="student-dass-loading">
        <CircularProgress />
        <Typography>Loading your DASS-21 self test...</Typography>
      </div>
    );
  }

  if (result) {
    return renderStudentShell(
      <>
        <TopBar showAssessmentAction />

        <section className="student-dass-hero student-dass-hero-results">
          <div>
            <p className="student-dass-eyebrow">Self Test Submitted</p>
            <h1>Your DASS-21 Is Saved</h1>
            <p>
              Thank you for taking a moment to check in. Your counselor can
              review the assessment details privately.
            </p>
          </div>
          <CheckCircle className="student-dass-hero-icon" />
        </section>

        {success && <Alert severity="success">{success}</Alert>}

        <StudentFriendlySummary />

        <Alert severity="info" className="student-dass-alert">
          This self test is a wellbeing screening tool, not a diagnosis. If you
          feel unsafe or need urgent help, use the support button or contact
          emergency services immediately.
        </Alert>

        <div className="student-dass-actions">
          <Button
            variant="outlined"
            startIcon={<RestartAlt />}
            onClick={handleStartNew}
            className="student-dass-secondary-action"
          >
            New Self Test
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate('/dashboard')}
            className="student-dass-primary-action"
          >
            Return to Dashboard
          </Button>
        </div>

        <HistoryTable />
      </>
    );
  }

  return renderStudentShell(
    <>
      <TopBar />

      <section className="student-dass-hero">
        <div>
          <p className="student-dass-eyebrow">
            {editingId ? 'Update Self Test' : 'DASS-21 Self Test'}
          </p>
          <h1>Depression, Anxiety, and Stress Scale</h1>
          <p>
            Answer each item based on how much it applied to you recently. Your
            progress is saved when you submit all 21 responses.
          </p>
        </div>
        <Psychology className="student-dass-hero-icon" />
      </section>

      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}

      <Card className="student-dass-card">
        <CardContent>
          <div className="student-dass-progress-head">
            <div>
              <Typography className="student-dass-section-title">
                Assessment Progress
              </Typography>
              <Typography className="student-dass-muted">
                {answeredCount} of 21 questions completed
              </Typography>
            </div>
            <Chip label={`${Math.round(progressPercentage)}%`} />
          </div>
          <LinearProgress
            variant="determinate"
            value={progressPercentage}
            className="student-dass-progress"
          />
        </CardContent>
      </Card>

      <div className="student-dass-question-list">
        {questions.map((question, index) => (
          <Card key={question} className="student-dass-question-card">
            <CardContent>
              <div className="student-dass-question-head">
                <span>Q{index + 1}</span>
                <Typography>{question}</Typography>
              </div>
              <RadioGroup
                row
                value={
                  responses[index] !== null && responses[index] !== undefined
                    ? responses[index].toString()
                    : ''
                }
                onChange={(event) => handleResponseChange(index, event.target.value)}
                className="student-dass-options"
              >
                {responseLabels.map((label, idx) => (
                  <FormControlLabel
                    key={label}
                    value={idx.toString()}
                    control={<Radio size="small" />}
                    label={label}
                  />
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="student-dass-actions">
        <Button
          variant="outlined"
          onClick={() => navigate('/dashboard')}
          className="student-dass-secondary-action"
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={handleSubmit}
          disabled={submitting || !isComplete}
          className="student-dass-primary-action"
        >
          {submitting
            ? 'Saving...'
            : editingId
              ? 'Update Self Test'
              : isComplete
                ? 'Submit Self Test'
                : 'Complete All Questions'}
        </Button>
      </div>

      <HistoryTable />
    </>
  );
};

export default DASS21Assessment;
