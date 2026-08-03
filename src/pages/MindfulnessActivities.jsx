import React, { useState } from 'react';
import { HeartIcon, SparklesIcon } from 'lucide-react';
import wellnessService from '../services/wellnessService';
import { mindfulnessActivities } from '../data/wellnessContent';
import { WellnessCard, WellnessLayout } from '../components/wellness/WellnessLayout';

const MindfulnessActivities = () => {
  const [active, setActive] = useState(mindfulnessActivities[0]);
  const [step, setStep] = useState(0);

  const nextStep = () => {
    if (step >= active.prompts.length - 1) {
      wellnessService.trackProgress({ activity_type: 'mindfulness', item_id: active.id, minutes: 3, completed: true }).catch(() => {});
      return;
    }
    setStep((current) => current + 1);
  };

  return (
    <WellnessLayout
      title="Mindfulness Activities"
      eyebrow="Simple Activities"
      description="Short reflection activities with no competitive scoring, streak pressure, or failure states."
      action={<SparklesIcon className="w-8 h-8" />}
    >
      <section className="wellness-card-grid wellness-card-grid-3">
        {mindfulnessActivities.map((activity) => (
          <WellnessCard key={activity.id} icon={HeartIcon} title={activity.title} subtitle={activity.category} className={active.id === activity.id ? 'wellness-card-selected' : ''}>
            <button type="button" className="student-btn student-btn-secondary" onClick={() => { setActive(activity); setStep(0); }}>Open</button>
          </WellnessCard>
        ))}
      </section>

      <section className="wellness-panel mindfulness-player">
        <p className="wellness-eyebrow">{active.category}</p>
        <h2>{active.title}</h2>
        <div className="mindfulness-prompt" aria-live="polite">
          <span>{step + 1} of {active.prompts.length}</span>
          <p>{active.prompts[step]}</p>
        </div>
        <div className="wellness-control-row">
          <button type="button" className="student-btn student-btn-secondary" onClick={() => setStep((current) => Math.max(0, current - 1))}>Back</button>
          <button type="button" className="student-btn student-btn-primary" onClick={nextStep}>
            {step >= active.prompts.length - 1 ? 'Complete' : 'Next'}
          </button>
        </div>
      </section>
    </WellnessLayout>
  );
};

export default MindfulnessActivities;
