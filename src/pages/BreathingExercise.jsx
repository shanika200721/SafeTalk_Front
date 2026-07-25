import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PauseIcon,
  PlayIcon,
  RotateCcwIcon,
  Volume2Icon,
  VolumeXIcon,
  WindIcon,
} from 'lucide-react';
import { motion as Motion } from 'framer-motion';
import { Sidebar } from '../components/layout/Sidebar';
import { EmergencySOS } from '../components/common/EmergencySOS';

const STAGE_DURATION_MS = 4000;
const CYCLE_DURATION_MS = STAGE_DURATION_MS * 4;
const BOX_START = 62;
const BOX_END = 258;

const stages = [
  {
    key: 'inhale',
    title: 'Breathe in',
    subtitle: 'Let the breath arrive gently.',
    side: 'left side upward',
  },
  {
    key: 'hold',
    title: 'Hold gently',
    subtitle: 'Keep your shoulders soft.',
    side: 'top side across',
  },
  {
    key: 'exhale',
    title: 'Breathe out slowly',
    subtitle: 'Release the breath without forcing.',
    side: 'right side downward',
  },
  {
    key: 'pause',
    title: 'Pause',
    subtitle: 'Rest for a moment before the next breath.',
    side: 'bottom side returning',
  },
];

const techniqueSteps = [
  { label: 'Breathe in', value: '4s', detail: 'The light moves upward.' },
  { label: 'Hold gently', value: '4s', detail: 'The light moves across the top.' },
  { label: 'Breathe out slowly', value: '4s', detail: 'The light moves downward.' },
  { label: 'Pause', value: '4s', detail: 'The light returns across the bottom.' },
];

const pointForStage = (stageIndex, progress) => {
  const span = BOX_END - BOX_START;

  if (stageIndex === 0) {
    return { x: BOX_START, y: BOX_END - span * progress };
  }
  if (stageIndex === 1) {
    return { x: BOX_START + span * progress, y: BOX_START };
  }
  if (stageIndex === 2) {
    return { x: BOX_END, y: BOX_START + span * progress };
  }
  return { x: BOX_END - span * progress, y: BOX_END };
};

