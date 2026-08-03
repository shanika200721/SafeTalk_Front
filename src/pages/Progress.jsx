import React, { useEffect, useState } from 'react';
import { BookOpenIcon, MedalIcon, MoonIcon, PenLineIcon, TrendingUpIcon, WindIcon } from 'lucide-react';
import wellnessService from '../services/wellnessService';
import { WellnessCard, WellnessLayout } from '../components/wellness/WellnessLayout';

const Progress = () => {
  const [progress, setProgress] = useState({ weekly_activity: [], monthly_activity: [], achievements: [] });

  useEffect(() => {
    wellnessService.getProgress()
      .then((data) => setProgress(data))
      .catch(() => setProgress({
        weekly_activity: JSON.parse(localStorage.getItem('wellness_weekly_progress') || '[]'),
        monthly_activity: [],
        achievements: ['Start with one small wellness activity when ready.'],
      }));
  }, []);

  const totals = progress.monthly_activity.reduce((acc, event) => {
    acc[event.activity_type] = (acc[event.activity_type] || 0) + 1;
    return acc;
  }, {});

  return (
    <WellnessLayout
      title="Progress"
      eyebrow="Supportive Tracking"
      description="A gentle view of weekly and monthly activity. This tracks wellbeing actions, not mental illness scores."
      action={<TrendingUpIcon className="w-8 h-8" />}
    >
      <section className="wellness-card-grid wellness-card-grid-4">
        <WellnessCard icon={WindIcon} title="Breathing sessions" subtitle="This month"><strong className="wellness-card-value">{totals.breathing || 0}</strong></WellnessCard>
        <WellnessCard icon={MoonIcon} title="Meditation" subtitle="This month"><strong className="wellness-card-value">{totals.meditation || 0}</strong></WellnessCard>
        <WellnessCard icon={BookOpenIcon} title="Resources viewed" subtitle="This month"><strong className="wellness-card-value">{totals.resource || 0}</strong></WellnessCard>
        <WellnessCard icon={PenLineIcon} title="Journal entries" subtitle="Private reflections"><strong className="wellness-card-value">{totals.journal || 0}</strong></WellnessCard>
      </section>

      <section className="progress-layout">
        <div className="wellness-panel">
          <p className="wellness-eyebrow">Weekly Activity</p>
          <h2>This Week</h2>
          <div className="progress-event-list">
            {progress.weekly_activity.map((event) => (
              <div key={event.id || `${event.activity_type}-${event.created_at}`} className="progress-event">
                <span>{event.activity_type}</span>
                <strong>{event.item_id}</strong>
                <time>{event.created_at ? new Date(event.created_at).toLocaleDateString() : 'Today'}</time>
              </div>
            ))}
            {!progress.weekly_activity.length && <p className="wellness-empty">No tracked activities this week yet.</p>}
          </div>
        </div>

        <div className="wellness-panel">
          <p className="wellness-eyebrow">Achievements</p>
          <h2>Supportive Notes</h2>
          <div className="achievement-list">
            {(progress.achievements?.length ? progress.achievements : ['One small activity is a good place to begin.']).map((achievement) => (
              <div key={achievement} className="achievement-item">
                <MedalIcon className="w-5 h-5" />
                <span>{achievement}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </WellnessLayout>
  );
};

export default Progress;
