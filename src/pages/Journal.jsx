import React, { useEffect, useMemo, useState } from 'react';
import { DownloadIcon, LockIcon, PenLineIcon, SearchIcon } from 'lucide-react';
import wellnessService from '../services/wellnessService';
import { WellnessLayout } from '../components/wellness/WellnessLayout';

const Journal = () => {
  const [entries, setEntries] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    entry_date: new Date().toISOString().slice(0, 10),
    mood: 'steady',
    tags: '',
    content: '',
    share_with_counselor: false,
    ai_analysis_opt_in: false,
  });

  useEffect(() => {
    wellnessService.getJournal()
      .then((data) => setEntries(data.items || []))
      .catch(() => setEntries(JSON.parse(localStorage.getItem('wellness_journal_entries') || '[]')));
  }, []);

  useEffect(() => {
    localStorage.setItem('wellness_journal_entries', JSON.stringify(entries));
  }, [entries]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return entries;
    return entries.filter((entry) =>
      [entry.content, entry.mood, ...(entry.tags || [])].some((value) => String(value || '').toLowerCase().includes(needle))
    );
  }, [entries, search]);

  const saveEntry = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
    };
    try {
      const saved = await wellnessService.createJournal(payload);
      setEntries((items) => [saved, ...items]);
    } catch {
      setEntries((items) => [{ id: Date.now(), ...payload, privacy: payload.share_with_counselor ? 'student_shared' : 'private', created_at: new Date().toISOString() }, ...items]);
    }
    setForm((current) => ({ ...current, content: '', tags: '', share_with_counselor: false, ai_analysis_opt_in: false }));
  };

  const exportEntries = async () => {
    const payload = await wellnessService.exportJournal().catch(() => ({ items: entries }));
    const blob = new Blob([JSON.stringify(payload.items || entries, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'wellness-journal.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <WellnessLayout
      title="Private Journal"
      eyebrow="Private by Default"
      description="Daily entries stay private and are not shared with a counselor unless you explicitly choose to share a specific entry."
      action={<LockIcon className="w-8 h-8" />}
    >
      <section className="wellness-panel journal-privacy-panel">
        <LockIcon className="w-5 h-5" />
        <span>Journal entries are private by default, are not monitored continuously, and are not visible to counselors unless you explicitly share an entry.</span>
      </section>

      <section className="journal-layout">
        <form className="wellness-panel journal-editor" onSubmit={saveEntry}>
          <div className="wellness-section-head">
            <div>
              <p className="wellness-eyebrow">Daily Entry</p>
              <h2>Write a Reflection</h2>
            </div>
            <PenLineIcon className="w-6 h-6 text-teal-700" />
          </div>
          <label>
            Date
            <input type="date" value={form.entry_date} onChange={(event) => setForm({ ...form, entry_date: event.target.value })} />
          </label>
          <label>
            Mood
            <select value={form.mood} onChange={(event) => setForm({ ...form, mood: event.target.value })}>
              <option value="steady">Steady</option>
              <option value="tired">Tired</option>
              <option value="tense">Tense</option>
              <option value="hopeful">Hopeful</option>
              <option value="overwhelmed">Overwhelmed</option>
            </select>
          </label>
          <label>
            Tags
            <input type="text" value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} placeholder="study, sleep, family" />
          </label>
          <label>
            Entry
            <textarea value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} required placeholder="Write what feels useful to capture today..." />
          </label>
          <label className="wellness-check">
            <input type="checkbox" checked={form.share_with_counselor} onChange={(event) => setForm({ ...form, share_with_counselor: event.target.checked })} />
            Share this entry with counselor
          </label>
          <label className="wellness-check">
            <input type="checkbox" checked={form.ai_analysis_opt_in} onChange={(event) => setForm({ ...form, ai_analysis_opt_in: event.target.checked })} />
            Use this entry as optional wellbeing-screening evidence
          </label>
          <p className="wellness-muted">
            AI analysis and counselor sharing are separate choices. Journal entries are not monitored continuously.
          </p>
          <button type="submit" className="student-btn student-btn-primary">Save Entry</button>
        </form>

        <section className="wellness-panel journal-list-panel">
          <div className="wellness-section-head">
            <div>
              <p className="wellness-eyebrow">Calendar</p>
              <h2>Entries</h2>
            </div>
            <button type="button" className="student-btn student-btn-secondary" onClick={exportEntries}>
              <DownloadIcon className="w-4 h-4" />
              Export
            </button>
          </div>
          <label className="wellness-search">
            <SearchIcon className="w-4 h-4" />
            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search entries or tags..." />
          </label>
          <div className="journal-entry-list">
            {filtered.map((entry) => (
              <article key={entry.id} className="journal-entry-card">
                <div>
                  <strong>{entry.entry_date}</strong>
                  <span>{entry.mood}</span>
                </div>
                <p>{entry.content || entry.content_preview}</p>
                <div className="journal-tags">
                  {(entry.tags || []).map((tag) => <span key={tag}>{tag}</span>)}
                  <span>{entry.share_with_counselor ? 'Shared by choice' : 'Private'}</span>
                  <span>{entry.ai_analysis_opt_in ? `AI analysis: ${entry.analysis_status || 'pending'}` : 'No AI analysis'}</span>
                </div>
              </article>
            ))}
            {!filtered.length && <p className="wellness-empty">No journal entries yet.</p>}
          </div>
        </section>
      </section>
    </WellnessLayout>
  );
};

export default Journal;