const BreathingExercise = () => {
  const [isActive, setIsActive] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [soundOn, setSoundOn] = useState(false);
  const animationRef = useRef(null);
  const startedAtRef = useRef(null);
  const pausedElapsedRef = useRef(0);
  const audioRef = useRef(null);

  const stageIndex = Math.floor((elapsedMs % CYCLE_DURATION_MS) / STAGE_DURATION_MS);
  const stageElapsed = elapsedMs % STAGE_DURATION_MS;
  const stageProgress = Math.min(stageElapsed / STAGE_DURATION_MS, 1);
  const activeStage = stages[stageIndex];
  const countdown = Math.max(1, Math.ceil((STAGE_DURATION_MS - stageElapsed) / 1000));
  const cycleCount = Math.floor(elapsedMs / CYCLE_DURATION_MS);
  const lightPoint = useMemo(
    () => pointForStage(stageIndex, stageProgress),
    [stageIndex, stageProgress]
  );

  const stopAmbientSound = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.gain.gain.cancelScheduledValues(audio.context.currentTime);
    audio.gain.gain.linearRampToValueAtTime(0.0001, audio.context.currentTime + 0.25);
    window.setTimeout(() => {
      audio.oscillator.stop();
      audio.context.close();
    }, 300);
    audioRef.current = null;
  };

  const startAmbientSound = () => {
    if (audioRef.current) return;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = 174;
    gain.gain.value = 0.0001;
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    gain.gain.linearRampToValueAtTime(0.025, context.currentTime + 0.7);

    audioRef.current = { context, oscillator, gain };
  };

  useEffect(() => {
    if (!isActive) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return undefined;
    }

    startedAtRef.current = performance.now() - pausedElapsedRef.current;

    const tick = (timestamp) => {
      const nextElapsed = timestamp - startedAtRef.current;
      pausedElapsedRef.current = nextElapsed;
      setElapsedMs(nextElapsed);
      animationRef.current = requestAnimationFrame(tick);
    };

    animationRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationRef.current);
  }, [isActive]);

  useEffect(() => {
    if (isActive && soundOn) {
      startAmbientSound();
    } else {
      stopAmbientSound();
    }

    return () => stopAmbientSound();
  }, [isActive, soundOn]);

  const handleStart = () => {
    setIsActive(true);
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleRestart = () => {
    setIsActive(false);
    setElapsedMs(0);
    pausedElapsedRef.current = 0;
    startedAtRef.current = null;
    window.setTimeout(() => setIsActive(true), 0);
  };

  const toggleSound = () => {
    setSoundOn((current) => !current);
  };

  return (
    <div className="student-shell">
      <Sidebar />
      <main className="student-main">
        <div className="student-page student-breathing-page student-box-breathing-page">
          <Link to="/dashboard" className="student-top-link">
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>

          <section className="student-breathing-hero student-box-breathing-hero">
            <div>
              <p className="student-breathing-eyebrow">Guided Calm</p>
              <h1>Box Breathing</h1>
              <p>
                Follow the light around the square for a steady 4-second rhythm.
                Keep each breath comfortable and gentle.
              </p>
            </div>
            <div className="student-breathing-hero-card">
              <WindIcon className="w-8 h-8" />
              <span>4-4-4-4 rhythm</span>
            </div>
          </section>

          <div className="student-breathing-layout">
            <section className="student-breathing-panel student-breathing-practice-panel student-box-breathing-practice">
              <div className="student-breathing-panel-head">
                <div>
                  <h2>Guided Practice</h2>
                  <p>{activeStage.subtitle}</p>
                </div>
                <div className="student-breathing-cycle-pill">
                  {cycleCount} cycles
                </div>
              </div>

              <div className="student-box-stage" aria-live="polite">
                <svg className="student-box-svg" viewBox="0 0 320 320" role="img" aria-label={`Box breathing stage: ${activeStage.title}`}>
                  <defs>
                    <filter id="boxBreathingGlow" x="-60%" y="-60%" width="220%" height="220%">
                      <feGaussianBlur stdDeviation="6" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <rect
                    x={BOX_START}
                    y={BOX_START}
                    width={BOX_END - BOX_START}
                    height={BOX_END - BOX_START}
                    rx="18"
                    className="student-box-track"
                  />
                  <rect
                    x={BOX_START}
                    y={BOX_START}
                    width={BOX_END - BOX_START}
                    height={BOX_END - BOX_START}
                    rx="18"
                    className="student-box-glow"
                  />
                  <Motion.circle
                    cx={lightPoint.x}
                    cy={lightPoint.y}
                    r="9"
                    className="student-box-light"
                    filter="url(#boxBreathingGlow)"
                  />
                </svg>

                <div className="student-box-copy">
                  <Motion.div
                    key={activeStage.key}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                  >
                    <p className="student-box-stage-title">{activeStage.title}</p>
                    <strong>{countdown}</strong>
                    <p className="student-box-subtitle">{activeStage.side}</p>
                  </Motion.div>
                </div>
              </div>

              <div className="student-breathing-progress" aria-hidden="true">
                <div style={{ width: `${stageProgress * 100}%` }} />
              </div>

              <div className="student-breathing-controls">
                <button
                  type="button"
                  onClick={handleStart}
                  className="student-btn student-btn-primary"
                  disabled={isActive}
                >
                  <PlayIcon className="w-5 h-5" />
                  Start
                </button>
                <button
                  type="button"
                  onClick={handlePause}
                  className="student-btn student-btn-warning"
                  disabled={!isActive}
                >
                  <PauseIcon className="w-5 h-5" />
                  Pause
                </button>
                <button
                  type="button"
                  onClick={handleRestart}
                  className="student-btn student-btn-secondary"
                >
                  <RotateCcwIcon className="w-5 h-5" />
                  Restart
                </button>
                <button
                  type="button"
                  onClick={toggleSound}
                  className="student-btn student-btn-secondary"
                  aria-pressed={soundOn}
                >
                  {soundOn ? (
                    <Volume2Icon className="w-5 h-5" />
                  ) : (
                    <VolumeXIcon className="w-5 h-5" />
                  )}
                  {soundOn ? 'Sound On' : 'Sound Off'}
                </button>
              </div>
            </section>

            <aside className="student-breathing-side">
              <section className="student-breathing-panel">
                <div className="student-breathing-panel-head">
                  <div>
                    <h2>Box Breathing</h2>
                    <p>One complete cycle takes 16 seconds.</p>
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
                <h2>Gentle Reminder</h2>
                <p>
                  This is a simple guided breathing practice for a quiet study
                  break. Notice how you feel. Stop if you become uncomfortable.
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
