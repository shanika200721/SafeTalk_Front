import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2Icon, HeartIcon, PlayIcon } from 'lucide-react';
import wellnessService from '../services/wellnessService';
import { fallbackVideos, wellnessCategories } from '../data/wellnessContent';
import { WellnessLayout, WellnessToolbar } from '../components/wellness/WellnessLayout';

const PAGE_SIZE = 3;

const VideoLibrary = () => {
  const [videos, setVideos] = useState(fallbackVideos);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [watching, setWatching] = useState(null);

  useEffect(() => {
    wellnessService.getVideos({ page: 1, page_size: 50 })
      .then((data) => setVideos(data.items || fallbackVideos))
      .catch(() => setVideos(fallbackVideos));
  }, []);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return videos.filter((video) => {
      const matchesCategory = !category || video.category === category;
      const matchesSearch = !needle || [video.title, video.description, video.category, video.provider].some((value) => value?.toLowerCase().includes(needle));
      return video.approved !== false && matchesCategory && matchesSearch;
    });
  }, [category, search, videos]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleFavorite = async (video) => {
    const favorite = !video.favorite;
    setVideos((items) => items.map((item) => item.id === video.id ? { ...item, favorite } : item));
    wellnessService.favoriteVideo(video.id, favorite).catch(() => {});
  };

  const markComplete = async (video) => {
    const completed = !video.completed;
    setVideos((items) => items.map((item) => item.id === video.id ? { ...item, completed } : item));
    wellnessService.completeVideo(video.id, completed).catch(() => {});
  };

  return (
    <WellnessLayout
      title="Video Library"
      eyebrow="Approved Resources"
      description="Curated wellness videos for study breaks, sleep, mindfulness, and exam preparation. Videos never autoplay."
      action={<PlayIcon className="w-8 h-8" />}
    >
      <WellnessToolbar
        search={search}
        onSearch={(value) => {
          setSearch(value);
          setPage(1);
        }}
        category={category}
        onCategory={(value) => {
          setCategory(value);
          setPage(1);
        }}
        categories={wellnessCategories}
      />

      {watching && (
        <section className="wellness-panel video-watch-panel" aria-label={`Watching ${watching.title}`}>
          <div className="wellness-section-head">
            <div>
              <p className="wellness-eyebrow">{watching.provider}</p>
              <h2>{watching.title}</h2>
            </div>
            <button type="button" className="student-btn student-btn-secondary" onClick={() => setWatching(null)}>Close</button>
          </div>
          <iframe
            title={watching.title}
            src={watching.url}
            loading="lazy"
            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </section>
      )}

      <section className="video-card-grid">
        {visible.map((video) => (
          <article key={video.id} className="video-card">
            <img src={video.thumbnail} alt="" loading="lazy" />
            <div className="video-card-body">
              <div className="video-meta-row">
                <span>{video.category}</span>
                <span>{video.duration}</span>
              </div>
              <h3>{video.title}</h3>
              <p>{video.description}</p>
              <p className="video-provider">{video.provider}</p>
              <div className="video-actions">
                <button type="button" className="student-btn student-btn-primary" onClick={() => setWatching(video)}>
                  <PlayIcon className="w-4 h-4" />
                  Watch
                </button>
                <button type="button" className="wellness-icon-action" onClick={() => toggleFavorite(video)} aria-pressed={Boolean(video.favorite)} aria-label={`Favorite ${video.title}`}>
                  <HeartIcon className="w-5 h-5" fill={video.favorite ? 'currentColor' : 'none'} />
                </button>
                <button type="button" className="wellness-icon-action" onClick={() => markComplete(video)} aria-pressed={Boolean(video.completed)} aria-label={`Mark ${video.title} completed`}>
                  <CheckCircle2Icon className="w-5 h-5" fill={video.completed ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>

      <nav className="wellness-pagination" aria-label="Video pages">
        <button type="button" className="student-btn student-btn-secondary" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</button>
        <span>Page {page} of {pages}</span>
        <button type="button" className="student-btn student-btn-secondary" disabled={page === pages} onClick={() => setPage((current) => Math.min(pages, current + 1))}>Next</button>
      </nav>
    </WellnessLayout>
  );
};

export default VideoLibrary;
