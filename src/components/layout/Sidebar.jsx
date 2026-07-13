import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboardIcon,
  ClipboardCheckIcon,
  HistoryIcon,
  ClipboardListIcon,
  MessageCircleIcon,
  BookOpenIcon,
  WindIcon,
  MenuIcon,
  XIcon,
  HeartPulseIcon,
} from 'lucide-react'
import { motion as Motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboardIcon,
  },
  {
    path: '/daily-checkin',
    label: 'Daily Check-in',
    icon: ClipboardCheckIcon,
  },
  {
    path: '/checkin-history',
    label: 'Check-in History',
    icon: HistoryIcon,
  },
  {
    path: '/dass21',
    label: 'DASS-21 Self Test',
    icon: ClipboardListIcon,
    activePaths: ['/dass21', '/dass21-assessment'],
  },
  {
    path: '/chat-support',
    label: 'Chat Support',
    icon: MessageCircleIcon,
  },
  {
    path: '/resources',
    label: 'Resources',
    icon: BookOpenIcon,
  },
  {
    path: '/breathing-exercise',
    label: 'Breathing Exercise',
    icon: WindIcon,
  },
]

export function Sidebar() {
  const location = useLocation()
  const { user } = useAuth()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const sidebarContent = (
    <div className="student-sidebar-panel">
      <div className="student-sidebar-brand">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center shrink-0">
            <HeartPulseIcon className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-gray-900">SafeTalk</h1>
            <p className="text-xs text-gray-500">Mental Health Support</p>
          </div>
        </div>
      </div>

      <nav className="student-sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = item.activePaths
            ? item.activePaths.includes(location.pathname)
            : location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              className={`student-sidebar-link ${isActive ? 'student-sidebar-link-active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="student-sidebar-link-icon" />
              <span className="student-sidebar-link-label">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="student-sidebar-user-wrap">
        <div className="student-sidebar-user">
          <div className="student-sidebar-avatar">
            {user?.full_name?.substring(0, 2).toUpperCase() || 'US'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900">{user?.full_name || 'Student'}</p>
            <p className="text-xs text-gray-500">{user?.role || 'Student'}</p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-lg border border-gray-200"
      >
        {isMobileOpen ? (
          <XIcon className="w-6 h-6" />
        ) : (
          <MenuIcon className="w-6 h-6" />
        )}
      </button>

      <div className="hidden lg:block student-sidebar-desktop">
        {sidebarContent}
      </div>

      <AnimatePresence>
        {isMobileOpen && (
          <>
            <Motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
            />
            <Motion.div
              initial={{
                x: -280,
              }}
              animate={{
                x: 0,
              }}
              exit={{
                x: -280,
              }}
              transition={{
                type: 'spring',
                damping: 25,
                stiffness: 200,
              }}
              className="lg:hidden fixed top-0 left-0 student-sidebar-mobile h-screen z-50"
            >
              {sidebarContent}
            </Motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
