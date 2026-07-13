import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeftIcon, DownloadIcon, CalendarIcon } from 'lucide-react'
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
import studentService from '../services/studentService'
import { Sidebar } from '../components/layout/Sidebar'
import { EmergencySOS } from '../components/common/EmergencySOS'

const fallbackHistory = [
  {
    created_at: '2026-04-26T08:00:00',
    mood: 4,
    stress_level: 4,
    anxiety_level: 3,
    sleep_hours: 7,
    wellbeing: 65,
  },
  {
    created_at: '2026-04-25T08:00:00',
    mood: 3,
    stress_level: 5,
    anxiety_level: 4,
    sleep_hours: 6,
    wellbeing: 58,
  },
  {
    created_at: '2026-04-24T08:00:00',
    mood: 5,
    stress_level: 3,
    anxiety_level: 2,
    sleep_hours: 8,
    wellbeing: 75,
  },
]

const moodToTenScale = (mood) =>
  Math.min(10, Math.max(0, (Number(mood || 0) / 5) * 10))

const CheckinRecords = () => {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadRecords = async () => {
      try {
        const response = await studentService.getCheckinHistory()
        setRecords(response?.records || response || [])
      } catch (err) {
        console.error('Failed to load check-in records:', err)
        setError('Unable to load live history. Showing a sample view instead.')
        setRecords(fallbackHistory)
      } finally {
        setLoading(false)
      }
    }

    loadRecords()
  }, [])

  const hasRecords = records.length > 0

  const chartData = useMemo(
    () =>
      records.map((record) => ({
        date: new Date(record.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        mood: record.mood_score || moodToTenScale(record.mood),
        stress: record.stress_level || 0,
        anxiety: record.anxiety_level || 0,
      })),
    [records]
  )

  const enrichedRecords = useMemo(
    () =>
      records.map((record) => ({
        ...record,
        moodTen: record.mood_score || moodToTenScale(record.mood),
        wellbeing:
          record.wellbeing ||
          Math.max(
            0,
            Math.min(
              100,
              Math.round(
                100 -
                  (record.stress_level || 0) * 6 -
                  (record.anxiety_level || 0) * 5 +
                  (record.sleep_hours || 0) * 2
              )
            )
          ),
      })),
    [records]
  )

  const handleExport = () => {
    const headers = ['Date', 'Mood', 'Stress', 'Anxiety', 'Sleep Hours']
    const rows = enrichedRecords.map((record) => [
      new Date(record.created_at).toLocaleDateString(),
      record.moodTen,
      record.stress_level || 0,
      record.anxiety_level || 0,
      record.sleep_hours || 0,
    ])

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `checkin-history-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="student-shell">
      <Sidebar />
      <main className="student-main">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="student-page"
        >
          <div className="student-page-header">
            <div>
              <Link to="/dashboard" className="student-top-link">
                <ArrowLeftIcon className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </Link>
            </div>

            {hasRecords && (
              <button
                onClick={handleExport}
                className="student-btn student-btn-secondary"
              >
                <DownloadIcon className="w-4 h-4" />
                Export CSV
              </button>
            )}
          </div>

          <div className="student-surface p-8">
            <div className="student-page-heading mb-6">
              <div className="student-page-badge bg-blue-100 text-blue-700">
                Stats
              </div>
              <div>
                <h1 className="student-panel-title">Your Check-in History</h1>
                <p className="student-panel-subtitle">
                  Track your progress over time
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                {error}
              </div>
            )}

            {loading ? (
              <div className="student-empty-state">
                <p className="text-slate-500">Loading your records...</p>
              </div>
            ) : !hasRecords ? (
              <div className="student-empty-state">
                <div className="student-empty-icon">
                  <CalendarIcon className="w-12 h-12" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  No check-in records yet
                </h3>
                <p className="text-slate-500 mb-6 text-lg">
                  Start by completing your first daily check-in.
                </p>
                <Link
                  to="/daily-checkin"
                  className="student-btn student-btn-primary"
                >
                  Go to Daily Check-in
                </Link>
              </div>
            ) : (
              <>
                <div className="student-panel student-chart-panel mb-8">
                  <h3 className="student-panel-title">Mood Trend</h3>
                  <p className="student-panel-subtitle">
                    Mood, stress, and anxiety across your recent check-ins.
                  </p>
                  <ResponsiveContainer width="100%" height={310}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="date" stroke="#6B7280" />
                      <YAxis domain={[0, 10]} stroke="#6B7280" />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="mood"
                        stroke="#0D9488"
                        strokeWidth={3}
                        name="Mood"
                        dot={{
                          fill: '#0D9488',
                          r: 5,
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="stress"
                        stroke="#EF4444"
                        strokeWidth={2}
                        name="Stress"
                        dot={{
                          fill: '#EF4444',
                          r: 4,
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="anxiety"
                        stroke="#F59E0B"
                        strokeWidth={2}
                        name="Anxiety"
                        dot={{
                          fill: '#F59E0B',
                          r: 4,
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <h3 className="student-panel-title mb-4">Recent Check-ins</h3>
                  <div className="space-y-3">
                    {enrichedRecords.map((record, index) => (
                      <div key={index} className="student-history-card">
                        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
                          <div className="flex flex-col md:flex-row md:flex-wrap md:items-center gap-3 md:gap-5 text-sm">
                            <div className="font-semibold text-slate-900">
                              {new Date(record.created_at).toLocaleDateString(
                                'en-US',
                                {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                }
                              )}
                            </div>
                            <span className="text-slate-600">
                              Mood:{' '}
                              <span className="font-semibold text-slate-900">
                                {record.moodTen}/10
                              </span>
                            </span>
                            <span className="text-slate-600">
                              Stress:{' '}
                              <span className="font-semibold text-slate-900">
                                {record.stress_level || 0}/10
                              </span>
                            </span>
                            <span className="text-slate-600">
                              Anxiety:{' '}
                              <span className="font-semibold text-slate-900">
                                {record.anxiety_level || 0}/10
                              </span>
                            </span>
                            <span className="text-slate-600">
                              Sleep:{' '}
                              <span className="font-semibold text-slate-900">
                                {record.sleep_hours || 0}h
                              </span>
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-500">
                              Well-being:
                            </span>
                            <span
                              className={`text-lg font-bold ${
                                record.wellbeing >= 70
                                  ? 'text-green-600'
                                  : record.wellbeing >= 30
                                    ? 'text-yellow-600'
                                    : 'text-red-600'
                              }`}
                            >
                              {record.wellbeing}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <EmergencySOS />
        </motion.div>
      </main>
    </div>
  )
}

export default CheckinRecords
