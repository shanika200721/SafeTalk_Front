import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeftIcon,
  PlayIcon,
  PauseIcon,
  RotateCcwIcon,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sidebar } from '../components/layout/Sidebar'
import { EmergencySOS } from '../components/common/EmergencySOS'

const phaseDurations = {
  inhale: 4,
  hold: 7,
  exhale: 8,
}

const phaseColors = {
  inhale: 'from-blue-400 to-blue-600',
  hold: 'from-purple-400 to-purple-600',
  exhale: 'from-green-400 to-green-600',
  idle: 'from-teal-400 to-teal-600',
}

const phaseInstructions = {
  inhale: 'Breathe In',
  hold: 'Hold',
  exhale: 'Breathe Out',
  idle: 'Ready to Begin',
}

const BreathingExercise = () => {
  const [isActive, setIsActive] = useState(false)
  const [phase, setPhase] = useState('idle')
  const [timer, setTimer] = useState(0)
  const [sessionCount, setSessionCount] = useState(0)

  useEffect(() => {
    if (!isActive) return undefined

    const interval = setInterval(() => {
      setTimer((prev) => {
        const newTimer = prev + 1
        if (phase === 'inhale' && newTimer >= phaseDurations.inhale) {
          setPhase('hold')
          return 0
        }
        if (phase === 'hold' && newTimer >= phaseDurations.hold) {
          setPhase('exhale')
          return 0
        }
        if (phase === 'exhale' && newTimer >= phaseDurations.exhale) {
          setPhase('inhale')
          setSessionCount((count) => count + 1)
          return 0
        }
        return newTimer
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive, phase])

  const handleStart = () => {
    setIsActive(true)
    setPhase('inhale')
    setTimer(0)
  }

  const handlePause = () => {
    setIsActive(false)
  }

  const handleReset = () => {
    setIsActive(false)
    setPhase('idle')
    setTimer(0)
    setSessionCount(0)
  }

  const getCircleScale = () => {
    if (phase === 'idle') return 1
    if (phase === 'inhale') return 1 + (timer / phaseDurations.inhale) * 0.5
    if (phase === 'hold') return 1.5
    if (phase === 'exhale') return 1.5 - (timer / phaseDurations.exhale) * 0.5
    return 1
  }

  const countdown =
    phase === 'inhale'
      ? phaseDurations.inhale - timer
      : phase === 'hold'
        ? phaseDurations.hold - timer
        : phase === 'exhale'
          ? phaseDurations.exhale - timer
          : null

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
            <div className="student-breathing-header">
              <div className="student-page-badge bg-teal-100 text-teal-700">
                Calm
              </div>
              <div>
                <h1 className="student-panel-title">Breathing Exercise</h1>
                <p className="student-panel-subtitle">4-7-8 Breathing Technique</p>
              </div>
            </div>

            <p className="student-breathing-copy">
              This calming breathing technique can help reduce anxiety and
              promote relaxation. Inhale for 4 seconds, hold for 7 seconds, and
              exhale for 8 seconds.
            </p>

            <div className="student-breathing-stage">
              <div className="relative w-80 h-80 flex items-center justify-center mb-8">
                <motion.div
                  animate={{ scale: getCircleScale() }}
                  transition={{
                    duration:
                      phase === 'inhale'
                        ? phaseDurations.inhale
                        : phase === 'exhale'
                          ? phaseDurations.exhale
                          : 0,
                    ease: 'easeInOut',
                  }}
                  className={`absolute w-72 h-72 rounded-full bg-gradient-to-br ${phaseColors[phase]} opacity-20`}
                />
                <motion.div
                  animate={{ scale: getCircleScale() }}
                  transition={{
                    duration:
                      phase === 'inhale'
                        ? phaseDurations.inhale
                        : phase === 'exhale'
                          ? phaseDurations.exhale
                          : 0,
                    ease: 'easeInOut',
                  }}
                  className={`absolute w-56 h-56 rounded-full bg-gradient-to-br ${phaseColors[phase]} opacity-40`}
                />
                <motion.div
                  animate={{ scale: getCircleScale() }}
                  transition={{
                    duration:
                      phase === 'inhale'
                        ? phaseDurations.inhale
                        : phase === 'exhale'
                          ? phaseDurations.exhale
                          : 0,
                    ease: 'easeInOut',
                  }}
                  className={`absolute w-40 h-40 rounded-full bg-gradient-to-br ${phaseColors[phase]}`}
                />
                <div className="relative z-10 text-center text-white">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={phase}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <p className="text-4xl font-extrabold mb-2">
                        {phaseInstructions[phase]}
                      </p>
                      {countdown !== null && (
                        <p className="text-6xl font-extrabold">{countdown}</p>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              <div className="student-breathing-controls">
                {!isActive ? (
                  <button
                    onClick={handleStart}
                    className="student-btn student-btn-primary"
                  >
                    <PlayIcon className="w-5 h-5" />
                    Start
                  </button>
                ) : (
                  <button
                    onClick={handlePause}
                    className="student-btn student-btn-warning"
                  >
                    <PauseIcon className="w-5 h-5" />
                    Pause
                  </button>
                )}
                <button
                  onClick={handleReset}
                  className="student-btn student-btn-secondary"
                >
                  <RotateCcwIcon className="w-5 h-5" />
                  Reset
                </button>
              </div>

              <div className="student-breathing-counter">
                <p className="student-breathing-counter-label">Cycles Completed</p>
                <p className="student-breathing-counter-value">{sessionCount}</p>
              </div>
            </div>

            <div className="student-tip-box">
              <h3 className="student-panel-title text-xl mb-3">How it works</h3>
              <ul className="student-tip-list text-slate-700 text-lg">
                <li>
                  <strong>Inhale (4s):</strong> Breathe in slowly through your
                  nose
                </li>
                <li>
                  <strong>Hold (7s):</strong> Hold your breath gently
                </li>
                <li>
                  <strong>Exhale (8s):</strong> Breathe out slowly through your
                  mouth
                </li>
                <li>Repeat for 3-4 cycles or until you feel calmer</li>
              </ul>
            </div>
          </div>

          <EmergencySOS />
        </motion.div>
      </main>
    </div>
  )
}

export default BreathingExercise
