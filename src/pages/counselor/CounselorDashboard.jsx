import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  LinearProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Popover,
  Stack,
  Switch,
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
  Call as CallIcon,
  CallEnd as CallEndIcon,
  Download as DownloadIcon,
  EventAvailable as EventAvailableIcon,
  FactCheck as FactCheckIcon,
  Groups as GroupsIcon,
  HealthAndSafety as HealthAndSafetyIcon,
  Insights as InsightsIcon,
  MailOutline as MailOutlineIcon,
  MonitorHeart as MonitorHeartIcon,
  NotificationsActive as NotificationsActiveIcon,
  PersonSearch as PersonSearchIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  Visibility as VisibilityIcon,
  VolumeOff as VolumeOffIcon,
  VolumeUp as VolumeUpIcon,
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
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import useWebRTCAudioCall, { getCallAudioStatusText } from '../../hooks/useWebRTCAudioCall';
import { Sidebar } from '../../components/layout/Sidebar';

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
const formatCallDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return `${minutes} min ${rest.toString().padStart(2, '0')} sec`;
};

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
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [students, setStudents] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [incomingCalls, setIncomingCalls] = useState([]);
  const [activeCall, setActiveCall] = useState(null);
  const [callSeconds, setCallSeconds] = useState(0);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [callAnchor, setCallAnchor] = useState(null);
  const [alarmMuted, setAlarmMuted] = useState(false);
  const [seenNotificationKeys, setSeenNotificationKeys] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem('counselorSeenNotifications') || '[]'));
    } catch {
      return new Set();
    }
  });
  const beepTimerRef = useRef(null);
  const callRingTimerRef = useRef(null);
  const audioContextRef = useRef(null);
  const {
    remoteAudioRef,
    audioStatus,
    audioError,
    remoteAudioReady,
    localMuted,
    setLocalMuted,
    playRemoteAudio,
  } = useWebRTCAudioCall(activeCall, user?.id);

  const pickVisibleActiveCall = (calls = []) => (
    calls.find((call) => call.status === 'answered') ||
    calls.find((call) => call.status === 'ringing' && Number(call.caller_id) === Number(user?.id)) ||
    null
  );

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [dashboardData, studentData, alertsData, unreadData, callsData, activeCallsData] = await Promise.all([
        counselorService.getDashboard(),
        counselorService.getAllStudents({ limit: 100 }),
        counselorService.getAlerts({ unread_only: false, limit: 20 }),
        api.get('/api/chat/unread-count').catch(() => ({ data: { unread_count: 0 } })),
        api.get('/api/chat/calls/incoming').catch(() => ({ data: [] })),
        api.get('/api/chat/calls/active').catch(() => ({ data: [] })),
      ]);
      setDashboard(dashboardData);
      setStudents(studentData.students || []);
      setAlerts(alertsData.alerts || []);
      setUnreadMessageCount(unreadData.data?.unread_count || 0);
      setIncomingCalls(callsData.data || []);
      setActiveCall(pickVisibleActiveCall(activeCallsData.data || []));
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.error || 'Unable to load counselor dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const loadLiveHeaderCounts = async () => {
      const [unreadData, callsData] = await Promise.all([
        api.get('/api/chat/unread-count').catch(() => ({ data: { unread_count: 0 } })),
        api.get('/api/chat/calls/incoming').catch(() => ({ data: [] })),
      ]);
      setUnreadMessageCount(unreadData.data?.unread_count || 0);
      setIncomingCalls(callsData.data || []);
    };

    loadLiveHeaderCounts();
    const interval = setInterval(loadLiveHeaderCounts, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadActiveCall = async () => {
      const response = await api.get('/api/chat/calls/active').catch(() => ({ data: [] }));
      setActiveCall(pickVisibleActiveCall(response.data || []));
    };
    loadActiveCall();
    const interval = setInterval(loadActiveCall, 3000);
    return () => clearInterval(interval);
  }, [user?.id]);

  useEffect(() => {
    if (!activeCall?.answered_at) {
      setCallSeconds(0);
      return undefined;
    }
    const update = () => {
      setCallSeconds(Math.max(0, Math.floor((Date.now() - new Date(activeCall.answered_at).getTime()) / 1000)));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [activeCall?.answered_at]);

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
  const notificationOpen = Boolean(notificationAnchor);
  const callPopoverOpen = Boolean(callAnchor);

  const notifications = useMemo(() => {
    const alertItems = alerts.map((alert) => ({
      key: `alert-${alert.id}`,
      source: 'alert',
      alertId: alert.id,
      title: alert.alert_type === 'dass21_submission'
        ? 'DASS-21 submitted'
        : alert.alert_type === 'escalation'
          ? 'Counselor attention needed'
          : 'Student alert',
      message: `${alert.student_name}: ${alert.message}`,
      status: alert.risk_level || 'Alert',
      createdAt: alert.created_at,
      unread: !alert.is_read,
      priority: ['HIGH', 'SEVERE', 'CRITICAL'].includes(alert.risk_level) ? 1 : 2,
      studentId: alert.user_id,
    }));

    const riskItems = students
      .filter((student) => ['HIGH', 'SEVERE'].includes(student.risk_level))
      .map((student) => ({
        key: `risk-${student.id}-${student.risk_level}-${student.fusion_score ?? 'none'}`,
        source: 'risk',
        title: student.risk_level === 'SEVERE' ? 'Severe level flagged' : 'Counselor support needed',
        message: `${student.full_name || student.name || 'Student'} is currently marked ${student.risk_level}.`,
        status: student.risk_level,
        createdAt: student.last_assessment || student.last_checkin,
        unread: !seenNotificationKeys.has(`risk-${student.id}-${student.risk_level}-${student.fusion_score ?? 'none'}`),
        priority: student.risk_level === 'SEVERE' ? 0 : 1,
        studentId: student.id,
      }));

    return [...alertItems, ...riskItems]
      .sort((a, b) => {
        if (a.unread !== b.unread) return a.unread ? -1 : 1;
        if (a.priority !== b.priority) return a.priority - b.priority;
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      })
      .slice(0, 24);
  }, [alerts, seenNotificationKeys, students]);

  const notificationCount = notifications.filter((item) => item.unread).length;
  const messageCount = unreadMessageCount;
  const callCount = incomingCalls.length;
  const callAudioStatusText = getCallAudioStatusText(audioStatus, audioError);

  const playBeep = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const context = audioContextRef.current || new AudioContext();
      audioContextRef.current = context;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, context.currentTime);
      gain.gain.setValueAtTime(0.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.18, context.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.32);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.34);
    } catch {
      // Browser audio may be blocked until the counselor interacts with the page.
    }
  };

  const playCallRing = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const context = audioContextRef.current || new AudioContext();
      audioContextRef.current = context;
      [660, 880].forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const startAt = context.currentTime + index * 0.18;
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(frequency, startAt);
        gain.gain.setValueAtTime(0.0001, startAt);
        gain.gain.exponentialRampToValueAtTime(0.16, startAt + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.22);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(startAt);
        oscillator.stop(startAt + 0.24);
      });
    } catch {
      // Browser audio may be blocked until the counselor interacts with the page.
    }
  };

  useEffect(() => {
    if (beepTimerRef.current) {
      clearInterval(beepTimerRef.current);
      beepTimerRef.current = null;
    }

    if (notificationCount > 0 && !notificationOpen && !alarmMuted) {
      playBeep();
      beepTimerRef.current = setInterval(playBeep, 4500);
    }

    return () => {
      if (beepTimerRef.current) {
        clearInterval(beepTimerRef.current);
        beepTimerRef.current = null;
      }
    };
  }, [alarmMuted, notificationCount, notificationOpen]);

  useEffect(() => {
    if (callRingTimerRef.current) {
      clearInterval(callRingTimerRef.current);
      callRingTimerRef.current = null;
    }

    if (incomingCalls.length > 0 && !callPopoverOpen) {
      playCallRing();
      callRingTimerRef.current = setInterval(playCallRing, 2600);
    }

    return () => {
      if (callRingTimerRef.current) {
        clearInterval(callRingTimerRef.current);
        callRingTimerRef.current = null;
      }
    };
  }, [callPopoverOpen, incomingCalls.length]);

  const markDerivedNotificationsSeen = (items) => {
    const derivedKeys = items
      .filter((item) => item.source !== 'alert')
      .map((item) => item.key);
    if (derivedKeys.length === 0) return;
    setSeenNotificationKeys((current) => {
      const next = new Set([...current, ...derivedKeys]);
      localStorage.setItem('counselorSeenNotifications', JSON.stringify([...next]));
      return next;
    });
  };

  const handleOpenNotifications = async (event) => {
    setNotificationAnchor(event.currentTarget);
    markDerivedNotificationsSeen(notifications);

    const unreadAlerts = notifications.filter((item) => item.source === 'alert' && item.unread);
    if (unreadAlerts.length > 0) {
      setAlerts((current) =>
        current.map((alert) => (
          unreadAlerts.some((item) => item.alertId === alert.id)
            ? { ...alert, is_read: true }
            : alert
        )),
      );
      await Promise.allSettled(
        unreadAlerts.map((item) => counselorService.markAlertAsRead(item.alertId)),
      );
    }
  };

  const handleCloseNotifications = () => {
    setNotificationAnchor(null);
  };

  const handleOpenCalls = (event) => {
    setCallAnchor(event.currentTarget);
  };

  const handleCloseCalls = () => {
    setCallAnchor(null);
  };

  const handleAnswerCall = async (call) => {
    try {
      const response = await api.post(`/api/chat/calls/${call.id}/answer`);
      setIncomingCalls((items) => items.filter((item) => item.id !== call.id));
      localStorage.setItem('selectedChatConversationId', String(response.data.student_id));
      setActiveCall(response.data);
      setCallAnchor(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to answer call request');
    }
  };

  const handleDeclineCall = async (call) => {
    try {
      await api.post(`/api/chat/calls/${call.id}/decline`);
      setIncomingCalls((items) => items.filter((item) => item.id !== call.id));
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to decline call request');
    }
  };

  const handleStartStudentCall = async (student) => {
    try {
      const response = await api.post('/api/chat/calls/request', {
        receiver_id: student.id,
      });
      setActiveCall(response.data);
      setIncomingCalls((items) => items.filter((item) => item.id !== response.data.id));
      setCallAnchor(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to start student call');
    }
  };

  const handleEndCall = async () => {
    if (!activeCall) return;
    try {
      const response = await api.post(`/api/chat/calls/${activeCall.id}/end`);
      setActiveCall(response.data.status === 'ended' ? null : response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to end call');
    }
  };

  const handleCancelOutgoingCall = async () => {
    if (!activeCall || activeCall.status !== 'ringing') return;
    try {
      const response = await api.post(`/api/chat/calls/${activeCall.id}/cancel`);
      setActiveCall(response.data.status === 'cancelled' ? null : response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to cancel call');
    }
  };

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

  const HeaderActionButton = ({ label, count, icon, onClick, urgent = false }) => (
    <Tooltip title={label}>
      <IconButton
        onClick={onClick}
        sx={{
          width: 46,
          height: 46,
          bgcolor: urgent ? 'rgba(254, 226, 226, 0.95)' : 'rgba(255,255,255,0.18)',
          color: urgent ? '#b91c1c' : '#ffffff',
          border: urgent ? '1px solid rgba(239, 68, 68, 0.32)' : '1px solid rgba(255,255,255,0.22)',
          '&:hover': {
            bgcolor: urgent ? '#fee2e2' : 'rgba(255,255,255,0.28)',
          },
        }}
      >
        <Badge
          badgeContent={count}
          color={urgent ? 'error' : 'primary'}
          max={99}
          sx={{
            '& .MuiBadge-badge': {
              fontWeight: 900,
              minWidth: 18,
              height: 18,
            },
          }}
        >
          {icon}
        </Badge>
      </IconButton>
    </Tooltip>
  );

  if (loading) {
    return (
      <div className="student-shell">
        <Sidebar variant="counselor" />
        <main className="student-main">
          <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: '#f8fafc', pt: { xs: 6, lg: 0 } }}>
            <Stack alignItems="center" spacing={2}>
              <CircularProgress />
              <Typography sx={{ color: '#64748b', fontWeight: 700 }}>
                Loading counselor dashboard...
              </Typography>
            </Stack>
          </Box>
        </main>
      </div>
    );
  }

  return (
    <div className="student-shell">
      <Sidebar variant="counselor" />
      <main className="student-main">
        <Box sx={{ minHeight: '100vh', bgcolor: '#eef7f6', pt: { xs: 6, lg: 0 } }}>
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
              <Stack direction="row" spacing={1} justifyContent={{ xs: 'flex-start', sm: 'flex-end' }}>
                <HeaderActionButton
                  label="Open counselor messages"
                  count={messageCount}
                  icon={<MailOutlineIcon />}
                  onClick={() => navigate('/counselor/chat')}
                />
                <HeaderActionButton
                  label="Incoming student calls"
                  count={callCount}
                  icon={<CallIcon />}
                  onClick={handleOpenCalls}
                  urgent={callCount > 0}
                />
                <HeaderActionButton
                  label={alarmMuted ? 'Notifications muted' : 'Open notifications'}
                  count={notificationCount}
                  icon={notificationCount > 0 && !alarmMuted ? <NotificationsActiveIcon /> : <NotificationsActiveIcon />}
                  onClick={handleOpenNotifications}
                  urgent={notificationCount > 0 && !alarmMuted}
                />
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center" justifyContent={{ xs: 'flex-start', sm: 'flex-end' }} flexWrap="wrap">
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
          </Stack>
        </Paper>

        <Popover
          open={notificationOpen}
          anchorEl={notificationAnchor}
          onClose={handleCloseNotifications}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{
            sx: {
              width: { xs: 'calc(100vw - 32px)', sm: 430 },
              maxHeight: 520,
              borderRadius: 2,
              mt: 1,
              boxShadow: '0 24px 70px rgba(15, 23, 42, 0.18)',
            },
          }}
        >
          <Box sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
              <Box>
                <Typography sx={{ color: '#0f172a', fontWeight: 900 }}>
                  Notifications
                </Typography>
                <Typography sx={{ color: '#64748b', fontSize: '0.82rem' }}>
                  DASS submissions, alerts, and severe-level review items.
                </Typography>
              </Box>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                {alarmMuted ? <VolumeOffIcon sx={{ color: '#64748b' }} /> : <VolumeUpIcon sx={{ color: '#0f766e' }} />}
                <Switch
                  checked={!alarmMuted}
                  onChange={(event) => setAlarmMuted(!event.target.checked)}
                  size="small"
                />
              </Stack>
            </Stack>
          </Box>
          <Divider />
          <List dense disablePadding sx={{ maxHeight: 390, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <ListItem sx={{ py: 3 }}>
                <ListItemText
                  primary="No notifications"
                  secondary="New DASS submissions and severe-level alerts will appear here."
                  primaryTypographyProps={{ sx: { fontWeight: 900, color: '#0f172a' } }}
                  secondaryTypographyProps={{ sx: { color: '#64748b' } }}
                />
              </ListItem>
            ) : (
              notifications.map((item) => {
                const palette = riskPalette[item.status] || (
                  item.source === 'dass'
                    ? { soft: '#ecfeff', text: '#0f766e' }
                    : riskPalette.UNKNOWN
                );
                return (
                  <ListItemButton
                    key={item.key}
                    onClick={() => {
                      handleCloseNotifications();
                      if (item.studentId) navigate(`/counselor/student/${item.studentId}`);
                    }}
                    sx={{
                      alignItems: 'flex-start',
                      gap: 1.25,
                      px: 2,
                      py: 1.25,
                      bgcolor: item.unread ? '#f8fafc' : '#ffffff',
                      borderBottom: '1px solid #e2e8f0',
                    }}
                  >
                    <Avatar sx={{ width: 34, height: 34, bgcolor: palette.soft, color: palette.text }}>
                      {item.source === 'dass'
                        ? <AssessmentIcon fontSize="small" />
                        : item.source === 'risk'
                          ? <WarningAmberIcon fontSize="small" />
                          : <NotificationsActiveIcon fontSize="small" />}
                    </Avatar>
                    <ListItemText
                      primary={(
                        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                          <Typography sx={{ color: '#0f172a', fontWeight: 900, fontSize: '0.9rem' }}>
                            {item.title}
                          </Typography>
                          <Chip
                            label={item.status}
                            size="small"
                            sx={{ bgcolor: palette.soft, color: palette.text, fontWeight: 900 }}
                          />
                        </Stack>
                      )}
                      secondary={(
                        <Box>
                          <Typography sx={{ color: '#475569', fontSize: '0.82rem', lineHeight: 1.45 }}>
                            {item.message}
                          </Typography>
                          <Typography sx={{ color: '#94a3b8', fontSize: '0.74rem', mt: 0.35 }}>
                            {formatDate(item.createdAt)}
                          </Typography>
                        </Box>
                      )}
                    />
                  </ListItemButton>
                );
              })
            )}
          </List>
          <Divider />
          <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', gap: 1 }}>
            <Button
              size="small"
              startIcon={alarmMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
              onClick={() => setAlarmMuted((value) => !value)}
              sx={{ color: alarmMuted ? '#64748b' : '#0f766e', fontWeight: 900 }}
            >
              {alarmMuted ? 'Alarm Off' : 'Alarm On'}
            </Button>
            <Button size="small" onClick={handleCloseNotifications} sx={{ fontWeight: 900 }}>
              Close
            </Button>
          </Box>
        </Popover>

        <Popover
          open={callPopoverOpen}
          anchorEl={callAnchor}
          onClose={handleCloseCalls}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{
            sx: {
              width: { xs: 'calc(100vw - 32px)', sm: 420 },
              borderRadius: 2,
              mt: 1,
              boxShadow: '0 24px 70px rgba(15, 23, 42, 0.18)',
            },
          }}
        >
          <Box sx={{ p: 2 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
              <Box>
                <Typography sx={{ color: '#0f172a', fontWeight: 900 }}>
                  Incoming Calls
                </Typography>
                <Typography sx={{ color: '#64748b', fontSize: '0.82rem' }}>
                  Immediate call requests from assigned students.
                </Typography>
              </Box>
              <Badge badgeContent={incomingCalls.length} color="error">
                <CallIcon sx={{ color: incomingCalls.length ? '#dc2626' : '#64748b' }} />
              </Badge>
            </Stack>
          </Box>
          <Divider />
          <List dense disablePadding sx={{ maxHeight: 390, overflowY: 'auto' }}>
            {incomingCalls.length === 0 ? (
              <ListItem sx={{ py: 3 }}>
                <ListItemText
                  primary="No incoming calls"
                  secondary="When a student requests an immediate call, their details will appear here."
                  primaryTypographyProps={{ sx: { fontWeight: 900, color: '#0f172a' } }}
                  secondaryTypographyProps={{ sx: { color: '#64748b' } }}
                />
              </ListItem>
            ) : (
              incomingCalls.map((call) => (
                <ListItem
                  key={call.id}
                  alignItems="flex-start"
                  sx={{
                    px: 2,
                    py: 1.5,
                    borderBottom: '1px solid #e2e8f0',
                    bgcolor: '#fff7ed',
                  }}
                >
                  <Stack spacing={1.25} sx={{ width: '100%' }}>
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <Avatar sx={{ bgcolor: '#fee2e2', color: '#b91c1c', fontWeight: 900 }}>
                        {(call.student_name || '?').charAt(0).toUpperCase()}
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ color: '#0f172a', fontWeight: 900 }} noWrap>
                          {call.student_name}
                        </Typography>
                        <Typography sx={{ color: '#64748b', fontSize: '0.82rem' }} noWrap>
                          {call.student_email || `Student ID ${call.student_id}`}
                        </Typography>
                        <Typography sx={{ color: '#94a3b8', fontSize: '0.74rem' }}>
                          Requested {formatDate(call.created_at)}
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button
                        size="small"
                        variant="outlined"
                        color="inherit"
                        onClick={() => handleDeclineCall(call)}
                        sx={{ fontWeight: 900 }}
                      >
                        Decline
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<CallIcon />}
                        onClick={() => handleAnswerCall(call)}
                        sx={{
                          bgcolor: '#16a34a',
                          fontWeight: 900,
                          boxShadow: 'none',
                          '&:hover': { bgcolor: '#15803d', boxShadow: 'none' },
                        }}
                      >
                        Answer
                      </Button>
                    </Stack>
                  </Stack>
                </ListItem>
              ))
            )}
          </List>
          <Divider />
          <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'flex-end' }}>
            <Button size="small" onClick={handleCloseCalls} sx={{ fontWeight: 900 }}>
              Close
            </Button>
          </Box>
        </Popover>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {activeCall && (
        <Paper
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 2,
            border: '1px solid rgba(22, 163, 74, 0.24)',
            bgcolor: '#f0fdf4',
            boxShadow: '0 18px 45px rgba(15, 23, 42, 0.08)',
          }}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar sx={{ bgcolor: '#16a34a', color: '#ffffff' }}>
                <CallIcon />
              </Avatar>
              <Box>
                <Typography sx={{ color: '#14532d', fontWeight: 900 }}>
                  {activeCall.status === 'ringing' ? 'Calling' : 'In call with'} {activeCall.student_name}
                </Typography>
                <Typography sx={{ color: '#166534', fontSize: '0.85rem' }}>
                  {activeCall.status === 'answered'
                    ? `Duration ${formatCallDuration(callSeconds)}`
                    : 'Waiting for the student to answer'}
                </Typography>
                {activeCall.status === 'answered' && callAudioStatusText && (
                  <Typography sx={{ color: audioError ? '#b91c1c' : '#166534', fontSize: '0.78rem', fontWeight: 800, mt: 0.35 }}>
                    {callAudioStatusText}
                  </Typography>
                )}
              </Box>
            </Stack>
            <audio ref={remoteAudioRef} autoPlay playsInline />
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              {activeCall.status === 'answered' && remoteAudioReady && (
                <Button
                  variant="contained"
                  onClick={playRemoteAudio}
                  aria-label="Play remote call audio"
                  sx={{ bgcolor: '#0f766e', fontWeight: 900, boxShadow: 'none', '&:hover': { bgcolor: '#0d9488', boxShadow: 'none' } }}
                >
                  Hear Audio
                </Button>
              )}
              {activeCall.status === 'answered' && (
                <Button
                  variant="outlined"
                  startIcon={localMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
                  onClick={() => setLocalMuted((value) => !value)}
                  sx={{ fontWeight: 900 }}
                >
                  {localMuted ? 'Unmute' : 'Mute'}
                </Button>
              )}
              <Button
                variant="outlined"
                onClick={() => {
                  localStorage.setItem('selectedChatConversationId', String(activeCall.student_id));
                  navigate('/counselor/chat');
                }}
                sx={{ fontWeight: 900 }}
              >
                Open Chat
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<CallEndIcon />}
                onClick={activeCall.status === 'ringing' ? handleCancelOutgoingCall : handleEndCall}
                sx={{ fontWeight: 900, boxShadow: 'none' }}
              >
                {activeCall.status === 'ringing' ? 'Cancel' : 'End Call'}
              </Button>
            </Stack>
          </Stack>
        </Paper>
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
                      <Tooltip title="Call student">
                        <IconButton
                          onClick={() => handleStartStudentCall(student)}
                          size="small"
                          sx={{ color: '#16a34a' }}
                        >
                          <CallIcon fontSize="small" />
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
      </main>
    </div>
  );
};

export default CounselorDashboard;
