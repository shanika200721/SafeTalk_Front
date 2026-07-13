import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeftIcon,
  PhoneIcon,
  MessageSquareIcon,
  BookOpenIcon,
  HeartIcon,
  SearchIcon,
  BuildingIcon,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Sidebar } from '../components/layout/Sidebar'
import { EmergencySOS } from '../components/common/EmergencySOS'

const crisisHotlines = [
  {
    name: '988 Suicide & Crisis Lifeline',
    description: 'Free, confidential support 24/7 for people in distress',
    phone: '988',
    icon: PhoneIcon,
  },
  {
    name: 'Crisis Text Line',
    description: 'Text HOME to connect with a crisis counselor',
    phone: '741741',
    icon: MessageSquareIcon,
  },
  {
    name: 'The Trevor Project',
    description: 'Crisis support for LGBTQ+ youth',
    phone: '1-866-488-7386',
    icon: PhoneIcon,
  },
  {
    name: 'SAMHSA National Helpline',
    description: 'Treatment referral and information service',
    phone: '1-800-662-4357',
    icon: PhoneIcon,
  },
]

const articles = [
  { title: 'Managing Exam Stress', category: 'Academic', color: 'blue' },
  {
    title: 'Building Healthy Sleep Habits',
    category: 'Wellness',
    color: 'green',
  },
  {
    title: 'Mindfulness for Beginners',
    category: 'Mental Health',
    color: 'purple',
  },
  { title: 'Coping with Anxiety', category: 'Mental Health', color: 'purple' },
  { title: 'Social Connection Tips', category: 'Wellness', color: 'green' },
  {
    title: 'Time Management Strategies',
    category: 'Academic',
    color: 'blue',
  },
]

const copingStrategies = [
  {
    title: 'Deep Breathing',
    description: 'Practice 4-7-8 breathing technique',
  },
  {
    title: 'Physical Activity',
    description: 'Go for a walk or do light exercise',
  },
  {
    title: 'Journaling',
    description: 'Write down your thoughts and feelings',
  },
  {
    title: 'Social Support',
    description: 'Reach out to friends or family',
  },
  {
    title: 'Mindfulness',
    description: 'Try meditation or grounding exercises',
  },
  {
    title: 'Creative Expression',
    description: 'Engage in art, music, or writing',
  },
]

const categoryClassMap = {
  blue: 'bg-blue-100 text-blue-700',
  green: 'bg-green-100 text-green-700',
  purple: 'bg-purple-100 text-purple-700',
}

const Resources = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const normalizedQuery = searchQuery.trim().toLowerCase()

  const filteredArticles = useMemo(() => {
    if (!normalizedQuery) return articles
    return articles.filter(
      (article) =>
        article.title.toLowerCase().includes(normalizedQuery) ||
        article.category.toLowerCase().includes(normalizedQuery)
    )
  }, [normalizedQuery])

  const filteredStrategies = useMemo(() => {
    if (!normalizedQuery) return copingStrategies
    return copingStrategies.filter(
      (strategy) =>
        strategy.title.toLowerCase().includes(normalizedQuery) ||
        strategy.description.toLowerCase().includes(normalizedQuery)
    )
  }, [normalizedQuery])

  const filteredHotlines = useMemo(() => {
    if (!normalizedQuery) return crisisHotlines
    return crisisHotlines.filter(
      (hotline) =>
        hotline.name.toLowerCase().includes(normalizedQuery) ||
        hotline.description.toLowerCase().includes(normalizedQuery) ||
        hotline.phone.includes(normalizedQuery)
    )
  }, [normalizedQuery])

  return (
    <div className="student-shell">
      <Sidebar />
      <main className="student-main">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="student-page"
        >
          <Link to="/dashboard" className="student-top-link">
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="student-surface p-8 mt-5">
            <div className="student-page-heading">
              <div className="student-page-badge bg-pink-100 text-pink-700">
                Help
              </div>
              <div>
                <h1 className="student-panel-title">Resources</h1>
                <p className="student-panel-subtitle">
                  Find help, information, and support
                </p>
              </div>
            </div>

            <div className="student-resource-search">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search resources..."
                className="student-search-input"
              />
            </div>

            <section className="student-section">
              <h2 className="student-section-heading">
                <PhoneIcon className="w-6 h-6 text-red-600" />
                Crisis Hotlines
              </h2>
              <div className="student-resource-grid">
                {filteredHotlines.map((hotline, index) => {
                  const Icon = hotline.icon
                  return (
                    <div key={index} className="student-resource-card student-hotline-card">
                      <div className="student-hotline-icon">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">
                          {hotline.name}
                        </h3>
                        <p className="text-slate-600 text-lg leading-7">
                          {hotline.description}
                        </p>
                        <a href={`tel:${hotline.phone}`} className="student-phone-pill">
                          <PhoneIcon className="w-4 h-4" />
                          {hotline.phone}
                        </a>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            <section className="student-section">
              <h2 className="student-section-heading">
                <BookOpenIcon className="w-6 h-6 text-blue-600" />
                Self-Help Articles
              </h2>
              <div className="student-article-grid">
                {filteredArticles.map((article, index) => (
                  <div key={index} className="student-resource-card student-article-card">
                    <span
                      className={`student-article-chip ${
                        categoryClassMap[article.color] || categoryClassMap.blue
                      }`}
                    >
                      {article.category}
                    </span>
                    <h3 className="text-2xl font-bold text-slate-900 leading-tight">
                      {article.title}
                    </h3>
                  </div>
                ))}
              </div>
            </section>

            <section className="student-section">
              <h2 className="student-section-heading">
                <BuildingIcon className="w-6 h-6 text-teal-600" />
                Campus Resources
              </h2>
              <div className="student-campus-grid">
                <div className="student-resource-card student-campus-card">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    University Counseling Center
                  </h3>
                  <p className="text-slate-600 text-lg mb-4">
                    Free counseling services for students
                  </p>
                  <p className="student-campus-meta">
                    <strong>Hours:</strong> Mon-Fri, 9AM-5PM
                    <br />
                    <strong>Phone:</strong> (555) 123-4567
                    <br />
                    <strong>Location:</strong> Student Services Building, Room 200
                  </p>
                </div>
                <div className="student-resource-card student-campus-card">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    Student Health Services
                  </h3>
                  <p className="text-slate-600 text-lg mb-4">
                    Medical and mental health support
                  </p>
                  <p className="student-campus-meta">
                    <strong>Hours:</strong> Mon-Fri, 8AM-6PM
                    <br />
                    <strong>Phone:</strong> (555) 123-4568
                    <br />
                    <strong>Location:</strong> Health Center, Main Campus
                  </p>
                </div>
              </div>
            </section>

            <section className="student-section">
              <h2 className="student-section-heading">
                <HeartIcon className="w-6 h-6 text-pink-600" />
                Coping Strategies
              </h2>
              <div className="student-strategy-grid">
                {filteredStrategies.map((strategy, index) => (
                  <div key={index} className="student-resource-card student-strategy-card">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">
                      {strategy.title}
                    </h3>
                    <p className="text-slate-600 text-lg leading-7">
                      {strategy.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <EmergencySOS />
        </motion.div>
      </main>
    </div>
  )
}

export default Resources
