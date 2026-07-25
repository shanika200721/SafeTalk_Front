import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  HandIcon,
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

const FIVE_STAGE_DURATION_MS = 3200;

const fiveFingerPaths = [
  {
    finger: 'thumb',
    up: { start: { x: 92, y: 232 }, end: { x: 44, y: 152 } },
    down: { start: { x: 44, y: 152 }, end: { x: 94, y: 130 } },
  },
  {
    finger: 'index finger',
    up: { start: { x: 94, y: 130 }, end: { x: 112, y: 54 } },
    down: { start: { x: 112, y: 54 }, end: { x: 146, y: 132 } },
  },
  {
    finger: 'middle finger',
    up: { start: { x: 146, y: 132 }, end: { x: 160, y: 36 } },
    down: { start: { x: 160, y: 36 }, end: { x: 190, y: 132 } },
  },
  {
    finger: 'ring finger',
    up: { start: { x: 190, y: 132 }, end: { x: 210, y: 64 } },
    down: { start: { x: 210, y: 64 }, end: { x: 232, y: 144 } },
  },
  {
    finger: 'little finger',
    up: { start: { x: 232, y: 144 }, end: { x: 262, y: 102 } },
    down: { start: { x: 262, y: 102 }, end: { x: 244, y: 224 } },
  },
];

const fiveFingerStages = fiveFingerPaths.flatMap((finger, index) => [
  {
    key: `${finger.finger}-in`,
    finger: finger.finger,
    title: 'Breathe in slowly.',
    subtitle: `Trace up the ${finger.finger}.`,
    pointA: finger.up.start,
    pointB: finger.up.end,
    step: index * 2 + 1,
  },
  {
    key: `${finger.finger}-out`,
    finger: finger.finger,
    title: 'Breathe out slowly.',
    subtitle: `Trace down the ${finger.finger}.`,
    pointA: finger.down.start,
    pointB: finger.down.end,
    step: index * 2 + 2,
  },
]);

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

const lerp = (start, end, progress) => start + (end - start) * progress;

const pointForFiveFingerStage = (stage, progress) => ({
  x: lerp(stage.pointA.x, stage.pointB.x, progress),
  y: lerp(stage.pointA.y, stage.pointB.y, progress),
});

