import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  CircularProgress,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ButtonGroup,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBack from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import api from '../services/api';

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

  // Load today's assessment and history on component mount
  useEffect(() => {
    const loadAssessments = async () => {
      try {
        setLoading(true);

        // Fetch today's assessment
        try {
          const todayResponse = await api.get('/api/assessments/dass21/today');
          const today = todayResponse.data;
          setResponses(today.responses);
          setEditingId(today.id);
          setResult(today);
          console.log('✅ Loaded today\'s DASS21 assessment for editing');
        } catch (err) {
          if (err.response?.status !== 404) {
            console.error('Error loading today\'s assessment:', err);
          }
          // 404 is expected if no assessment today
        }

        // Fetch history
        try {
          const historyResponse = await api.get('/api/assessments/dass21/history', {
            params: { limit: 50 }
          });
          setHistory(historyResponse.data.assessments || []);
          console.log('✅ Loaded DASS21 history');
        } catch (err) {
          console.error('Error loading history:', err);
        }
      } catch (err) {
        console.error('Error loading assessments:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAssessments();
  }, []);

  
  const questions = [
    "I found myself getting upset by quite trivial things.",
    "I was aware of dryness of my mouth.",
    "I couldn't seem to experience any positive feeling at all.",
    "I experienced breathing difficulty (e.g., excessively rapid breathing, breathlessness in the absence of physical exertion).",
    "I found it difficult to work up the initiative to do things.",
    "I tended to over-react to situations.",
    "I experienced trembling (e.g., in the hands).",
    "I felt that I was using a lot of nervous energy.",
    "I was worried about situations in which I might panic and make a fool of myself.",
    "I felt that I had nothing to look forward to.",
    "I found myself getting upset rather easily.",
    "I felt that I was rather touchy.",
    "I was able to laugh and see the funny side of things.",
    "I felt downhearted and blue.",
    "I was intolerant of anything that kept me from getting on with what I was doing.",
    "I felt I was close to panic.",
    "I was unable to become enthusiastic about anything.",
    "I felt I wasn't worth much as a person.",
    "I felt that I was rather irritable.",
    "I felt I had a lot of nervous energy.",
    "I thought of myself as a worthless person.",
  ];

  const responseLabels = [
    "Did not apply to me at all",
    "Applied to me to some degree",
    "Applied to me to a considerable degree",
    "Applied to me very much",
  ];

  const handleResponseChange = (index, value) => {
    const newResponses = [...responses];
    newResponses[index] = parseInt(value);
    setResponses(newResponses);
  };

  const getSeverityLevel = (score, type) => {
    const severities = {
      depression: {
        normal: [0, 9],
        mild: [10, 13],
        moderate: [14, 20],
        severe: [21, 27],
        very_severe: [28, 126],
      },
      anxiety: {
        normal: [0, 7],
        mild: [8, 9],
        moderate: [10, 14],
        severe: [15, 19],
        very_severe: [20, 126],
      },
      stress: {
        normal: [0, 14],
        mild: [15, 18],
        moderate: [19, 25],
        severe: [26, 33],
        very_severe: [34, 126],
      },
    };

    const severityMap = severities[type];
    for (const [level, range] of Object.entries(severityMap)) {
      if (score >= range[0] && score <= range[1]) {
        return level.replace('_', ' ').toUpperCase();
      }
    }
    return 'VERY SEVERE';
  };

  const getSeverityColor = (severity) => {
    const colorMap = {
      NORMAL: '#388e3c',
      MILD: '#fbc02d',
      MODERATE: '#f57c00',
      SEVERE: '#d32f2f',
      'VERY SEVERE': '#8b0000',
    };
    return colorMap[severity] || '#666';
  };

  const isComplete = responses.every(r => r !== null && r !== undefined);

  const handleSubmit = async () => {
    if (!isComplete) {
      setError('Please answer all 21 questions before submitting');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const requestData = {
        responses: responses,
      };
      
      console.log('📤 Sending DASS21 request:', JSON.stringify(requestData));
      console.log('📋 Response values:', responses);
      console.log('✅ Total responses:', responses.length);
      
      let response;
      if (editingId) {
        // Update existing assessment
        console.log('🔄 Updating assessment ID:', editingId);
        response = await api.put(`/api/assessments/dass21/${editingId}`, requestData);
        setSuccess('✅ DASS21 Assessment updated successfully!');
      } else {
        // Create new assessment
        console.log('📝 Creating new assessment');
        response = await api.post('/api/assessments/dass21', requestData);
        setSuccess('✅ DASS21 Assessment submitted successfully!');
        setEditingId(response.data.id);
      }

      console.log('✅ DASS21 response received:', response.data);
      setResult(response.data);
      
      // Refresh history
      try {
        const historyResponse = await api.get('/api/assessments/dass21/history', { params: { limit: 50 } });
        setHistory(historyResponse.data.assessments || []);
      } catch (err) {
        console.error('Error refreshing history:', err);
      }
    } catch (err) {
      console.error('❌ DASS21 Error:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      setError('Failed to submit DASS21 assessment: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditHistory = (assessment) => {
    setResponses(assessment.responses);
    setEditingId(assessment.id);
    setResult(null);
    setSuccess('');
    console.log('✏️ Editing assessment:', assessment.id);
  };

  const progressPercentage = (responses.filter(r => r !== null && r !== undefined).length / 21) * 100;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
    
  // Show loading spinner
  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography>Loading your DASS21 assessments...</Typography>
        </Box>
      </Container>
    );
  }

  // If we have a result, show results view
  if (result) {
    return (
      <Container maxWidth="md" sx={{ py: 2 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/dashboard')} sx={{ mb: 2, fontWeight: 'bold', textTransform: 'none' }}>
          Back to Dashboard
        </Button>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setResult(null)}
            sx={{ fontWeight: 'bold', textTransform: 'none' }}
          >
            ← Back to Assessment
          </Button>
        </Box>

        <Paper sx={{ p: 2, background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)' }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#1a237e' }}>
              🧠 Your DASS21 Assessment Results
            </Typography>
            {editingId && (
              <Typography variant="caption" sx={{ color: '#666' }}>
                {editingId ? 'Completed: ' + formatDate(result.created_at) : 'New Assessment'}
              </Typography>
            )}
          </Box>

          <Grid container spacing={1.5} sx={{ mb: 3 }}>
            {/* Depression */}
            <Grid item xs={12} md={4}>
              <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
                  <Typography color="text.secondary" variant="caption" sx={{ fontSize: '0.75rem' }}>
                    😢 Depression
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 0.5, color: getSeverityColor(getSeverityLevel(result.depression_score, 'depression')) }}>
                    {result.depression_score}
                  </Typography>
                  <Chip
                    label={getSeverityLevel(result.depression_score, 'depression')}
                    size="small"
                    sx={{
                      mt: 1,
                      backgroundColor: getSeverityColor(getSeverityLevel(result.depression_score, 'depression')),
                      color: 'white',
                      fontSize: '0.7rem',
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Anxiety */}
            <Grid item xs={12} md={4}>
              <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
                  <Typography color="text.secondary" variant="caption" sx={{ fontSize: '0.75rem' }}>
                    😰 Anxiety
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 0.5, color: getSeverityColor(getSeverityLevel(result.anxiety_score, 'anxiety')) }}>
                    {result.anxiety_score}
                  </Typography>
                  <Chip
                    label={getSeverityLevel(result.anxiety_score, 'anxiety')}
                    size="small"
                    sx={{
                      mt: 1,
                      backgroundColor: getSeverityColor(getSeverityLevel(result.anxiety_score, 'anxiety')),
                      color: 'white',
                      fontSize: '0.7rem',
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Stress */}
            <Grid item xs={12} md={4}>
              <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
                  <Typography color="text.secondary" variant="caption" sx={{ fontSize: '0.75rem' }}>
                    😟 Stress
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 0.5, color: getSeverityColor(getSeverityLevel(result.stress_score, 'stress')) }}>
                    {result.stress_score}
                  </Typography>
                  <Chip
                    label={getSeverityLevel(result.stress_score, 'stress')}
                    size="small"
                    sx={{
                      mt: 1,
                      backgroundColor: getSeverityColor(getSeverityLevel(result.stress_score, 'stress')),
                      color: 'white',
                      fontSize: '0.7rem',
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Total Score */}
          <Card sx={{ background: `linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)`, boxShadow: '0 4px 15px rgba(0,0,0,0.1)', mb: 2 }}>
            <CardContent sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                Total DASS21 Score
              </Typography>
              <Typography variant="h4" sx={{ color: '#f57c00', fontWeight: 'bold', mb: 2 }}>
                {result.total_dass21_score} / 126
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(result.total_dass21_score / 126) * 100}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: '#f0f0f0',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#f57c00',
                    borderRadius: 5,
                  },
                }}
              />
            </CardContent>
          </Card>

          <Alert severity="info" sx={{ mb: 2, fontSize: '0.85rem' }}>
            📊 <strong>Next Steps:</strong> Share these results with your counselor to discuss appropriate support strategies tailored to your needs.
          </Alert>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setResult(null);
                setResponses(new Array(21).fill(null));
              }}
              sx={{ fontWeight: 'bold', textTransform: 'none' }}
            >
              New Assessment
            </Button>

            <Button
              variant="outlined"
              onClick={() => navigate('/dashboard')}
              sx={{ fontWeight: 'bold', textTransform: 'none' }}
            >
              Back to Dashboard
            </Button>
          </Box>
        </Paper>

        {/* History Table - Always Show Below Results */}
        <Paper sx={{ mt: 3, p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            📋 Previous DASS21 Results
          </Typography>
          
          {history.length === 0 ? (
            <Typography color="text.secondary">No previous assessments. This is your first DASS21 assessment.</Typography>
          ) : (
            <TableContainer sx={{ mt: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ background: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>📅 Date</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>😢 Depression</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>😰 Anxiety</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>😟 Stress</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>📊 Total</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>⚙️ Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history.map((assessment, idx) => (
                    <TableRow 
                      key={idx} 
                      hover
                      sx={{ 
                        '&:hover': { backgroundColor: '#f9f9f9' },
                        backgroundColor: idx === 0 ? '#fffacd' : 'transparent'
                      }}
                    >
                      <TableCell sx={{ fontWeight: idx === 0 ? 'bold' : 'normal' }}>
                        {formatDate(assessment.created_at)}
                        {idx === 0 && <span style={{ marginLeft: '8px', fontSize: '0.8rem', color: '#ff9800' }}>Today</span>}
                      </TableCell>
                      <TableCell align="right">{assessment.depression_score}</TableCell>
                      <TableCell align="right">{assessment.anxiety_score}</TableCell>
                      <TableCell align="right">{assessment.stress_score}</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{assessment.total_dass21_score}</TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<EditIcon />}
                          onClick={() => handleEditHistory(assessment)}
                          sx={{ textTransform: 'none' }}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        <Box sx={{ mt: 3, pb: 2, display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/dashboard')}
            sx={{ fontWeight: 'bold', textTransform: 'none' }}
          >
            Back to Dashboard
          </Button>
        </Box>
      </Container>
    );
  }

  // History Table - Removed (moved to results view)
  return (
    <Container maxWidth="md" sx={{ py: 2 }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/dashboard')} sx={{ mb: 2, fontWeight: 'bold', textTransform: 'none' }}>
        Back to Dashboard
      </Button>

      <Paper sx={{ p: 2, background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)' }}>
        <Box sx={{ mb: 2, pb: 2, borderBottom: '2px solid #1976d2' }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#1a237e' }}>
            🧠 DASS21 Assessment
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Depression, Anxiety, and Stress Scale - 21 Items
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        {/* Progress Bar */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
              Progress
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
              {responses.filter(r => r !== null && r !== undefined).length} / 21
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progressPercentage}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: '#f0f0f0',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#1976d2',
                borderRadius: 4,
              },
            }}
          />
        </Box>

        {/* Questions */}
        <Box sx={{ mb: 2 }}>
          {questions.map((question, index) => (
            <Card key={index} sx={{ mb: 1.5, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
              <CardContent sx={{ p: 1.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1, color: '#1a237e' }}>
                  Q{index + 1}. {question}
                </Typography>
                <RadioGroup
                  row
                  value={responses[index] !== null && responses[index] !== undefined ? responses[index].toString() : ''}
                  onChange={(e) => handleResponseChange(index, e.target.value)}
                  sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}
                >
                  {responseLabels.map((label, idx) => (
                    <FormControlLabel
                      key={idx}
                      value={idx.toString()}
                      control={<Radio size="small" />}
                      label={<Typography variant="caption" sx={{ fontSize: '0.7rem' }}>{label}</Typography>}
                      sx={{ m: 0 }}
                    />
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Submit Button */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3, pt: 2, borderTop: '2px solid #e0e0e0' }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/dashboard')}
            sx={{ fontWeight: 'bold', textTransform: 'none', px: 3 }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={submitting || !isComplete}
            sx={{ fontWeight: 'bold', textTransform: 'none', px: 4 }}
          >
            {submitting 
              ? 'Updating...' 
              : isComplete 
              ? editingId 
                ? '✏️ Update Assessment' 
                : '✅ Submit Assessment'
              : '⏳ Complete All Questions'
            }
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default DASS21Assessment;