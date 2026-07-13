import React, { useState } from 'react'
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
  {
    title: 'Managing Exam Stress',
    category: 'Academic',
    color: 'blue',
  },
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
  {
    title: 'Coping with Anxiety',
    category: 'Mental Health',
    color: 'purple',
  },
  {
    title: 'Social Connection Tips',
    category: 'Wellness',
    color: 'green',
  },
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

const Resources = () => {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      className="max-w-6xl mx-auto p-6"
    >
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-6"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Dashboard</span>
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
            <span className="text-2xl">📚</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
            <p className="text-sm text-gray-500">
              Find help, information, and support
            </p>
          </div>
        </div>

        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search resources..."
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <PhoneIcon className="w-5 h-5 text-red-600" />
            Crisis Hotlines
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {crisisHotlines.map((hotline, index) => {
              const Icon = hotline.icon
              return (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:border-red-300 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {hotline.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {hotline.description}
                      </p>
                      <a
                        href={`tel:${hotline.phone}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <PhoneIcon className="w-4 h-4" />
                        {hotline.phone}
                      </a>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpenIcon className="w-5 h-5 text-blue-600" />
            Self-Help Articles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {articles.map((article, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:border-teal-300 transition-colors cursor-pointer"
              >
                <div
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-3 ${article.color === 'blue' ? 'bg-blue-100 text-blue-700' : article.color === 'green' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}
                >
                  {article.category}
                </div>
                <h3 className="font-semibold text-gray-900">{article.title}</h3>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BuildingIcon className="w-5 h-5 text-teal-600" />
            Campus Resources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                University Counseling Center
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Free counseling services for students
              </p>
              <p className="text-sm text-gray-700">
                <strong>Hours:</strong> Mon-Fri, 9AM-5PM
                <br />
                <strong>Phone:</strong> (555) 123-4567
                <br />
                <strong>Location:</strong> Student Services Building, Room 200
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Student Health Services
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Medical and mental health support
              </p>
              <p className="text-sm text-gray-700">
                <strong>Hours:</strong> Mon-Fri, 8AM-6PM
                <br />
                <strong>Phone:</strong> (555) 123-4568
                <br />
                <strong>Location:</strong> Health Center, Main Campus
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <HeartIcon className="w-5 h-5 text-pink-600" />
            Coping Strategies
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {copingStrategies.map((strategy, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-teal-50 to-green-50 border border-teal-200 rounded-xl p-6"
              >
                <h3 className="font-semibold text-gray-900 mb-2">
                  {strategy.title}
                </h3>
                <p className="text-sm text-gray-700">{strategy.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </motion.div>
  )
}

export default Resources
