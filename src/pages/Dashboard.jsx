import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  SmileIcon,
  TrendingUpIcon,
  ActivityIcon,
  FlameIcon,
  ClipboardCheckIcon,
  ClipboardListIcon,
  MessageCircleIcon,
  BookOpenIcon,
  HeartIcon,
  CalendarIcon,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import studentService from '../services/studentService'
import { Sidebar } from '../components/layout/Sidebar'
import { EmergencySOS } from '../components/common/EmergencySOS'

const quotes = [
  "Every day is a fresh start. You've got this.",
  'Your mental health is a priority, not a luxury.',
  'Small steps every day lead to big changes.',
  "It's okay to not be okay. Reach out when you need support.",
]

const fallbackDashboard = {
  current_risk_level: 'LOW',
  risk_score: 20,
  today_checkin: {
    mood_score: 7,
    stress_score: 4,
    anxiety_score: 3,
    sleep_quality: 'Good',
  },
  latest_dass21: {
    depression_score: 5,
    depression_severity: 'Normal',
  },
  recommendations:
    'Start your day with a daily check-in to track your mood and well-being. Regular check-ins help us provide better support and identify patterns in your mental health.',
  recent_checkins: [],
}

const fallbackStats = {
  checkin_streak: 0,
  average_mood: 7,
}

const fallbackMoodData = [
  { day: 'Mon', mood: 6 },
  { day: 'Tue', mood: 7 },
  { day: 'Wed', mood: 5 },
  { day: 'Thu', mood: 8 },
  { day: 'Fri', mood: 7 },
  { day: 'Sat', mood: 9 },
  { day: 'Sun', mood: 7 },
]

