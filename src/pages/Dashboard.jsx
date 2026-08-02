import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
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
  SparklesIcon,
  WindIcon,
} from 'lucide-react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAuth } from '../context/AuthContext';
import studentService from '../services/studentService';
import wellnessService from '../services/wellnessService';
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

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({ recent_checkins: [] });
  const [wellness, setWellness] = useState(fallbackWellness);
  const [profileStatus, setProfileStatus] = useState(null);
  const [facialStatus, setFacialStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [studentDashboard, wellnessDashboard, profile, face] = await Promise.all([
          studentService.getDashboard(),
          wellnessService.getWellness(),
          studentService.getProfileAssessmentStatus(),
          studentService.getFacialAnalysisStatus(),
        ]);
        setDashboardData(studentDashboard || { recent_checkins: [] });
        setWellness({ ...fallbackWellness, ...(wellnessDashboard || {}) });
        setProfileStatus(profile);
        setFacialStatus(face);
      } catch (error) {
        console.error('Failed to load wellness dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

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
            <div className="wellness-date-card">
              <CalendarIcon className="w-5 h-5" />
              <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
            </div>
          </section>

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
