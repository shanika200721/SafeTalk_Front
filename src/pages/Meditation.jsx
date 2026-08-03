import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2Icon, HeartIcon, MoonIcon, PauseIcon, PlayIcon, RotateCcwIcon } from 'lucide-react';
import wellnessService from '../services/wellnessService';
import { meditationTracks } from '../data/wellnessContent';
import { WellnessCard, WellnessLayout, WellnessToolbar } from '../components/wellness/WellnessLayout';

const categories = ['2 min', '5 min', '10 min', '15 min', 'Morning', 'Exam', 'Sleep', 'Relax'];

const minutesFromDuration = (duration) => Number.parseInt(duration, 10) || 2;

const Meditation = () => {
  const [tracks, setTracks] = useState(meditationTracks);
  const [category, setCategory] = useState('');
  const [activeId, setActiveId] = useState('med-2-ground');
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    wellnessService.getMeditation()
      .then((data) => setTracks(data.items || meditationTracks))
      .catch(() => setTracks(meditationTracks));
  }, []);

  const filtered = useMemo(() => tracks.filter((track) => !category || track.category === category || track.duration === category), [category, tracks]);
  const active = tracks.find((track) => track.id === activeId) || tracks[0] || meditationTracks[0];
  const total = minutesFromDuration(active.duration) * 60;

  useEffect(() => {
    if (!running) return undefined;
    const id = window.setInterval(() => {
      setElapsed((current) => {
        const next = current + 1;
        if (next >= total) {
          window.clearInterval(id);
          setRunning(false);
          wellnessService.completeMeditation(active.id, true).catch(() => {});
          wellnessService.trackProgress({ activity_type: 'meditation', item_id: active.id, minutes: minutesFromDuration(active.duration), completed: true }).catch(() => {});
          setTracks((items) => items.map((item) => item.id === active.id ? { ...item, completed: true } : item));
          return total;
        }
        return next;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [active.duration, active.id, running, total]);

  const toggleFavorite = (track) => {
    const favorite = !track.favorite;
    setTracks((items) => items.map((item) => item.id === track.id ? { ...item, favorite } : item));
    wellnessService.favoriteMeditation(track.id, favorite).catch(() => {});
  };

  const restart = () => {
    setElapsed(0);
    setRunning(false);
  };

  return (
    <WellnessLayout
      title="Guided Meditation"
      eyebrow="Quiet Practice"
      description="Choose short meditation practices for mornings, exams, sleep, relaxation, or brief reset moments."
      action={<MoonIcon className="w-8 h-8" />}
    >
      <WellnessToolbar category={category} onCategory={setCategory} categories={categories} />

      <section className="meditation-player wellness-panel">
        <div className="meditation-animation" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div>
          <p className="wellness-eyebrow">{active.duration}</p>
          <h2>{active.title}</h2>
          <p>{active.description}</p>
          <div className="wellness-progress-line">
            <div style={{ width: `${Math.min(100, (elapsed / total) * 100)}%` }} />
          </div>
          <p>{Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')} / {Math.floor(total / 60)}:00</p>
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
          </div>
        </div>
      </section>

      <section className="wellness-card-grid wellness-card-grid-3">
        {filtered.map((track) => (
          <article
            key={track.id}
            className={`wellness-card-button ${active.id === track.id ? 'wellness-card-button-active' : ''}`}
          >
            <WellnessCard icon={MoonIcon} title={track.title} subtitle={track.description} meta={track.duration}>
              <div className="wellness-card-actions">
                <button type="button" className="student-btn student-btn-secondary" onClick={() => { setActiveId(track.id); restart(); }}>
                  Select
                </button>
                <button type="button" className="wellness-icon-action" onClick={(event) => { event.stopPropagation(); toggleFavorite(track); }} aria-label={`Favorite ${track.title}`} aria-pressed={Boolean(track.favorite)}>
                  <HeartIcon className="w-5 h-5" fill={track.favorite ? 'currentColor' : 'none'} />
                </button>
                <span className="wellness-icon-action" aria-label={track.completed ? 'Completed' : 'Not completed'}>
                  <CheckCircle2Icon className="w-5 h-5" fill={track.completed ? 'currentColor' : 'none'} />
                </span>
              </div>
            </WellnessCard>
          </article>
        ))}
      </section>
    </WellnessLayout>
  );
};

export default Meditation;