const BreathingExercise = () => {
  const [activeExercise, setActiveExercise] = useState('box');
  const [isActive, setIsActive] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [soundOn, setSoundOn] = useState(false);
  const [fiveIsActive, setFiveIsActive] = useState(false);
  const [fiveElapsedMs, setFiveElapsedMs] = useState(0);
  const [fiveMuted, setFiveMuted] = useState(true);
  const [fiveHasFinished, setFiveHasFinished] = useState(false);
  const animationRef = useRef(null);
  const startedAtRef = useRef(null);
  const pausedElapsedRef = useRef(0);
  const audioRef = useRef(null);
  const fiveAnimationRef = useRef(null);
  const fiveStartedAtRef = useRef(null);
  const fivePausedElapsedRef = useRef(0);

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
  const fiveStageIndex = Math.min(
    Math.floor(fiveElapsedMs / FIVE_STAGE_DURATION_MS),
    fiveFingerStages.length - 1
  );
  const fiveStageElapsed = fiveElapsedMs % FIVE_STAGE_DURATION_MS;
  const fiveStageProgress = Math.min(fiveStageElapsed / FIVE_STAGE_DURATION_MS, 1);
  const activeFiveStage = fiveFingerStages[fiveStageIndex];
  const fivePointerPoint = pointForFiveFingerStage(activeFiveStage, fiveStageProgress);
  const fiveCountdown = Math.max(1, Math.ceil((FIVE_STAGE_DURATION_MS - fiveStageElapsed) / 1000));
  const fiveTotalProgress = Math.min(
    fiveElapsedMs / (FIVE_STAGE_DURATION_MS * fiveFingerStages.length),
    1
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
    if (!fiveIsActive) {
      if (fiveAnimationRef.current) {
        cancelAnimationFrame(fiveAnimationRef.current);
      }
      return undefined;
    }

    fiveStartedAtRef.current = performance.now() - fivePausedElapsedRef.current;

    const tick = (timestamp) => {
      const nextElapsed = timestamp - fiveStartedAtRef.current;
      const totalDuration = FIVE_STAGE_DURATION_MS * fiveFingerStages.length;

      if (nextElapsed >= totalDuration) {
        fivePausedElapsedRef.current = totalDuration;
        setFiveElapsedMs(totalDuration);
        setFiveIsActive(false);
        setFiveHasFinished(true);
        return;
      }

      fivePausedElapsedRef.current = nextElapsed;
      setFiveElapsedMs(nextElapsed);
      fiveAnimationRef.current = requestAnimationFrame(tick);
    };

    fiveAnimationRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(fiveAnimationRef.current);
  }, [fiveIsActive]);

  useEffect(() => {
    if (isActive && soundOn) {
      startAmbientSound();
    } else {
      stopAmbientSound();
    }

    return () => stopAmbientSound();
  }, [isActive, soundOn]);

  useEffect(() => {
    if (!fiveIsActive || fiveMuted || !('speechSynthesis' in window)) {
      window.speechSynthesis?.cancel();
      return undefined;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(activeFiveStage.title);
    utterance.rate = 0.82;
    utterance.pitch = 0.9;
    utterance.volume = 0.72;
    window.speechSynthesis.speak(utterance);

    return () => window.speechSynthesis.cancel();
  }, [activeFiveStage.title, fiveIsActive, fiveMuted]);

  const selectExercise = (exercise) => {
    setIsActive(false);
    setFiveIsActive(false);
    window.speechSynthesis?.cancel();
    setActiveExercise(exercise);
  };

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

  const handleFiveStart = () => {
    if (fiveHasFinished) {
      fivePausedElapsedRef.current = 0;
      setFiveElapsedMs(0);
      setFiveHasFinished(false);
    }
    setFiveIsActive(true);
  };

  const handleFivePause = () => {
    setFiveIsActive(false);
  };

  const handleFiveRestart = () => {
    window.speechSynthesis?.cancel();
    setFiveIsActive(false);
    setFiveElapsedMs(0);
    setFiveHasFinished(false);
    fivePausedElapsedRef.current = 0;
    fiveStartedAtRef.current = null;
  };

  const toggleFiveMute = () => {
    setFiveMuted((current) => !current);
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
              <h1>Breathing Exercises</h1>
              <p>
                Choose a quiet visual guide for a short study break. Keep each
                breath comfortable and gentle.
              </p>
            </div>
            <div className="student-breathing-hero-card">
              {activeExercise === 'box' ? (
                <WindIcon className="w-8 h-8" />
              ) : (
                <HandIcon className="w-8 h-8" />
              )}
              <span>{activeExercise === 'box' ? '4-4-4-4 rhythm' : '5-finger guide'}</span>
            </div>
          </section>

          <div className="student-breathing-mode-switch" role="tablist" aria-label="Choose a breathing exercise">
            <button
              type="button"
              role="tab"
              aria-selected={activeExercise === 'box'}
              className={activeExercise === 'box' ? 'student-breathing-mode-active' : ''}
              onClick={() => selectExercise('box')}
            >
              <WindIcon className="w-5 h-5" />
              Box Breathing
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeExercise === 'five'}
              className={activeExercise === 'five' ? 'student-breathing-mode-active' : ''}
              onClick={() => selectExercise('five')}
            >
              <HandIcon className="w-5 h-5" />
              Five-finger Breathing
            </button>
          </div>

          {activeExercise === 'box' ? (
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
          ) : (
            <div className="student-five-layout">
              <section className="student-five-practice" aria-live="polite">
                <div className="student-breathing-panel-head">
                  <div>
                    <h2>{fiveHasFinished ? 'Complete' : activeFiveStage.title}</h2>
                    <p>
                      {fiveHasFinished
                        ? 'Take a moment before continuing your day.'
                        : activeFiveStage.subtitle}
                    </p>
                  </div>
                  <div className="student-breathing-cycle-pill">
                    {fiveHasFinished ? 'done' : `${activeFiveStage.step}/10`}
                  </div>
                </div>

                <div className="student-five-stage">
                  <svg className="student-five-hand" viewBox="0 0 320 320" role="img" aria-label="Open hand for five-finger breathing">
                    <path
                      className="student-five-hand-palm"
                      d="M90 226 C88 190, 86 164, 88 132 C89 117, 108 116, 111 131 L119 176 L120 58 C121 42, 143 42, 145 58 L150 164 L153 41 C154 24, 177 24, 179 41 L184 164 L194 65 C196 50, 217 52, 218 67 L220 171 L246 104 C252 89, 273 96, 268 113 L244 192 C239 209, 248 220, 250 238 C253 270, 226 292, 177 292 L140 292 C111 292, 94 268, 90 226 Z"
                    />
                    <path
                      className="student-five-hand-line"
                      d="M116 210 C132 202, 152 202, 171 210"
                    />
                    <path
                      className="student-five-hand-line"
                      d="M128 238 C145 248, 169 249, 188 239"
                    />
                    {fiveFingerPaths.map((finger) => (
                      <path
                        key={finger.finger}
                        className="student-five-trace-line"
                        d={`M ${finger.up.start.x} ${finger.up.start.y} L ${finger.up.end.x} ${finger.up.end.y} L ${finger.down.end.x} ${finger.down.end.y}`}
                      />
                    ))}
                    {!fiveHasFinished && (
                      <Motion.circle
                        cx={fivePointerPoint.x}
                        cy={fivePointerPoint.y}
                        r="9"
                        className="student-five-pointer"
                      />
                    )}
                  </svg>

                  <div className="student-five-subtitles">
                    <Motion.div
                      key={fiveHasFinished ? 'finished' : activeFiveStage.key}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.32 }}
                    >
                      <p>{fiveHasFinished ? 'Take a moment before continuing your day.' : activeFiveStage.title}</p>
                      {!fiveHasFinished && <strong>{fiveCountdown}</strong>}
                    </Motion.div>
                  </div>
                </div>

                <div className="student-breathing-progress" aria-hidden="true">
                  <div style={{ width: `${fiveTotalProgress * 100}%` }} />
                </div>

                <div className="student-breathing-controls">
                  <button
                    type="button"
                    onClick={handleFiveStart}
                    className="student-btn student-btn-primary"
                    disabled={fiveIsActive}
                  >
                    <PlayIcon className="w-5 h-5" />
                    Start
                  </button>
                  <button
                    type="button"
                    onClick={handleFivePause}
                    className="student-btn student-btn-warning"
                    disabled={!fiveIsActive}
                  >
                    <PauseIcon className="w-5 h-5" />
                    Pause
                  </button>
                  <button
                    type="button"
                    onClick={handleFiveRestart}
                    className="student-btn student-btn-secondary"
                  >
                    <RotateCcwIcon className="w-5 h-5" />
                    Restart
                  </button>
                  <button
                    type="button"
                    onClick={toggleFiveMute}
                    className="student-btn student-btn-secondary"
                    aria-pressed={!fiveMuted}
                  >
                    {fiveMuted ? (
                      <VolumeXIcon className="w-5 h-5" />
                    ) : (
                      <Volume2Icon className="w-5 h-5" />
                    )}
                    {fiveMuted ? 'Voice Off' : 'Voice On'}
                  </button>
                </div>
              </section>

              <aside className="student-five-side">
                <section className="student-breathing-panel">
                  <div className="student-breathing-panel-head">
                    <div>
                      <h2>How to Follow</h2>
                      <p>Use the pointer as a quiet tracing guide.</p>
                    </div>
                  </div>
                  <div className="student-breathing-step-list">
                    <div className="student-breathing-step-card">
                      <span>Up</span>
                      <div>
                        <h3>Breathe in slowly.</h3>
                        <p>The pointer moves upward along a finger.</p>
                      </div>
                    </div>
                    <div className="student-breathing-step-card">
                      <span>Down</span>
                      <div>
                        <h3>Breathe out slowly.</h3>
                        <p>The pointer moves downward along the next side.</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="student-breathing-panel student-five-note">
                  <h2>Ending</h2>
                  <p>Take a moment before continuing your day.</p>
                </section>
              </aside>
            </div>
          )}

          <EmergencySOS />
        </div>
      </main>
    </div>
  );
};

export default BreathingExercise;
