import React, { useEffect, useState } from 'react';
import { BellIcon, PaletteIcon, SettingsIcon } from 'lucide-react';
import wellnessService from '../services/wellnessService';
import { WellnessLayout } from '../components/wellness/WellnessLayout';

const defaultPreferences = {
  theme: 'system',
  accent_color: '#0f9f9a',
  language: 'en',
  notifications: {
    assessment_reminders: true,
    upcoming_follow_up: true,
    new_resources: true,
    breathing_reminder: false,
    meditation_reminder: false,
  },
  daily_reminder: { enabled: false, time: '18:00' },
  large_text: false,
  reduced_motion: false,
};

const Preferences = () => {
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    wellnessService.getPreferences()
      .then((data) => setPreferences({ ...defaultPreferences, ...data, notifications: { ...defaultPreferences.notifications, ...(data.notifications || {}) } }))
      .catch(() => setPreferences(JSON.parse(localStorage.getItem('wellness_preferences') || JSON.stringify(defaultPreferences))));
  }, []);

  useEffect(() => {
    document.documentElement.dataset.wellnessTheme = preferences.theme;
    document.documentElement.style.setProperty('--wellness-accent', preferences.accent_color);
    document.documentElement.classList.toggle('wellness-large-text', preferences.large_text);
    document.documentElement.classList.toggle('wellness-reduced-motion', preferences.reduced_motion);
    localStorage.setItem('wellness_preferences', JSON.stringify(preferences));
  }, [preferences]);

  const save = async () => {
    const updated = await wellnessService.updatePreferences(preferences).catch(() => preferences);
    setPreferences({ ...preferences, ...updated });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  const updateNotification = (key, value) => {
    setPreferences((current) => ({
      ...current,
      notifications: { ...current.notifications, [key]: value },
    }));
  };

  return (
    <WellnessLayout
      title="Preferences"
      eyebrow="Personalization"
      description="Adjust your student wellness space for theme, accent color, language readiness, reminders, text size, and motion preferences."
      action={<SettingsIcon className="w-8 h-8" />}
    >
      <section className="preferences-layout">
        <div className="wellness-panel preference-panel">
          <div className="wellness-section-head">
            <div>
              <p className="wellness-eyebrow">Theme</p>
              <h2>Appearance</h2>
            </div>
            <PaletteIcon className="w-6 h-6 text-teal-700" />
          </div>
          <label>
            Theme
            <select value={preferences.theme} onChange={(event) => setPreferences({ ...preferences, theme: event.target.value })}>
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
          <label>
            Accent color
            <input type="color" value={preferences.accent_color} onChange={(event) => setPreferences({ ...preferences, accent_color: event.target.value })} />
          </label>
          <label>
            Language
            <select value={preferences.language} onChange={(event) => setPreferences({ ...preferences, language: event.target.value })}>
              <option value="en">English</option>
              <option value="si">Sinhala ready</option>
              <option value="ta">Tamil ready</option>
            </select>
          </label>
          <label className="wellness-check">
            <input type="checkbox" checked={preferences.large_text} onChange={(event) => setPreferences({ ...preferences, large_text: event.target.checked })} />
            Large text
          </label>
          <label className="wellness-check">
            <input type="checkbox" checked={preferences.reduced_motion} onChange={(event) => setPreferences({ ...preferences, reduced_motion: event.target.checked })} />
            Reduced motion
          </label>
        </div>

        <div className="wellness-panel preference-panel">
          <div className="wellness-section-head">
            <div>
              <p className="wellness-eyebrow">In-app Only</p>
              <h2>Notifications</h2>
            </div>
            <BellIcon className="w-6 h-6 text-teal-700" />
          </div>
          {Object.entries(preferences.notifications).map(([key, value]) => (
            <label key={key} className="wellness-check">
              <input type="checkbox" checked={value} onChange={(event) => updateNotification(key, event.target.checked)} />
              {key.replaceAll('_', ' ')}
            </label>
          ))}
          <label className="wellness-check">
            <input
              type="checkbox"
              checked={preferences.daily_reminder.enabled}
              onChange={(event) => setPreferences({ ...preferences, daily_reminder: { ...preferences.daily_reminder, enabled: event.target.checked } })}
            />
            Daily reminder
          </label>
          <label>
            Reminder time
            <input
              type="time"
              value={preferences.daily_reminder.time}
              onChange={(event) => setPreferences({ ...preferences, daily_reminder: { ...preferences.daily_reminder, time: event.target.value } })}
            />
          </label>
        </div>
      </section>

      <button type="button" className="student-btn student-btn-primary preference-save" onClick={save}>
        {saved ? 'Saved' : 'Save Preferences'}
      </button>
    </WellnessLayout>
  );
};

export default Preferences;
