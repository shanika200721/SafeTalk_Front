import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BellIcon,
  BookOpenIcon,
  CalendarIcon,
  CameraIcon,
  CheckCircle2Icon,
  ClipboardCheckIcon,
  HeartHandshakeIcon,
  HeartPulseIcon,
  MessageCircleIcon,
  MoonIcon,
  PhoneCallIcon,
  SparklesIcon,
  WindIcon,
  XIcon,
} from 'lucide-react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAuth } from '../context/AuthContext';
import studentService from '../services/studentService';
import wellnessService from '../services/wellnessService';
import api from '../services/api';
import useWebRTCAudioCall, { getCallAudioStatusText } from '../hooks/useWebRTCAudioCall';
import { Sidebar } from '../components/layout/Sidebar';
import { EmergencySOS } from '../components/common/EmergencySOS';
import { WellnessCard } from '../components/wellness/WellnessLayout';
import STUDENT_ROUTES from '../routes/studentRoutes';

const fallbackMoodData = [
  { day: 'Mon', mood: 6 },
  { day: 'Tue', mood: 7 },
  { day: 'Wed', mood: 6 },
  { day: 'Thu', mood: 8 },
  { day: 'Fri', mood: 7 },
  { day: 'Sat', mood: 8 },
  { day: 'Sun', mood: 7 },
];

const fallbackWellness = {
  summary: {
    today_wellbeing: 'Mood Check-in Open',
    mood_check_in: { status: 'Available', last_mood: null, last_date: null },
    assessment_progress: {
      completed_assessments: 0,
      pending_assessments: ['Profile assessment', 'DASS-21 assessment', 'Mood check-in'],
      last_dass: null,
      last_mood: null,
    },
    counselor_assigned: false,
    support_available: true,
    latest_wellness_activity: null,
    activity_counts: {
      breathing_sessions: 0,
      meditation: 0,
      resources_viewed: 0,
      journal_entries: 0,
      mood_checkins: 0,
    },
  },
  notifications: [],
};

const quotes = [
  'One manageable step is enough for this moment.',
  'Support is available before things feel impossible.',
  'You can pause, breathe, and come back gently.',
  'Your wellbeing belongs in the middle of student life.',
];

const formatCallDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return `${minutes} min ${rest.toString().padStart(2, '0')} sec`;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({ recent_checkins: [] });
  const [wellness, setWellness] = useState(fallbackWellness);
  const [profileStatus, setProfileStatus] = useState(null);
  const [facialStatus, setFacialStatus] = useState(null);
  const [assignedCounselors, setAssignedCounselors] = useState([]);
  const [activeCall, setActiveCall] = useState(null);
  const [incomingCalls, setIncomingCalls] = useState([]);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [studentNotificationOpen, setStudentNotificationOpen] = useState(false);
  const [callSeconds, setCallSeconds] = useState(0);
  const [callLoading, setCallLoading] = useState(false);
  const [callNotice, setCallNotice] = useState('');
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [studentDashboard, wellnessDashboard, profile, face, counselors, calls, activeCalls, unread] = await Promise.all([
          studentService.getDashboard(),
          wellnessService.getWellness(),
          studentService.getProfileAssessmentStatus(),
          studentService.getFacialAnalysisStatus(),
          api.get('/api/chat/counselors').catch(() => ({ data: [] })),
          api.get('/api/chat/calls/outgoing').catch(() => ({ data: [] })),
          api.get('/api/chat/calls/active').catch(() => ({ data: [] })),
          api.get('/api/chat/unread-count').catch(() => ({ data: { unread_count: 0 } })),
        ]);
        setDashboardData(studentDashboard || { recent_checkins: [] });
        setWellness({ ...fallbackWellness, ...(wellnessDashboard || {}) });
        setProfileStatus(profile);
        setFacialStatus(face);
        setAssignedCounselors(counselors.data || []);
        setActiveCall(pickVisibleActiveCall(activeCalls.data || []) || (calls.data || [])[0] || null);
        setUnreadMessageCount(unread.data?.unread_count || 0);
      } catch (error) {
        console.error('Failed to load wellness dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  useEffect(() => {
    const loadCallStatus = async () => {
      try {
        const [activeResponse, incomingResponse, unreadResponse] = await Promise.all([
          api.get('/api/chat/calls/active'),
          api.get('/api/chat/calls/incoming'),
          api.get('/api/chat/unread-count').catch(() => ({ data: { unread_count: 0 } })),
        ]);
        const activeCalls = activeResponse.data || [];
        setActiveCall(pickVisibleActiveCall(activeCalls));
        setIncomingCalls(incomingResponse.data || []);
        setUnreadMessageCount(unreadResponse.data?.unread_count || 0);
      } catch {
        setActiveCall(null);
      }
    };
    loadCallStatus();
    const interval = setInterval(loadCallStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const playCallRing = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const context = audioContextRef.current || new AudioContext();
      audioContextRef.current = context;
      [620, 820].forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const startAt = context.currentTime + index * 0.18;
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(frequency, startAt);
        gain.gain.setValueAtTime(0.0001, startAt);
        gain.gain.exponentialRampToValueAtTime(0.14, startAt + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.22);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(startAt);
        oscillator.stop(startAt + 0.24);
      });
    } catch {
      // Browser audio may be blocked until the student interacts with the page.
    }
  };

  useEffect(() => {
    if (callRingTimerRef.current) {
      clearInterval(callRingTimerRef.current);
      callRingTimerRef.current = null;
    }

    if (incomingCalls.length > 0) {
      playCallRing();
      callRingTimerRef.current = setInterval(playCallRing, 2600);
    }

    return () => {
      if (callRingTimerRef.current) {
        clearInterval(callRingTimerRef.current);
        callRingTimerRef.current = null;
      }
    };
  }, [incomingCalls.length]);

  useEffect(() => {
    if (!activeCall?.answered_at || activeCall.status !== 'answered') {
      setCallSeconds(0);
      return undefined;
    }
    const update = () => {
      setCallSeconds(Math.max(0, Math.floor((Date.now() - new Date(activeCall.answered_at).getTime()) / 1000)));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [activeCall?.answered_at, activeCall?.status]);

  const handleRequestCall = async () => {
    const counselor = assignedCounselors[0];
    if (!counselor) {
      setCallNotice('No assigned counselor is available for an in-app call request right now.');
      return;
    }

    try {
      setCallLoading(true);
      setCallNotice('');
      const response = await api.post('/api/chat/calls/request', {
        receiver_id: counselor.id,
      });
      setActiveCall(response.data);
      setCallNotice('Calling your counselor. Please keep this page open.');
    } catch (err) {
      setCallNotice(err.response?.data?.detail || 'Could not request a counselor call.');
    } finally {
      setCallLoading(false);
    }
  };

  const handleCancelCall = async () => {
    if (!activeCall || activeCall.status !== 'ringing') return;
    try {
      setCallLoading(true);
      const response = await api.post(`/api/chat/calls/${activeCall.id}/cancel`);
      setActiveCall(response.data);
      setCallNotice('Call request cancelled.');
    } catch (err) {
      setCallNotice(err.response?.data?.detail || 'Could not cancel the call request.');
    } finally {
      setCallLoading(false);
    }
  };

  const handleAnswerIncomingCall = async (call) => {
    try {
      setCallLoading(true);
      const response = await api.post(`/api/chat/calls/${call.id}/answer`);
      setActiveCall(response.data);
      setIncomingCalls((items) => items.filter((item) => item.id !== call.id));
      setCallNotice(`Call answered with ${response.data.counselor_name}.`);
    } catch (err) {
      setCallNotice(err.response?.data?.detail || 'Could not answer the call.');
    } finally {
      setCallLoading(false);
    }
  };

  const handleDeclineIncomingCall = async (call) => {
    try {
      setCallLoading(true);
      const response = await api.post(`/api/chat/calls/${call.id}/decline`);
      setIncomingCalls((items) => items.filter((item) => item.id !== call.id));
      setActiveCall(response.data);
      setCallNotice('Call declined.');
    } catch (err) {
      setCallNotice(err.response?.data?.detail || 'Could not decline the call.');
    } finally {
      setCallLoading(false);
    }
  };

  const handleEndCall = async () => {
    if (!activeCall) return;
    try {
      setCallLoading(true);
      const response = await api.post(`/api/chat/calls/${activeCall.id}/end`);
      setActiveCall(response.data.status === 'ended' ? null : response.data);
      setCallNotice('Call ended.');
    } catch (err) {
      setCallNotice(err.response?.data?.detail || 'Could not end the call.');
    } finally {
      setCallLoading(false);
    }
  };

  const openCounselorChat = () => {
    const counselorId = activeCall?.counselor_id || assignedCounselors[0]?.id;
    if (counselorId) {
      localStorage.setItem('selectedChatConversationId', String(counselorId));
    }
    navigate('/chat-with-counselor');
  };

  const moodData = useMemo(() => {
    const recent = dashboardData?.recent_checkins || [];
    if (!recent.length) return fallbackMoodData;
    return recent
      .slice(0, 7)
      .reverse()
      .map((entry) => ({
        day: new Date(entry.check_in_date || entry.date || Date.now()).toLocaleDateString('en-US', { weekday: 'short' }),
        mood: entry.mood_score || 5,
      }));
  }, [dashboardData]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
  const quote = quotes[new Date().getDay() % quotes.length];
  const summary = wellness.summary;
  const progress = summary.assessment_progress || fallbackWellness.summary.assessment_progress;
  const counts = summary.activity_counts || fallbackWellness.summary.activity_counts;
  const assessmentStatus = profileStatus?.assessment_status || profileStatus?.status || 'not_started';
  const profileAction = assessmentStatus === 'draft' ? 'Continue Assessment' : ['submitted', 'completed'].includes(assessmentStatus) ? 'View Summary' : ['needs_update', 'stale'].includes(assessmentStatus) ? 'Update Profile' : 'Start Profile Assessment';
  const profileText = assessmentStatus === 'draft'
    ? 'Your profile assessment is partly complete.'
    : ['submitted', 'completed'].includes(assessmentStatus)
      ? 'Profile assessment completed.'
      : ['needs_update', 'stale'].includes(assessmentStatus)
        ? 'Profile update recommended.'
        : 'Complete your background profile to personalize your wellbeing support.';
  const faceState = facialStatus?.runtime_state || 'inactive';
  const faceMessage = facialStatus?.message || 'Facial analysis is currently unavailable. You may review the feature and privacy information, but no facial prediction will be generated.';
  const screeningInputs = [
    ['Profile', ['submitted', 'completed'].includes(assessmentStatus) ? 'Completed' : assessmentStatus === 'draft' ? 'Not completed' : ['needs_update', 'stale'].includes(assessmentStatus) ? 'Update recommended' : 'Not completed'],
    ['DASS-21', progress.last_dass ? 'Completed' : 'Available'],
    ['Daily Mood', progress.last_mood ? 'Completed' : 'Available'],
    ['Text evidence', 'Optional'],
    ['Voice evidence', 'Unavailable'],
    ['Facial evidence', faceState === 'experimental' ? 'Experimental' : faceState === 'verified_approved' ? 'Optional' : 'Unavailable'],
  ];

  const cards = [
    {
      title: "Today's Wellbeing",
      value: summary.today_wellbeing || 'Support Available',
      note: loading ? 'Refreshing your student space...' : 'A gentle overview for today.',
      icon: HeartPulseIcon,
    },
    {
      title: 'Mood Check-in',
      value: summary.mood_check_in?.status || 'Available',
      note: summary.mood_check_in?.last_mood ? `Last mood: ${summary.mood_check_in.last_mood}/5` : 'Ready when you are.',
      icon: SparklesIcon,
    },
    {
      title: 'Last Activity',
      value: summary.latest_wellness_activity?.activity_type || 'No activity yet',
      note: summary.latest_wellness_activity?.created_at ? new Date(summary.latest_wellness_activity.created_at).toLocaleDateString() : 'Start with breathing or resources.',
      icon: CheckCircle2Icon,
    },
    {
      title: 'Assessment Progress',
      value: `${progress.completed_assessments || 0} completed`,
      note: `${progress.pending_assessments?.length || 0} pending`,
      icon: ClipboardCheckIcon,
    },
    {
      title: 'Upcoming Follow-up',
      value: summary.upcoming_follow_up || 'No follow-up scheduled',
      note: 'You can request support any time.',
      icon: CalendarIcon,
    },
    {
      title: 'Support Availability',
      value: summary.support_available ? 'Support Available' : 'Check again soon',
      note: summary.counselor_assigned ? 'Counselor assigned' : 'Campus and SafeTalk support available.',
      icon: HeartHandshakeIcon,
    },
  ];

  const callStatusText = activeCall?.status
    ? activeCall.status.charAt(0).toUpperCase() + activeCall.status.slice(1)
    : assignedCounselors.length
      ? 'Ready'
      : 'Unavailable';
  const activeCounselorName =
    activeCall?.counselor_name || assignedCounselors[0]?.full_name || 'Assigned counselor';
  const studentNotifications = [
    ...(wellness.notifications || []),
    ...(activeCall && ['answered', 'declined', 'cancelled'].includes(activeCall.status)
      ? [{
          id: `call-${activeCall.id}-${activeCall.status}`,
          type: 'Call status',
          message: `Your counselor call is ${activeCall.status}.`,
        }]
      : []),
  ];
  const studentNotificationCount = studentNotifications.length + incomingCalls.length;
  const callAudioStatusText = getCallAudioStatusText(audioStatus, audioError);

  return (
    <div className="student-shell wellness-theme">
      <Sidebar />
      <main className="student-main">
        <div className="student-page wellness-dashboard">
          <section className="wellness-hero">
            <div>
              <p className="wellness-eyebrow">Student Wellbeing Platform</p>
              <h1>{greeting}, {user?.full_name || 'Student'}</h1>
              <p>{quote}</p>
            </div>
            <div className="wellness-hero-actions">
              <div className="student-top-icon-row">
                <button
                  type="button"
                  className="student-top-icon"
                  onClick={openCounselorChat}
                  aria-label="Open counselor messages"
                >
                  <MessageCircleIcon className="w-5 h-5" />
                  {unreadMessageCount > 0 && <span>{unreadMessageCount}</span>}
                </button>
                <button
                  type="button"
                  className="student-top-icon"
                  onClick={handleRequestCall}
                  disabled={callLoading || assignedCounselors.length === 0 || activeCall?.status === 'answered'}
                  aria-label="Request counselor call"
                >
                  <PhoneCallIcon className="w-5 h-5" />
                  {incomingCalls.length > 0 && <span>{incomingCalls.length}</span>}
                </button>
                <button
                  type="button"
                  className="student-top-icon"
                  onClick={() => setStudentNotificationOpen((value) => !value)}
                  aria-label="Open student notifications"
                >
                  <BellIcon className="w-5 h-5" />
                  {studentNotificationCount > 0 && <span>{studentNotificationCount}</span>}
                </button>
              </div>
              {studentNotificationOpen && (
                <div className="student-notification-popover">
                  <div className="student-notification-head">
                    <strong>Notifications</strong>
                    <button type="button" onClick={() => setStudentNotificationOpen(false)} aria-label="Close notifications">
                      <XIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="student-notification-list">
                    {studentNotifications.length === 0 && incomingCalls.length === 0 ? (
                      <p>No notifications right now.</p>
                    ) : (
                      <>
                        {incomingCalls.map((call) => (
                          <div key={call.id} className="student-notification-item">
                            <strong>Incoming call</strong>
                            <span>{call.caller_name} is calling you.</span>
                          </div>
                        ))}
                        {studentNotifications.map((item) => (
                          <div key={item.id} className="student-notification-item">
                            <strong>{item.type}</strong>
                            <span>{item.message}</span>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              )}
              <div className="wellness-date-card">
                <CalendarIcon className="w-5 h-5" />
                <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="wellness-call-card">
                <div>
                  <strong>{callStatusText}</strong>
                  <span>{activeCounselorName}</span>
                </div>
                {activeCall?.status === 'ringing' ? (
                  <button
                    type="button"
                    className="wellness-icon-action wellness-call-cancel"
                    onClick={handleCancelCall}
                    disabled={callLoading}
                    aria-label="Cancel counselor call request"
                  >
                    Cancel
                  </button>
                ) : activeCall?.status === 'answered' ? (
                  <button
                    type="button"
                    className="wellness-icon-action"
                    onClick={openCounselorChat}
                    aria-label="Open counselor chat after answered call"
                  >
                    Open
                  </button>
                ) : (
                  <button
                    type="button"
                    className="wellness-icon-action"
                    onClick={handleRequestCall}
                    disabled={callLoading || assignedCounselors.length === 0}
                    aria-label="Request immediate counselor call"
                  >
                    <PhoneCallIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </section>

          {callNotice && (
            <section className="wellness-call-notice" aria-live="polite">
              {callNotice}
            </section>
          )}

          {incomingCalls.length > 0 && (
            <section className="student-active-call student-incoming-call" aria-live="assertive">
              <div>
                <strong>{incomingCalls[0].caller_name} is calling</strong>
                <span>{incomingCalls[0].counselor_name || 'Counselor'} wants to start an immediate support call.</span>
              </div>
              <div className="student-call-actions">
                <button
                  type="button"
                  className="student-btn student-btn-secondary"
                  onClick={() => handleDeclineIncomingCall(incomingCalls[0])}
                  disabled={callLoading}
                >
                  Decline
                </button>
                <button
                  type="button"
                  className="student-btn student-btn-primary"
                  onClick={() => handleAnswerIncomingCall(incomingCalls[0])}
                  disabled={callLoading}
                >
                  Answer
                </button>
              </div>
            </section>
          )}

          {activeCall?.status === 'answered' && (
            <section className="student-active-call">
              <div>
                <strong>In call with {activeCall.counselor_name}</strong>
                <span>Duration {formatCallDuration(callSeconds)}</span>
                {callAudioStatusText && (
                  <span className="student-call-audio-status">{callAudioStatusText}</span>
                )}
              </div>
              <audio ref={remoteAudioRef} autoPlay playsInline />
              <div className="student-call-actions">
                {remoteAudioReady && (
                  <button
                    type="button"
                    className="student-btn student-btn-primary"
                    onClick={playRemoteAudio}
                    aria-label="Play remote call audio"
                  >
                    Hear Audio
                  </button>
                )}
                <button
                  type="button"
                  className="student-btn student-btn-secondary"
                  onClick={() => setLocalMuted((value) => !value)}
                >
                  {localMuted ? 'Unmute' : 'Mute'}
                </button>
                <button
                  type="button"
                  className="student-btn student-btn-secondary"
                  onClick={openCounselorChat}
                >
                  Open Chat
                </button>
                <button
                  type="button"
                  className="student-btn student-btn-danger"
                  onClick={handleEndCall}
                  disabled={callLoading}
                >
                  End Call
                </button>
              </div>
            </section>
          )}

          <section className="wellness-card-grid wellness-card-grid-3" aria-label="Wellness dashboard cards">
            {cards.map((card) => (
              <WellnessCard key={card.title} icon={card.icon} title={card.title} subtitle={card.note}>
                <strong className="wellness-card-value">{card.value}</strong>
              </WellnessCard>
            ))}
          </section>

          <section className="wellness-panel wellness-progress-panel">
            <div>
              <p className="wellness-eyebrow">Assessment Summary</p>
              <h2>Supportive Progress</h2>
              <dl className="wellness-definition-grid">
                <div>
                  <dt>Completed Assessments</dt>
                  <dd>{progress.completed_assessments || 0}</dd>
                </div>
                <div>
                  <dt>Pending Assessments</dt>
                  <dd>{progress.pending_assessments?.join(', ') || 'None right now'}</dd>
                </div>
                <div>
                  <dt>Last DASS</dt>
                  <dd>{progress.last_dass || 'Assessment Recommended'}</dd>
                </div>
                <div>
                  <dt>Last Mood</dt>
                  <dd>{progress.last_mood ? `${progress.last_mood}/5` : 'Mood Check-in Available'}</dd>
                </div>
                <div>
                  <dt>Counselor Assigned</dt>
                  <dd>{summary.counselor_assigned ? 'Yes' : 'Not yet'}</dd>
                </div>
                <div>
                  <dt>Support Available</dt>
                  <dd>{summary.support_available ? 'Support Available' : 'Please check support contacts'}</dd>
                </div>
              </dl>
            </div>
          </section>

          <section className="wellness-card-grid wellness-card-grid-2" aria-label="Profile and facial check-in cards">
            <WellnessCard icon={ClipboardCheckIcon} title="Profile Assessment" subtitle={profileText}>
              <div className="wellness-card-stack">
                <strong className="wellness-card-value">{assessmentStatus.replaceAll('_', ' ')}</strong>
                {profileStatus?.completed_at && <span>Completed {new Date(profileStatus.completed_at).toLocaleDateString()}</span>}
                {profileStatus?.stale_at && <span>Update by {new Date(profileStatus.stale_at).toLocaleDateString()}</span>}
                <Link to={STUDENT_ROUTES.PROFILE_ASSESSMENT} className="student-btn student-btn-primary">{profileAction}</Link>
              </div>
            </WellnessCard>

            <WellnessCard icon={CameraIcon} title="Facial Check-in" subtitle="Optionally capture a facial image for experimental facial-emotion analysis.">
              <div className="wellness-card-stack">
                <strong className="wellness-card-value">{faceState.replaceAll('_', ' ')}</strong>
                <span>{faceMessage}</span>
                <span>Consent: {facialStatus?.consent?.facial_capture ? 'Capture granted' : 'Capture not granted'}</span>
                <span>Last capture: {facialStatus?.last_capture_at ? new Date(facialStatus.last_capture_at).toLocaleDateString() : 'None'}</span>
                <div className="wellness-inline-actions">
                  <Link to={STUDENT_ROUTES.FACIAL_ANALYSIS} className="student-btn student-btn-primary">Start Facial Check-in</Link>
                  <Link to={STUDENT_ROUTES.SETTINGS} className="student-btn student-btn-secondary">View Privacy Details</Link>
                </div>
              </div>
            </WellnessCard>
          </section>

          <section className="wellness-panel">
            <div className="wellness-section-head">
              <div>
                <p className="wellness-eyebrow">My Screening Inputs</p>
                <h2>Assessment Progress</h2>
              </div>
              <ClipboardCheckIcon className="w-6 h-6 text-teal-700" />
            </div>
            <dl className="wellness-mini-stats">
              {screeningInputs.map(([name, statusText]) => (
                <div key={name}><dt>{name}</dt><dd>{statusText}</dd></div>
              ))}
            </dl>
          </section>

          <section className="wellness-dashboard-main">
            <div className="wellness-panel">
              <div className="wellness-section-head">
                <div>
                  <p className="wellness-eyebrow">Weekly Activity</p>
                  <h2>Mood Check-ins</h2>
                </div>
                <Link to="/daily-checkin" className="student-btn student-btn-secondary">
                  <ClipboardCheckIcon className="w-4 h-4" />
                  Check in
                </Link>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={moodData}>
                  <XAxis dataKey="day" stroke="#64748b" />
                  <YAxis domain={[0, 10]} stroke="#64748b" />
                  <Tooltip />
                  <Line type="monotone" dataKey="mood" stroke="#0f9f9a" strokeWidth={3} dot={{ r: 5, fill: '#f97316' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="wellness-panel">
              <p className="wellness-eyebrow">Latest Wellness Activity</p>
              <h2>Small Steps</h2>
              <dl className="wellness-mini-stats">
                <div><dt>Breathing sessions</dt><dd>{counts.breathing_sessions}</dd></div>
                <div><dt>Meditation</dt><dd>{counts.meditation}</dd></div>
                <div><dt>Resources viewed</dt><dd>{counts.resources_viewed}</dd></div>
                <div><dt>Journal entries</dt><dd>{counts.journal_entries}</dd></div>
                <div><dt>Mood check-ins</dt><dd>{counts.mood_checkins}</dd></div>
              </dl>
              <Link to="/progress" className="student-btn student-btn-primary">View Progress</Link>
            </div>
          </section>

          <section className="wellness-shortcut-grid" aria-label="Wellness shortcuts">
            <Link to="/breathing" className="wellness-shortcut"><WindIcon className="w-5 h-5" />Breathing Shortcut</Link>
            <Link to="/resources" className="wellness-shortcut"><BookOpenIcon className="w-5 h-5" />Resources Shortcut</Link>
            <Link to="/safetalk-bot" className="wellness-shortcut"><MessageCircleIcon className="w-5 h-5" />SafeTalk Shortcut</Link>
            <Link to="/meditation" className="wellness-shortcut"><MoonIcon className="w-5 h-5" />Meditation</Link>
          </section>

          <section className="wellness-panel">
            <div className="wellness-section-head">
              <div>
                <p className="wellness-eyebrow">Notifications</p>
                <h2>In-app Reminders</h2>
              </div>
              <BellIcon className="w-6 h-6 text-teal-700" />
            </div>
            <div className="wellness-notification-list">
              {(wellness.notifications?.length ? wellness.notifications : [{ id: 'breathing', type: 'Breathing reminder', message: 'Try a short breathing break when you have space.' }]).map((item) => (
                <div key={item.id} className="wellness-notification">
                  <strong>{item.type}</strong>
                  <span>{item.message}</span>
                </div>
              ))}
            </div>
          </section>

          <EmergencySOS />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
