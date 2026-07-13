import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PauseIcon,
  PlayIcon,
  RotateCcwIcon,
  WindIcon,
} from 'lucide-react';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import { Sidebar } from '../components/layout/Sidebar';
import { EmergencySOS } from '../components/common/EmergencySOS';

const phaseDurations = {
  inhale: 4,
  hold: 7,
  exhale: 8,
};

const phaseInstructions = {
  inhale: 'Breathe In',
  hold: 'Hold',
  exhale: 'Breathe Out',
  idle: 'Ready',
};

const phaseLabels = {
  inhale: 'Inhale through your nose',
  hold: 'Hold gently',
  exhale: 'Exhale slowly',
  idle: 'Start when you are ready',
};

const phaseClassMap = {
  inhale: 'student-breathing-phase-inhale',
  hold: 'student-breathing-phase-hold',
  exhale: 'student-breathing-phase-exhale',
  idle: 'student-breathing-phase-idle',
};

const techniqueSteps = [
  { label: 'Inhale', value: '4s', detail: 'Breathe in slowly through your nose.' },
  { label: 'Hold', value: '7s', detail: 'Hold your breath gently without strain.' },
  { label: 'Exhale', value: '8s', detail: 'Release the breath slowly through your mouth.' },
];

const BreathingExercise = () => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState('idle');
  const [timer, setTimer] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);

  useEffect(() => {
    if (!isActive) return undefined;

    const interval = setInterval(() => {
      setTimer((prev) => {
        const newTimer = prev + 1;
        if (phase === 'inhale' && newTimer >= phaseDurations.inhale) {
          setPhase('hold');
          return 0;
        }
        if (phase === 'hold' && newTimer >= phaseDurations.hold) {
          setPhase('exhale');
          return 0;
        }
        if (phase === 'exhale' && newTimer >= phaseDurations.exhale) {
          setPhase('inhale');
          setSessionCount((count) => count + 1);
          return 0;
        }
        return newTimer;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, phase]);

  const handleStart = () => {
    setIsActive(true);
    setPhase('inhale');
    setTimer(0);
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setPhase('idle');
    setTimer(0);
    setSessionCount(0);
  };

  const getCircleScale = () => {
    if (phase === 'idle') return 1;
    if (phase === 'inhale') return 1 + (timer / phaseDurations.inhale) * 0.5;
    if (phase === 'hold') return 1.5;
    if (phase === 'exhale') return 1.5 - (timer / phaseDurations.exhale) * 0.5;
    return 1;
  };

  const phaseDuration = phaseDurations[phase] || 0;
  const countdown =
    phase === 'idle' ? null : Math.max(phaseDuration - timer, 0);
  const phaseProgress =
    phase === 'idle' ? 0 : Math.min((timer / phaseDuration) * 100, 100);

  return (
    <div className="student-shell">
      <Sidebar />
      <main className="student-main">
        <div className="student-page student-breathing-page">
          <Link to="/dashboard" className="student-top-link">
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>

          <section className="student-breathing-hero">
            <div>
              <p className="student-breathing-eyebrow">Guided Calm</p>
              <h1>Breathing Exercise</h1>
              <p>
                Use the 4-7-8 technique to slow your body down and create a
                calmer moment before continuing your day.
              </p>
            </div>
            <div className="student-breathing-hero-card">
              <WindIcon className="w-8 h-8" />
              <span>4-7-8 rhythm</span>
            </div>
          </section>

          <div className="student-breathing-layout">
            <section className="student-breathing-panel student-breathing-practice-panel">
              <div className="student-breathing-panel-head">
                <div>
                  <h2>Practice Session</h2>
                  <p>{phaseLabels[phase]}</p>
                </div>
                <div className="student-breathing-cycle-pill">
                  {sessionCount} cycles
                </div>
              </div>

              <div className={`student-breathing-orb-wrap ${phaseClassMap[phase]}`}>
                <div className="student-breathing-orb-stage">
                  <Motion.div
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
                    className="student-breathing-orb student-breathing-orb-outer"
                  />
                  <Motion.div
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
                    className="student-breathing-orb student-breathing-orb-middle"
                  />
                  <Motion.div
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
                    className="student-breathing-orb student-breathing-orb-core"
                  />

                  <div className="student-breathing-orb-content">
                    <AnimatePresence mode="wait">
                      <Motion.div
                        key={phase}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <p>{phaseInstructions[phase]}</p>
                        {countdown !== null && <strong>{countdown}</strong>}
                      </Motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              <div className="student-breathing-progress">
                <div style={{ width: `${phaseProgress}%` }} />
              </div>

              <div className="student-breathing-controls">
                {!isActive ? (
                  <button onClick={handleStart} className="student-btn student-btn-primary">
                    <PlayIcon className="w-5 h-5" />
                    Start
                  </button>
                ) : (
                  <button onClick={handlePause} className="student-btn student-btn-warning">
                    <PauseIcon className="w-5 h-5" />
                    Pause
                  </button>
                )}
                <button onClick={handleReset} className="student-btn student-btn-secondary">
                  <RotateCcwIcon className="w-5 h-5" />
                  Reset
                </button>
              </div>
            </section>

            <aside className="student-breathing-side">
              <section className="student-breathing-panel">
                <div className="student-breathing-panel-head">
                  <div>
                    <h2>Technique</h2>
                    <p>One complete cycle takes 19 seconds.</p>
                  </div>
                </div>
                <div className="student-breathing-step-list">
                  {techniqueSteps.map((step) => (
                    <div key={step.label} className="student-breathing-step-card">
                      <span>{step.value}</span>
                      <div>
                        <h3>{step.label}</h3>
                        <p>{step.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="student-breathing-panel student-breathing-note">
                <h2>Suggested Use</h2>
                <p>
                  Repeat for 3-4 cycles, or pause sooner if you feel lightheaded.
                  Keep the breath gentle and comfortable.
                </p>
              </section>
            </aside>
          </div>

          <EmergencySOS />
        </div>
      </main>
    </div>
  );
};

export default BreathingExercise;
