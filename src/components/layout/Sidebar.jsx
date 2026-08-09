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
  MoonIcon,
  MusicIcon,
  PenLineIcon,
  FilmIcon,
  SparklesIcon,
  TrendingUpIcon,
  SettingsIcon,
  MenuIcon,
  XIcon,
  HeartPulseIcon,
} from 'lucide-react'
import { motion as Motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'

const studentNavItems = [
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
    activePaths: [
      '/chat-support',
      '/chat-with-counselor',
      '/chat',
      '/safetalk-bot',
      '/chat-interface',
    ],
  },
  {
    path: '/wellness',
    label: 'Wellness Hub',
    icon: SparklesIcon,
    activePaths: ['/wellness', '/wellness-hub'],
  },
  {
    path: '/breathing',
    label: 'Breathing Center',
    icon: WindIcon,
    activePaths: ['/breathing', '/breathing-center', '/breathing-exercise'],
  },
  {
    path: '/meditation',
    label: 'Meditation',
    icon: MoonIcon,
  },
  {
    path: '/ambient-sounds',
    label: 'Ambient Sounds',
    icon: MusicIcon,
  },
  {
    path: '/mindfulness-activities',
    label: 'Mindfulness',
    icon: HeartPulseIcon,
  },
  {
    path: '/video-library',
    label: 'Video Library',
    icon: FilmIcon,
  },
  {
    path: '/journal',
    label: 'Journal',
    icon: PenLineIcon,
  },
  {
    path: '/resources',
    label: 'Resource Library',
    icon: BookOpenIcon,
  },
  {
    path: '/progress',
    label: 'Progress',
    icon: TrendingUpIcon,
  },
  {
    path: '/preferences',
    label: 'Preferences',
    icon: SettingsIcon,
  },
]

const counselorNavItems = [
  {
    path: '/counselor',
    label: 'Dashboard',
    icon: LayoutDashboardIcon,
    activePaths: ['/counselor', '/counselor/dashboard'],
  },
  {
    path: '/counselor/students',
    label: 'Assigned Students',
    icon: ClipboardListIcon,
    activePaths: ['/counselor/students', '/counselor/student/*'],
  },
  {
    path: '/counselor/chat',
    label: 'Student Messages',
    icon: MessageCircleIcon,
  },
  {
    path: '/counselor/sessions',
    label: 'Sessions',
    icon: ClipboardCheckIcon,
    activePaths: ['/counselor/sessions', '/counselor/session/*'],
  },
]

const adminNavItems = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboardIcon },
  { key: 'universities', label: 'Universities', icon: BookOpenIcon },
  { key: 'users', label: 'Users', icon: ClipboardListIcon },
  { key: 'counselors', label: 'Counselors', icon: HeartPulseIcon },
  { key: 'models', label: 'Models', icon: SparklesIcon },
  { key: 'resources', label: 'Resources', icon: BookOpenIcon },
  { key: 'analytics', label: 'Analytics', icon: TrendingUpIcon },
  { key: 'reports', label: 'Reports', icon: ClipboardCheckIcon },
  { key: 'audit', label: 'Audit Logs', icon: HistoryIcon },
  { key: 'settings', label: 'Settings', icon: SettingsIcon },
]

const sidebarNavByVariant = {
  student: studentNavItems,
  counselor: counselorNavItems,
  admin: adminNavItems,
}

const sidebarCopyByVariant = {
  student: {
    title: 'SafeTalk',
    subtitle: 'Mental Health Support',
    userFallback: 'Student',
  },
  counselor: {
    title: 'SafeTalk',
    subtitle: 'Counselor Workspace',
    userFallback: 'Counselor',
  },
  admin: {
    title: 'SafeTalk',
    subtitle: 'Admin Portal',
    userFallback: 'Admin',
  },
}

export function Sidebar({
  variant = 'student',
  navItems,
  activeKey,
  onItemSelect,
  brandTitle,
  brandSubtitle,
  userFallback,
}) {
  const location = useLocation()
  const { user } = useAuth()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const items = navItems || sidebarNavByVariant[variant] || studentNavItems
  const copy = sidebarCopyByVariant[variant] || sidebarCopyByVariant.student
  const title = brandTitle || copy.title
  const subtitle = brandSubtitle || copy.subtitle
  const fallback = userFallback || copy.userFallback

  const renderIcon = (Icon) => (
    Icon ? <Icon className="student-sidebar-link-icon" /> : null
  )

  const isItemActive = (item) => {
    if (activeKey !== undefined && item.key !== undefined) {
      return activeKey === item.key
    }
    if (item.activePaths) {
      return item.activePaths.some((path) => (
        path.endsWith('*')
          ? location.pathname.startsWith(path.slice(0, -1))
          : location.pathname === path
      ))
    }
    return item.path ? location.pathname === item.path : false
  }

  const handleItemSelect = (item) => {
    onItemSelect?.(item)
    setIsMobileOpen(false)
  }

  const sidebarContent = (
    <div className="student-sidebar-panel">
      <div className="student-sidebar-brand">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center shrink-0">
            <HeartPulseIcon className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-gray-900">{title}</h1>
            <p className="text-xs text-gray-500">{subtitle}</p>
          </div>
        </div>
      </div>

      <nav className="student-sidebar-nav">
        {items.map((item) => {
          const isActive = isItemActive(item)
          const className = `student-sidebar-link ${isActive ? 'student-sidebar-link-active' : ''}`
          if (!item.path || onItemSelect) {
            return (
              <button
                key={item.key || item.path}
                type="button"
                onClick={() => handleItemSelect(item)}
                className={`${className} student-sidebar-button`}
                aria-current={isActive ? 'page' : undefined}
              >
                {renderIcon(item.icon)}
                <span className="student-sidebar-link-label">{item.label}</span>
              </button>
            )
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              className={className}
              aria-current={isActive ? 'page' : undefined}
            >
              {renderIcon(item.icon)}
              <span className="student-sidebar-link-label">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="student-sidebar-user-wrap">
        <div className="student-sidebar-user">
          <div className="student-sidebar-avatar">
            {user?.full_name?.substring(0, 2).toUpperCase() || fallback.substring(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900">{user?.full_name || fallback}</p>
            <p className="text-xs text-gray-500">{user?.role || fallback}</p>
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
