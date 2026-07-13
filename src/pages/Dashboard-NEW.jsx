import React, { useState } from 'react'
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
import { Sidebar } from '../components/layout/Sidebar'
import { EmergencySOS } from '../components/common/EmergencySOS'

const moodData = [
  {
    day: 'Mon',
    mood: 6,
  },
  {
    day: 'Tue',
    mood: 7,
  },
  {
    day: 'Wed',
    mood: 5,
  },
  {
    day: 'Thu',
    mood: 8,
  },
  {
    day: 'Fri',
    mood: 7,
  },
  {
    day: 'Sat',
    mood: 9,
  },
  {
    day: 'Sun',
    mood: 7,
  },
]

const quotes = [
  "Every day is a fresh start. You've got this.",
  'Your mental health is a priority, not a luxury.',
  'Small steps every day lead to big changes.',
  "It's okay to not be okay. Reach out when you need support.",
]

const Dashboard = () => {
  const { user } = useAuth()
  const [journalEntry, setJournalEntry] = useState('')

  const currentHour = new Date().getHours()
  const greeting =
    currentHour < 12
      ? 'Good Morning'
      : currentHour < 18
      ? 'Good Afternoon'
      : 'Good Evening'

  const todayQuote = quotes[new Date().getDay() % quotes.length]

  const riskScore = 20
  const riskLevel =
    riskScore < 30 ? 'LOW' : riskScore < 70 ? 'MODERATE' : 'HIGH'

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
    <div className="flex">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          className="max-w-7xl mx-auto p-6 space-y-6"
        >
          <div className="bg-gradient-to-r from-teal-600 to-teal-500 rounded-2xl p-8 text-white">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">{greeting}</h1>
                <p className="text-teal-100 mb-4">
                  Welcome back, {user?.full_name || 'Student'}
                </p>
                <div className="flex items-center gap-2 text-teal-50">
                  <CalendarIcon className="w-4 h-4" />
                  <span className="text-sm">
                    {new Date().toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-6 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <p className="text-sm italic">"{todayQuote}"</p>
            </div>
          </div>

          <div
            className={`${riskBgColor} ${riskBorderColor} border-2 rounded-2xl p-6`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">
                  Current Risk Level
                </p>
                <h2 className={`text-4xl font-bold ${riskColor}`}>{riskLevel}</h2>
                <p className="text-sm text-gray-600 mt-2">
                  Risk Score: {riskScore}/100
                </p>
              </div>
              <div className="relative w-32 h-32">
                <svg className="transform -rotate-90 w-32 h-32">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-gray-200"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - riskScore / 100)}`}
                    className={riskColor}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-2xl font-bold ${riskColor}`}>
                    {riskScore}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <SmileIcon className="w-5 h-5 text-yellow-600" />
                </div>
                <p className="text-sm font-medium text-gray-600">Today's Mood</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">7/10</p>
              <p className="text-sm text-gray-500 mt-1">Sleep: Good</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <TrendingUpIcon className="w-5 h-5 text-red-600" />
                </div>
                <p className="text-sm font-medium text-gray-600">Stress Level</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">4/10</p>
              <p className="text-sm text-gray-500 mt-1">Anxiety: 3/10</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ActivityIcon className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-gray-600">
                  Depression Score
                </p>
              </div>
              <p className="text-3xl font-bold text-gray-900">5</p>
              <p className="text-sm text-gray-500 mt-1">Normal</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <FlameIcon className="w-5 h-5 text-orange-600" />
                </div>
                <p className="text-sm font-medium text-gray-600">Check-in Streak</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">0</p>
              <p className="text-sm text-gray-500 mt-1">Days in a row</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Mood Trend (Last 7 Days)
            </h3>
            <ResponsiveContainer width="100%" height={250}>
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

          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Journal
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              How are you feeling right now?
            </p>
            <textarea
              value={journalEntry}
              onChange={(e) => setJournalEntry(e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full h-32 p-4 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            <button className="mt-3 px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors">
              Save Entry
            </button>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-teal-50 border-l-4 border-teal-600 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <HeartIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Our Recommendations
                </h3>
                <p className="text-gray-700">
                  Start your day with a daily check-in to track your mood and
                  well-being. Regular check-ins help us provide better support and
                  identify patterns in your mental health.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/daily-checkin" className="group">
              <div className="bg-blue-600 hover:bg-blue-700 rounded-xl p-6 text-white transition-all transform group-hover:scale-105">
                <ClipboardCheckIcon className="w-8 h-8 mb-3" />
                <h4 className="font-semibold mb-1">Daily Check-in</h4>
                <p className="text-sm text-blue-100">Track your mood today</p>
              </div>
            </Link>

            <Link to="/dass21" className="group">
              <div className="bg-green-600 hover:bg-green-700 rounded-xl p-6 text-white transition-all transform group-hover:scale-105">
                <ClipboardListIcon className="w-8 h-8 mb-3" />
                <h4 className="font-semibold mb-1">DASS-21 Test</h4>
                <p className="text-sm text-green-100">Complete assessment</p>
              </div>
            </Link>

            <Link to="/chat-support" className="group">
              <div className="bg-purple-600 hover:bg-purple-700 rounded-xl p-6 text-white transition-all transform group-hover:scale-105">
                <MessageCircleIcon className="w-8 h-8 mb-3" />
                <h4 className="font-semibold mb-1">Chat Support</h4>
                <p className="text-sm text-purple-100">Talk to someone</p>
              </div>
            </Link>

            <Link to="/resources" className="group">
              <div className="bg-pink-600 hover:bg-pink-700 rounded-xl p-6 text-white transition-all transform group-hover:scale-105">
                <BookOpenIcon className="w-8 h-8 mb-3" />
                <h4 className="font-semibold mb-1">Resources</h4>
                <p className="text-sm text-pink-100">Find help & info</p>
              </div>
            </Link>
          </div>

          <EmergencySOS />
        </motion.div>
      </main>
    </div>
  )
}

export default Dashboard
