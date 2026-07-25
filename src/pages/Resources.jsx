import React, { useEffect, useMemo, useState } from 'react';
import { BookOpenIcon, DownloadIcon, HeartIcon, PhoneIcon } from 'lucide-react';
import wellnessService from '../services/wellnessService';
import { fallbackResources, wellnessCategories } from '../data/wellnessContent';
import { WellnessCard, WellnessLayout, WellnessToolbar } from '../components/wellness/WellnessLayout';

const resourceTypes = ['Articles', 'Videos', 'Exercises', 'Downloads', 'Campus resources', 'Emergency guidance', 'University contacts'];

const Resources = () => {
  const [resources, setResources] = useState(fallbackResources);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    wellnessService.getResources({ page_size: 50 })
      .then((data) => {
        setResources(data.items || fallbackResources);
        setRecentlyViewed(data.recently_viewed || []);
      })
      .catch(() => {
        setResources(fallbackResources);
        setRecentlyViewed(JSON.parse(localStorage.getItem('wellness_recent_resources') || '[]'));
      });
  }, []);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return resources.filter((item) => {
      const matchesSearch = !needle || [item.title, item.description, item.category, item.type].some((value) => value?.toLowerCase().includes(needle));
      const matchesCategory = !category || item.category === category;
      const matchesType = !type || item.type === type;
      return matchesSearch && matchesCategory && matchesType && item.approved !== false;
    });
  }, [category, resources, search, type]);

  const toggleFavorite = (resource) => {
    const favorite = !resource.favorite;
    setResources((items) => items.map((item) => item.id === resource.id ? { ...item, favorite } : item));
    wellnessService.favoriteResource(resource.id, favorite).catch(() => {});
  };

  const viewResource = (resource) => {
    const next = [resource.id, ...recentlyViewed.filter((id) => id !== resource.id)].slice(0, 8);
    setRecentlyViewed(next);
    localStorage.setItem('wellness_recent_resources', JSON.stringify(next));
    wellnessService.viewResource(resource.id).catch(() => {});
  };

  return (
    <WellnessLayout
      title="Resource Library"
      eyebrow="Approved Support"
      description="Search articles, videos, exercises, downloads, campus resources, emergency guidance, and university contacts."
      action={<BookOpenIcon className="w-8 h-8" />}
    >
      <WellnessToolbar search={search} onSearch={setSearch} category={category} onCategory={setCategory} categories={wellnessCategories}>
        <label className="wellness-select">
          <span className="sr-only">Resource type</span>
          <select value={type} onChange={(event) => setType(event.target.value)}>
            <option value="">All types</option>
            {resourceTypes.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
      </WellnessToolbar>

      <section className="wellness-panel">
        <div className="wellness-section-head">
          <div>
            <p className="wellness-eyebrow">Recently Viewed</p>
            <h2>Your Resource Trail</h2>
          </div>
        </div>
        <div className="wellness-chip-row">
          {recentlyViewed.length ? recentlyViewed.map((id) => <span key={id}>{id.replaceAll('-', ' ')}</span>) : <span>No recently viewed resources yet</span>}
        </div>
      </section>

      <section className="wellness-card-grid wellness-card-grid-3">
        {filtered.map((resource) => (
          <WellnessCard key={resource.id} icon={resource.type === 'Emergency guidance' ? PhoneIcon : BookOpenIcon} title={resource.title} subtitle={resource.description} meta={resource.type}>
            <div className="wellness-card-actions">
              <button type="button" className="student-btn student-btn-primary" onClick={() => viewResource(resource)}>
                {resource.type === 'Downloads' ? <DownloadIcon className="w-4 h-4" /> : <BookOpenIcon className="w-4 h-4" />}
                Open
              </button>
              {resource.phone && <a className="student-btn student-btn-secondary" href={`tel:${resource.phone}`}>{resource.phone}</a>}
              <button type="button" className="wellness-icon-action" onClick={() => toggleFavorite(resource)} aria-label={`Favorite ${resource.title}`} aria-pressed={Boolean(resource.favorite)}>
                <HeartIcon className="w-5 h-5" fill={resource.favorite ? 'currentColor' : 'none'} />
              </button>
            </div>
          </WellnessCard>
        ))}
      </section>

      {!filtered.length && <p className="wellness-empty">No matching approved resources.</p>}
    </WellnessLayout>
  );
};

export default Resources;
