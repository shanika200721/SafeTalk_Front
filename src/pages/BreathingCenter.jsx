import React, { useEffect, useMemo, useRef, useState } from 'react';
import { PauseIcon, PlayIcon, RotateCcwIcon, Volume2Icon, VolumeXIcon, WindIcon } from 'lucide-react';
import wellnessService from '../services/wellnessService';
import { breathingTechniques } from '../data/wellnessContent';
import { WellnessLayout } from '../components/wellness/WellnessLayout';

const labelsFor = (technique) => technique.labels || ['Inhale', 'Hold', 'Exhale', 'Pause'];

const BreathingCenter = () => {
  const [techniques, setTechniques] = useState(breathingTechniques);
  const [activeId, setActiveId] = useState('box');
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [narration, setNarration] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    wellnessService.getBreathing()
      .then((data) => {
        const apiItems = data.items || [];
        setTechniques(breathingTechniques.map((item) => ({ ...item, ...(apiItems.find((apiItem) => apiItem.id === item.id) || {}) })));
      })
      .catch(() => setTechniques(breathingTechniques));
  }, []);

  const active = useMemo(() => techniques.find((item) => item.id === activeId) || breathingTechniques[0], [activeId, techniques]);
  const pattern = useMemo(() => active.pattern.filter((seconds) => seconds > 0), [active.pattern]);
  const labels = useMemo(() => labelsFor(active).filter((_, index) => active.pattern[index] > 0), [active]);
  const cycleSeconds = pattern.reduce((sum, value) => sum + value, 0);
  const totalSeconds = active.duration_minutes * 60;
  const cycleElapsed = elapsed % cycleSeconds;

  const stage = (() => {
    let cursor = 0;
    for (let index = 0; index < pattern.length; index += 1) {
      const next = cursor + pattern[index];
      if (cycleElapsed < next) {
        return {
          index,
          label: labels[index],
          seconds: pattern[index],
          remaining: Math.max(1, next - cycleElapsed),
          progress: (cycleElapsed - cursor) / pattern[index],
        };
      }
      cursor = next;
    }
    return { index: 0, label: labels[0], seconds: pattern[0], remaining: pattern[0], progress: 0 };
  })();

  useEffect(() => {
    if (!running) {
      window.clearInterval(intervalRef.current);
      return undefined;
    }
    intervalRef.current = window.setInterval(() => {
      setElapsed((current) => {
        const next = current + 1;
        if (next >= totalSeconds) {
          window.clearInterval(intervalRef.current);
          setRunning(false);
          wellnessService.recordBreathing({ activity_type: 'breathing', item_id: active.id, minutes: active.duration_minutes, completed: true }).catch(() => {});
          return totalSeconds;
        }
        return next;
      });
    }, 1000);
    return () => window.clearInterval(intervalRef.current);
  }, [active.duration_minutes, active.id, running, totalSeconds]);

  useEffect(() => {
    if (!running || !narration || !('speechSynthesis' in window)) return undefined;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(stage.label);
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
    return () => window.speechSynthesis.cancel();
  }, [narration, running, stage.label]);

  const restart = () => {
    setRunning(false);
    setElapsed(0);
    window.speechSynthesis?.cancel();
  };

  return (
    <WellnessLayout
      title="Breathing Center"
      eyebrow="Guided Breathing"
      description="Choose a breathing rhythm with visual pacing, optional narration, pause, resume, restart, and completion tracking."
      action={<WindIcon className="w-8 h-8" />}
    >
      <section className="breathing-technique-grid" role="tablist" aria-label="Breathing techniques">
        {techniques.map((technique) => (
          <button
            type="button"
            key={technique.id}
            role="tab"
            aria-selected={activeId === technique.id}
            className={activeId === technique.id ? 'breathing-technique-active' : ''}
            onClick={() => {
              setActiveId(technique.id);
              restart();
            }}
          >
            <strong>{technique.title}</strong>
            <span>{technique.duration_minutes} min</span>
          </button>
        ))}
      </section>

      <section className="breathing-center-panel">
        <div className="breathing-visual-wrap" aria-live="polite">
          <div className={`breathing-orb breathing-stage-${stage.index}`} style={{ '--breath-progress': stage.progress }}>
            <span>{stage.label}</span>
            <strong>{stage.remaining}</strong>
          </div>
        </div>
        <div className="breathing-session-copy">
          <p className="wellness-eyebrow">{active.category}</p>
          <h2>{active.title}</h2>
          <p>{labels.map((label, index) => `${label} ${pattern[index]}s`).join(' | ')}</p>
          <div className="wellness-progress-line" aria-hidden="true">
            <div style={{ width: `${Math.min(100, (elapsed / totalSeconds) * 100)}%` }} />
          </div>
          <p>{Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')} / {active.duration_minutes}:00</p>
          <div className="wellness-control-row">
            <button type="button" className="student-btn student-btn-primary" onClick={() => setRunning(true)} disabled={running}>
              <PlayIcon className="w-4 h-4" />
              Start
            </button>
            <button type="button" className="student-btn student-btn-warning" onClick={() => setRunning(false)} disabled={!running}>
              <PauseIcon className="w-4 h-4" />
              Pause
            </button>
            <button type="button" className="student-btn student-btn-secondary" onClick={restart}>
              <RotateCcwIcon className="w-4 h-4" />
              Restart
            </button>
            <button type="button" className="student-btn student-btn-secondary" onClick={() => setNarration((current) => !current)} aria-pressed={narration}>
              {narration ? <Volume2Icon className="w-4 h-4" /> : <VolumeXIcon className="w-4 h-4" />}
              Narration
            </button>
          </div>
        </div>
      </section>
    </WellnessLayout>
  );
};

export default BreathingCenter;
