import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import counselorService from '../../services/counselorService';
import FacialEmotionDetection from '../../components/FacialEmotionDetection';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`student-tabpanel-${index}`}
      aria-labelledby={`student-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const EnhancedStudentProfileView = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [student, setStudent] = useState(null);
  const [dailyCheckIns, setDailyCheckIns] = useState([]);
  const [dassHistory, setDassHistory] = useState([]);
  const [chatbotSummary, setChatbotSummary] = useState(null);
  const [riskAnalysis, setRiskAnalysis] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [report, setReport] = useState(null);

  // Fetch all student data on mount
  useEffect(() => {
    fetchAllStudentData();
  }, [userId]);

  const fetchAllStudentData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [
        profileData,
        checkInsData,
        dassData,
        chatbotData,
        riskData,
        chatData,
        sessionsData,
      ] = await Promise.all([
        counselorService.getStudentCompleteProfile(userId),
        counselorService.getStudentDailyCheckIns(userId, 30),
        counselorService.getStudentDASSHistory(userId, 30),
        counselorService.getStudentChatbotSummary(userId, 30),
        counselorService.getStudentRiskAnalysis(userId),
        counselorService.getStudentChatMessages(userId, 0, 50),
        counselorService.getStudentSessions(userId),
      ]);

      setStudent(profileData);
      setDailyCheckIns(checkInsData.check_ins || []);
      setDassHistory(dassData.history || []);
      setChatbotSummary(chatbotData);
      setRiskAnalysis(riskData);
      setChatMessages(chatData.messages || []);
      setSessions(sessionsData.sessions || []);
    } catch (err) {
      console.error('Error fetching student data:', err);
      setError(err.response?.data?.detail || 'Failed to load student data');
    } finally {
      setLoading(false);
    }
  };

  // Send message to student
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      setSendingMessage(true);
      await counselorService.sendStudentMessage(userId, newMessage);
      setNewMessage('');
      // Refresh chat messages
      const updatedChats = await counselorService.getStudentChatMessages(userId, 0, 50);
      setChatMessages(updatedChats.messages || []);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  // Generate analysis report
  const handleGenerateReport = async () => {
    try {
      setGeneratingReport(true);
      const reportData = await counselorService.generateStudentAnalysisReport(userId);
      setReport(reportData);
    } catch (err) {
      console.error('Error generating report:', err);
      setError('Failed to generate report');
    } finally {
      setGeneratingReport(false);
    }
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

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!student) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">Student data not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/counselor/students')}
          >
            Back to Students
          </Button>
        </Box>

        {/* Student Info Card */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm="auto">
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  backgroundColor: '#667eea',
                  fontSize: '2rem',
                }}
              >
                {student.full_name?.charAt(0).toUpperCase()}
              </Avatar>
            </Grid>
            <Grid item xs={12} sm>
              <Typography variant="h5" fontWeight="bold">
                {student.full_name}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {student.email} • ID: {student.id}
              </Typography>
              <Box sx={{ mt: 1, display: 'flex', gap: 2 }}>
                <Chip
                  label={student.risk_level || 'N/A'}
                  sx={{
                    backgroundColor: getRiskLevelColor(student.risk_level),
                    color: 'white',
                  }}
                />
                <Chip label={`Risk Score: ${student.risk_score || 'N/A'}`} />
              </Box>
            </Grid>
            <Grid item xs={12} sm="auto">
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={() => setReportDialogOpen(true)}
                sx={{ backgroundColor: '#667eea' }}
              >
                Generate Report
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Quick Stats */}
        {riskAnalysis && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Avg Risk Level (Month)
                  </Typography>
                  <Typography variant="h6">{riskAnalysis.avg_risk_level || 'N/A'}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Daily Check-in Avg
                  </Typography>
                  <Typography variant="h6">{riskAnalysis.daily_checkin_score || 'N/A'}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    DASS21 Avg (Month)
                  </Typography>
                  <Typography variant="h6">{riskAnalysis.dass21_avg || 'N/A'}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Bot Analysis Score
                  </Typography>
                  <Typography variant="h6">{riskAnalysis.bot_analysis_score || 'N/A'}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Error Alert */}
        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
      </Box>

      {/* Tabs */}
      <Paper>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Overview" />
          <Tab label="Daily Check-ins" />
          <Tab label="DASS21 Results" />
          <Tab label="Chatbot Summary" />
          <Tab label="Risk Analysis" />
          <Tab label="Chat" />
          <Tab label="Sessions" />
        </Tabs>

        {/* TAB 0: OVERVIEW */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Student Profile Overview
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Personal Information
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2">
                    <strong>Department:</strong> {student.department || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Year of Study:</strong> {student.year_of_study || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Status:</strong> {student.is_active ? 'Active' : 'Inactive'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Member Since:</strong> {new Date(student.created_at).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Current Assessment
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2">
                    <strong>Risk Level:</strong>{' '}
                    <Chip
                      label={student.risk_level || 'N/A'}
                      size="small"
                      sx={{
                        backgroundColor: getRiskLevelColor(student.risk_level),
                        color: 'white',
                      }}
                    />
                  </Typography>
                  <Typography variant="body2">
                    <strong>Risk Score:</strong> {student.risk_score || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Last Assessment:</strong> {new Date(student.last_assessment).toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* TAB 1: DAILY CHECK-INS */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Daily Check-in History (Last 30 Days)
          </Typography>
          {dailyCheckIns.length === 0 ? (
            <Alert severity="info">No daily check-ins available</Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Mood</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Stress</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Sleep (hrs)</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Anxiety</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Concerns</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dailyCheckIns.map((checkin) => (
                    <TableRow key={checkin.id}>
                      <TableCell>{new Date(checkin.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>{checkin.mood}/5</TableCell>
                      <TableCell>{checkin.stress_level}/10</TableCell>
                      <TableCell>{checkin.sleep_hours}</TableCell>
                      <TableCell>{checkin.anxiety_level}/10</TableCell>
                      <TableCell>
                        {checkin.self_harm_thoughts && <Chip label="Self-harm" color="error" size="small" />}
                        {checkin.negative_thoughts && <Chip label="Negative thoughts" size="small" />}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        {/* TAB 2: DASS21 RESULTS */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            DASS21 Assessment Results
          </Typography>
          {dassHistory.length === 0 ? (
            <Alert severity="info">No DASS21 assessments available</Alert>
          ) : (
            <>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', mt: 2 }}>
                Monthly Averages
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Depression Avg
                      </Typography>
                      <Typography variant="h6">
                        {dassHistory.reduce((sum, d) => sum + (d.depression_score || 0), 0) / dassHistory.length || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Anxiety Avg
                      </Typography>
                      <Typography variant="h6">
                        {dassHistory.reduce((sum, d) => sum + (d.anxiety_score || 0), 0) / dassHistory.length || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Stress Avg
                      </Typography>
                      <Typography variant="h6">
                        {dassHistory.reduce((sum, d) => sum + (d.stress_score || 0), 0) / dassHistory.length || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Total Avg
                      </Typography>
                      <Typography variant="h6">
                        {dassHistory.reduce((sum, d) => sum + (d.total_dass21_score || 0), 0) / dassHistory.length || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', mt: 2 }}>
                Recent Assessments
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Depression</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Anxiety</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Stress</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dassHistory.map((assessment) => (
                      <TableRow key={assessment.id}>
                        <TableCell>{new Date(assessment.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>{assessment.depression_score}</TableCell>
                        <TableCell>{assessment.anxiety_score}</TableCell>
                        <TableCell>{assessment.stress_score}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{assessment.total_dass21_score}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </TabPanel>

        {/* TAB 3: CHATBOT SUMMARY */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Chatbot Interaction Analysis & Risk Detection
          </Typography>
          {!chatbotSummary ? (
            <Alert severity="info">No chatbot analysis available</Alert>
          ) : (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Risk Assessment from Chat
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2">
                      <strong>Risk Score:</strong> {chatbotSummary.risk_score || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Risk Level:</strong>{' '}
                      <Chip
                        label={chatbotSummary.risk_level || 'N/A'}
                        size="small"
                        sx={{
                          backgroundColor: getRiskLevelColor(chatbotSummary.risk_level),
                          color: 'white',
                        }}
                      />
                    </Typography>
                    <Typography variant="body2">
                      <strong>Sentiment:</strong> {chatbotSummary.sentiment || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Trend:</strong> {chatbotSummary.trend || 'N/A'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Key Concerns Identified
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    {chatbotSummary.keywords && chatbotSummary.keywords.length > 0 ? (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {chatbotSummary.keywords.map((keyword, idx) => (
                          <Chip key={idx} label={keyword} color="warning" size="small" />
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="textSecondary">No specific concerns identified</Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              {chatbotSummary.summary && (
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Chat Summary
                      </Typography>
                      <Typography variant="body2">{chatbotSummary.summary}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          )}
        </TabPanel>

        {/* TAB 4: RISK ANALYSIS */}
        <TabPanel value={tabValue} index={4}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Section-wise Risk Score Breakdown
          </Typography>
          {!riskAnalysis ? (
            <Alert severity="info">No risk analysis available</Alert>
          ) : (
            <Grid container spacing={2}>
              {[
                { label: 'Daily Check-in Score', value: riskAnalysis.daily_checkin_score },
                { label: 'DASS21 Score', value: riskAnalysis.dass21_score },
                { label: 'Bot Analysis Score', value: riskAnalysis.bot_analysis_score },
                { label: 'Profile Risk Score', value: riskAnalysis.profile_risk_score },
              ].map((section) => (
                <Grid item xs={12} key={section.label}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {section.label}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {section.value || 'N/A'}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min((section.value || 0) / 100 * 100, 100)}
                        sx={{
                          backgroundColor: '#e0e0e0',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: getRiskLevelColor(
                              (section.value || 0) > 50 ? 'HIGH' : (section.value || 0) > 30 ? 'MEDIUM' : 'LOW'
                            ),
                          },
                        }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* TAB 5: CHAT WITH STUDENT */}
        <TabPanel value={tabValue} index={5}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Chat with {student.full_name}
          </Typography>
          <Paper sx={{ height: 400, overflow: 'auto', p: 2, mb: 2, backgroundColor: '#f9f9f9' }}>
            {chatMessages.length === 0 ? (
              <Typography color="textSecondary" align="center" sx={{ mt: 10 }}>
                No messages yet. Start a conversation!
              </Typography>
            ) : (
              <List>
                {chatMessages.map((msg) => (
                  <ListItem key={msg.id} sx={{ justifyContent: msg.sender === 'counselor' ? 'flex-end' : 'flex-start' }}>
                    <Paper
                      sx={{
                        p: 1.5,
                        maxWidth: '70%',
                        backgroundColor: msg.sender === 'counselor' ? '#667eea' : '#f0f0f0',
                        color: msg.sender === 'counselor' ? 'white' : 'black',
                      }}
                    >
                      <Typography variant="body2">{msg.message}</Typography>
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>
                        {new Date(msg.created_at).toLocaleTimeString()}
                      </Typography>
                    </Paper>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              multiline
              rows={2}
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={sendingMessage}
            />
            <Button
              variant="contained"
              onClick={handleSendMessage}
              disabled={sendingMessage || !newMessage.trim()}
              sx={{ backgroundColor: '#667eea' }}
            >
              <SendIcon />
            </Button>
          </Box>
        </TabPanel>

        {/* TAB 6: SESSIONS */}
        <TabPanel value={tabValue} index={6}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Counseling Session History
          </Typography>
          {sessions.length === 0 ? (
            <Alert severity="info">No counseling sessions yet</Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Risk Level</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Notes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>{new Date(session.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>{session.session_type || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip label={session.status || 'N/A'} size="small" />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={session.risk_level_at_escalation || 'N/A'}
                          size="small"
                          sx={{
                            backgroundColor: getRiskLevelColor(session.risk_level_at_escalation),
                            color: 'white',
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {session.counselor_notes || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>
      </Paper>

      {/* Generate Report Dialog */}
      <Dialog
        open={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Student Analysis Report</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {generatingReport ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress />
            </Box>
          ) : report ? (
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                Executive Summary
              </Typography>
              <Typography variant="body2" paragraph>
                {report.summary || 'Analysis report generated'}
              </Typography>
              {report.recommendations && (
                <>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Recommendations
                  </Typography>
                  <Typography variant="body2" component="div">
                    <ul>
                      {report.recommendations.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </Typography>
                </>
              )}
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportDialogOpen(false)}>Close</Button>
          {!report && (
            <Button
              variant="contained"
              onClick={handleGenerateReport}
              disabled={generatingReport}
              sx={{ backgroundColor: '#667eea' }}
            >
              Generate Report
            </Button>
          )}
          {report && (
            <Button variant="contained" sx={{ backgroundColor: '#4CAF50' }}>
              Download PDF
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EnhancedStudentProfileView;
