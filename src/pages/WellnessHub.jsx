import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpenIcon,
  FilmIcon,
  HeartIcon,
  MoonIcon,
  MusicIcon,
  PenLineIcon,
  SettingsIcon,
  TrendingUpIcon,
  WindIcon,
} from 'lucide-react';
import wellnessService from '../services/wellnessService';
import { wellnessCategories } from '../data/wellnessContent';
import { CameraReadyPanel, WellnessCard, WellnessLayout } from '../components/wellness/WellnessLayout';

const destinations = [
  { to: '/breathing', title: 'Breathing Center', icon: WindIcon, description: 'Follow short guided breathing patterns.' },
  { to: '/meditation', title: 'Guided Meditation', icon: MoonIcon, description: 'Choose 2, 5, 10, or 15 minute practices.' },
  { to: '/ambient-sounds', title: 'Ambient Sounds', icon: MusicIcon, description: 'Use gentle sounds with volume, loop, and timer controls.' },
  { to: '/video-library', title: 'Video Library', icon: FilmIcon, description: 'Browse approved videos with no autoplay.' },
  { to: '/journal', title: 'Private Journal', icon: PenLineIcon, description: 'Write privately unless you explicitly choose to share.' },
  { to: '/resources', title: 'Resource Library', icon: BookOpenIcon, description: 'Search articles, exercises, contacts, and guidance.' },
  { to: '/progress', title: 'Progress', icon: TrendingUpIcon, description: 'See supportive weekly and monthly activity.' },
  { to: '/preferences', title: 'Preferences', icon: SettingsIcon, description: 'Adjust theme, text size, reminders, and language readiness.' },
];

const WellnessHub = () => {
  const [categories, setCategories] = useState(wellnessCategories);

  useEffect(() => {
    wellnessService.getWellness()
      .then((data) => setCategories(data.categories || wellnessCategories))
      .catch(() => setCategories(wellnessCategories));
  }, []);

  return (
    <WellnessLayout
      title="Wellness Hub"
      eyebrow="Student Space"
      description="A supportive place for breathing, reflection, study recovery, sleep, and campus support."
      action={<HeartIcon className="w-8 h-8" />}
    >
      <section className="wellness-category-strip" aria-label="Wellness categories">
        {categories.map((category) => (
          <span key={category}>{category}</span>
        ))}
      </section>

      <section className="wellness-card-grid wellness-card-grid-4">
        {destinations.map((item) => (
          <Link key={item.to} to={item.to} className="wellness-card-link">
            <WellnessCard icon={item.icon} title={item.title} subtitle={item.description} />
          </Link>
        ))}
      </section>

      <CameraReadyPanel />
    </WellnessLayout>
  );
};

export default WellnessHub;