const Dashboard = () => {
  const { user } = useAuth()
  const [journalEntry, setJournalEntry] = useState('')
  const [dashboardData, setDashboardData] = useState(fallbackDashboard)
  const [stats, setStats] = useState(fallbackStats)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [dashboardResponse, statsResponse] = await Promise.all([
          studentService.getDashboard(),
          studentService.getStats(),
        ])

        setDashboardData({
          ...fallbackDashboard,
          ...dashboardResponse,
          today_checkin: {
            ...fallbackDashboard.today_checkin,
            ...(dashboardResponse?.today_checkin || {}),
          },
          latest_dass21: {
            ...fallbackDashboard.latest_dass21,
            ...(dashboardResponse?.latest_dass21 || {}),
          },
        })

        setStats({
          ...fallbackStats,
          ...(statsResponse || {}),
        })
      } catch (error) {
        console.error('Failed to load student dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  const moodData = useMemo(() => {
    const recentCheckins = dashboardData?.recent_checkins || []
    if (!recentCheckins.length) {
      return fallbackMoodData
    }

    return recentCheckins
      .slice(0, 7)
      .reverse()
      .map((entry) => ({
        day: new Date(
          entry.check_in_date || entry.created_at || Date.now()
        ).toLocaleDateString('en-US', { weekday: 'short' }),
        mood:
          entry.mood_score ||
          entry.mood ||
          entry.wellbeing_score ||
          fallbackDashboard.today_checkin.mood_score,
      }))
  }, [dashboardData])

  const currentHour = new Date().getHours()
  const greeting =
    currentHour < 12
      ? 'Good Morning'
      : currentHour < 18
        ? 'Good Afternoon'
        : 'Good Evening'

  const todayQuote = quotes[new Date().getDay() % quotes.length]
  const riskScore = Number(dashboardData?.risk_score || 0)
  const riskLevel = dashboardData?.current_risk_level || 'LOW'

  const riskColor =
    riskScore < 30
      ? 'text-green-600'
      : riskScore < 70
        ? 'text-yellow-600'
        : 'text-red-600'

  const riskBgColor =
    riskScore < 30
      ? 'bg-green-50'
      : riskScore < 70
        ? 'bg-yellow-50'
        : 'bg-red-50'

  const riskBorderColor =
    riskScore < 30
      ? 'border-green-600'
      : riskScore < 70
        ? 'border-yellow-600'
        : 'border-red-600'

  return (
    <div className="student-shell">
      <Sidebar />
      <main className="student-main">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="student-page"
        >
          <div className="student-hero">
            <div className="student-hero-grid">
              <div>
                <h1 className="student-hero-title">{greeting}</h1>
                <p className="student-hero-subtitle">
                  Welcome back, {user?.full_name || 'Student'}
                </p>
                <div className="student-hero-date">
                  <CalendarIcon className="w-4 h-4" />
                  <span>
                    {new Date().toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              <div className="student-hero-panel">
                <p className="student-hero-panel-label">Student Space</p>
                <p className="student-hero-panel-value">
                  Check in. Breathe. Recover.
                </p>
              </div>
            </div>

            <div className="student-hero-quote">
              <p>"{todayQuote}"</p>
            </div>
          </div>

          <div className={`student-risk-card ${riskBgColor} ${riskBorderColor}`}>
            <div>
              <p className="student-risk-label">Current Risk Level</p>
              <h2 className={`student-risk-value ${riskColor}`}>{riskLevel}</h2>
              <p className="student-risk-score">Risk Score: {riskScore}/100</p>
              {loading && (
                <p className="student-risk-loading">
                  Loading live dashboard data...
                </p>
              )}
            </div>

            <div className="student-risk-ring relative">
              <svg className="transform -rotate-90 w-36 h-36">
                <circle
                  cx="72"
                  cy="72"
                  r="61"
                  stroke="currentColor"
                  strokeWidth="9"
                  fill="transparent"
                  className="text-gray-200"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="61"
                  stroke="currentColor"
                  strokeWidth="9"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 61}`}
                  strokeDashoffset={`${2 * Math.PI * 61 * (1 - riskScore / 100)}`}
                  className={riskColor}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-3xl font-bold ${riskColor}`}>
                  {riskScore}%
                </span>
              </div>
            </div>
          </div>

          <div className="student-stat-grid">
            <div className="student-stat-card">
              <div className="student-stat-head">
                <div className="student-stat-icon bg-yellow-100 text-yellow-600">
                  <SmileIcon className="w-5 h-5" />
                </div>
                <p className="student-stat-title">Today's Mood</p>
              </div>
              <p className="student-stat-value">
                {dashboardData?.today_checkin?.mood_score || 0}/10
              </p>
              <p className="student-stat-note">
                Sleep: {dashboardData?.today_checkin?.sleep_quality || 'Not logged'}
              </p>
            </div>

            <div className="student-stat-card">
              <div className="student-stat-head">
                <div className="student-stat-icon bg-red-100 text-red-600">
                  <TrendingUpIcon className="w-5 h-5" />
                </div>
                <p className="student-stat-title">Stress Level</p>
              </div>
              <p className="student-stat-value">
                {dashboardData?.today_checkin?.stress_score || 0}/10
              </p>
              <p className="student-stat-note">
                Anxiety: {dashboardData?.today_checkin?.anxiety_score || 0}/10
              </p>
            </div>

            <div className="student-stat-card">
              <div className="student-stat-head">
                <div className="student-stat-icon bg-blue-100 text-blue-600">
                  <ActivityIcon className="w-5 h-5" />
                </div>
                <p className="student-stat-title">Depression Score</p>
              </div>
              <p className="student-stat-value">
                {dashboardData?.latest_dass21?.depression_score || 0}
              </p>
              <p className="student-stat-note">
                {dashboardData?.latest_dass21?.depression_severity ||
                  'No recent result'}
              </p>
            </div>

            <div className="student-stat-card">
              <div className="student-stat-head">
                <div className="student-stat-icon bg-orange-100 text-orange-600">
                  <FlameIcon className="w-5 h-5" />
                </div>
                <p className="student-stat-title">Check-in Streak</p>
              </div>
              <p className="student-stat-value">{stats?.checkin_streak || 0}</p>
              <p className="student-stat-note">
                Average mood: {stats?.average_mood || 0}/10
              </p>
            </div>
          </div>

          <div className="student-dashboard-main">
            <div className="student-panel student-chart-panel">
              <h3 className="student-panel-title">Mood Trend</h3>
              <p className="student-panel-subtitle">
                Your last week of mood check-ins at a glance.
              </p>
              <ResponsiveContainer width="100%" height={295}>
                <LineChart data={moodData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="day" stroke="#6B7280" />
                  <YAxis domain={[0, 10]} stroke="#6B7280" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="mood"
                    stroke="#0D9488"
                    strokeWidth={3}
                    dot={{
                      fill: '#0D9488',
                      r: 5,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="student-panel">
              <h3 className="student-panel-title">Quick Journal</h3>
              <p className="student-panel-subtitle">
                Capture a thought, a worry, or a small win from today.
              </p>
              <textarea
                value={journalEntry}
                onChange={(e) => setJournalEntry(e.target.value)}
                placeholder="Share your thoughts..."
                className="student-journal-textarea"
              />
              <button className="student-btn student-btn-primary mt-3">
                Save Entry
              </button>
            </div>
          </div>

          <div className="student-recommendation">
            <div className="student-recommendation-icon">
              <HeartIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="student-panel-title mb-2">Our Recommendations</h3>
              <p className="text-slate-700 leading-7">
                {dashboardData?.recommendations ||
                  fallbackDashboard.recommendations}
              </p>
            </div>
          </div>

          <div className="student-cta-grid">
            <Link to="/daily-checkin" className="student-cta-card bg-blue-600">
              <ClipboardCheckIcon className="w-8 h-8" />
              <h4 className="student-cta-title">Daily Check-in</h4>
              <p className="student-cta-text">Track your mood today</p>
            </Link>

            <Link to="/dass21" className="student-cta-card bg-green-600">
              <ClipboardListIcon className="w-8 h-8" />
              <h4 className="student-cta-title">DASS-21 Test</h4>
              <p className="student-cta-text">Complete assessment</p>
            </Link>

            <Link to="/chat-support" className="student-cta-card bg-purple-600">
              <MessageCircleIcon className="w-8 h-8" />
              <h4 className="student-cta-title">Chat Support</h4>
              <p className="student-cta-text">Talk to someone</p>
            </Link>

            <Link to="/resources" className="student-cta-card bg-pink-600">
              <BookOpenIcon className="w-8 h-8" />
              <h4 className="student-cta-title">Resources</h4>
              <p className="student-cta-text">Find help and support</p>
            </Link>
          </div>

          <EmergencySOS />
        </motion.div>
      </main>
    </div>
  )
}

export default Dashboard
