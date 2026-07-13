import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  BookOpenIcon,
  BuildingIcon,
  HeartIcon,
  MessageSquareIcon,
  PhoneIcon,
  SearchIcon,
  ShieldCheckIcon,
} from 'lucide-react';
import { Sidebar } from '../components/layout/Sidebar';
import { EmergencySOS } from '../components/common/EmergencySOS';

const crisisHotlines = [
  {
    name: '1333 Crisis Support Line',
    description: '24/7 toll-free and confidential, anonymous support by phone.',
    phone: '1333',
    website: 'https://1333.lk',
    icon: PhoneIcon,
  },
];

const articles = [
  { title: 'Managing Exam Stress', category: 'Academic', color: 'blue' },
  { title: 'Building Healthy Sleep Habits', category: 'Wellness', color: 'green' },
  { title: 'Mindfulness for Beginners', category: 'Mental Health', color: 'purple' },
  { title: 'Coping with Anxiety', category: 'Mental Health', color: 'purple' },
  { title: 'Social Connection Tips', category: 'Wellness', color: 'green' },
  { title: 'Time Management Strategies', category: 'Academic', color: 'blue' },
];

const campusResources = [
  {
    name: 'University Counseling Center',
    description: 'Free counseling services for students',
    hours: 'Mon-Fri, 9AM-5PM',
    phone: '(555) 123-4567',
    location: 'Student Services Building, Room 200',
  },
  {
    name: 'Student Health Services',
    description: 'Medical and mental health support',
    hours: 'Mon-Fri, 8AM-6PM',
    phone: '(555) 123-4568',
    location: 'Health Center, Main Campus',
  },
];

const copingStrategies = [
  { title: 'Deep Breathing', description: 'Practice 4-7-8 breathing technique' },
  { title: 'Physical Activity', description: 'Go for a walk or do light exercise' },
  { title: 'Journaling', description: 'Write down your thoughts and feelings' },
  { title: 'Social Support', description: 'Reach out to friends or family' },
  { title: 'Mindfulness', description: 'Try meditation or grounding exercises' },
  { title: 'Creative Expression', description: 'Engage in art, music, or writing' },
];

const categoryClassMap = {
  blue: 'student-resource-chip-blue',
  green: 'student-resource-chip-green',
  purple: 'student-resource-chip-purple',
};

const Resources = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredArticles = useMemo(() => {
    if (!normalizedQuery) return articles;
    return articles.filter(
      (article) =>
        article.title.toLowerCase().includes(normalizedQuery) ||
        article.category.toLowerCase().includes(normalizedQuery)
    );
  }, [normalizedQuery]);

  const filteredStrategies = useMemo(() => {
    if (!normalizedQuery) return copingStrategies;
    return copingStrategies.filter(
      (strategy) =>
        strategy.title.toLowerCase().includes(normalizedQuery) ||
        strategy.description.toLowerCase().includes(normalizedQuery)
    );
  }, [normalizedQuery]);

  const filteredCampusResources = useMemo(() => {
    if (!normalizedQuery) return campusResources;
    return campusResources.filter(
      (resource) =>
        resource.name.toLowerCase().includes(normalizedQuery) ||
        resource.description.toLowerCase().includes(normalizedQuery) ||
        resource.location.toLowerCase().includes(normalizedQuery)
    );
  }, [normalizedQuery]);

  const filteredHotlines = useMemo(() => {
    if (!normalizedQuery) return crisisHotlines;
    return crisisHotlines.filter(
      (hotline) =>
        hotline.name.toLowerCase().includes(normalizedQuery) ||
        hotline.description.toLowerCase().includes(normalizedQuery) ||
        hotline.phone.includes(normalizedQuery)
    );
  }, [normalizedQuery]);

  const totalResults =
    filteredHotlines.length +
    filteredArticles.length +
    filteredCampusResources.length +
    filteredStrategies.length;

  return (
    <div className="student-shell">
      <Sidebar />
      <main className="student-main">
        <div className="student-page student-resources-page">
          <Link to="/dashboard" className="student-top-link">
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>

          <section className="student-resources-hero">
            <div>
              <p className="student-resources-eyebrow">Support Library</p>
              <h1>Resources</h1>
              <p>
                Find crisis support, campus services, self-help articles, and
                practical coping strategies in one organized place.
              </p>
            </div>
            <div className="student-resources-hero-card">
              <ShieldCheckIcon className="w-7 h-7" />
              <span>Confidential support options</span>
            </div>
          </section>

          <section className="student-resources-search-panel">
            <div className="student-resource-search">
              <SearchIcon className="student-resource-search-icon" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search resources, topics, or services..."
                className="student-search-input"
              />
            </div>
            <p className="student-resources-search-count">
              {normalizedQuery ? `${totalResults} matching resources` : 'Browse all resources'}
            </p>
          </section>

          <div className="student-resources-overview-grid">
            <a href="#crisis-support" className="student-resources-overview-card">
              <PhoneIcon className="w-5 h-5" />
              <span>Crisis Support</span>
            </a>
            <a href="#self-help" className="student-resources-overview-card">
              <BookOpenIcon className="w-5 h-5" />
              <span>Self-Help</span>
            </a>
            <a href="#campus-support" className="student-resources-overview-card">
              <BuildingIcon className="w-5 h-5" />
              <span>Campus Support</span>
            </a>
            <a href="#coping-tools" className="student-resources-overview-card">
              <HeartIcon className="w-5 h-5" />
              <span>Coping Tools</span>
            </a>
          </div>

          <section id="crisis-support" className="student-resources-section">
            <div className="student-resources-section-head">
              <span className="student-resources-section-icon student-resources-section-icon-red">
                <PhoneIcon className="w-5 h-5" />
              </span>
              <div>
                <h2>Crisis Support</h2>
                <p>Immediate emotional support options.</p>
              </div>
            </div>
            <div className="student-resource-grid">
              {filteredHotlines.map((hotline) => {
                const Icon = hotline.icon;
                return (
                  <article key={hotline.name} className="student-resource-card student-hotline-card">
                    <div className="student-hotline-icon">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3>{hotline.name}</h3>
                      <p>{hotline.description}</p>
                      <div className="student-resource-actions">
                        <a href={`tel:${hotline.phone}`} className="student-phone-pill">
                          <PhoneIcon className="w-4 h-4" />
                          {hotline.phone}
                        </a>
                        <a
                          href={hotline.website}
                          target="_blank"
                          rel="noreferrer"
                          className="student-resource-link"
                        >
                          Visit website
                        </a>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section id="self-help" className="student-resources-section">
            <div className="student-resources-section-head">
              <span className="student-resources-section-icon student-resources-section-icon-blue">
                <BookOpenIcon className="w-5 h-5" />
              </span>
              <div>
                <h2>Self-Help Articles</h2>
                <p>Short topics for everyday student well-being.</p>
              </div>
            </div>
            <div className="student-article-grid">
              {filteredArticles.map((article) => (
                <article key={article.title} className="student-resource-card student-article-card">
                  <span
                    className={`student-article-chip ${
                      categoryClassMap[article.color] || categoryClassMap.blue
                    }`}
                  >
                    {article.category}
                  </span>
                  <h3>{article.title}</h3>
                </article>
              ))}
            </div>
          </section>

          <section id="campus-support" className="student-resources-section">
            <div className="student-resources-section-head">
              <span className="student-resources-section-icon student-resources-section-icon-teal">
                <BuildingIcon className="w-5 h-5" />
              </span>
              <div>
                <h2>Campus Resources</h2>
                <p>Student services available through campus support teams.</p>
              </div>
            </div>
            <div className="student-campus-grid">
              {filteredCampusResources.map((resource) => (
                <article key={resource.name} className="student-resource-card student-campus-card">
                  <h3>{resource.name}</h3>
                  <p>{resource.description}</p>
                  <dl className="student-campus-meta">
                    <div>
                      <dt>Hours</dt>
                      <dd>{resource.hours}</dd>
                    </div>
                    <div>
                      <dt>Phone</dt>
                      <dd>{resource.phone}</dd>
                    </div>
                    <div>
                      <dt>Location</dt>
                      <dd>{resource.location}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          </section>

          <section id="coping-tools" className="student-resources-section">
            <div className="student-resources-section-head">
              <span className="student-resources-section-icon student-resources-section-icon-pink">
                <HeartIcon className="w-5 h-5" />
              </span>
              <div>
                <h2>Coping Strategies</h2>
                <p>Simple actions you can try when the day feels heavy.</p>
              </div>
            </div>
            <div className="student-strategy-grid">
              {filteredStrategies.map((strategy) => (
                <article key={strategy.title} className="student-resource-card student-strategy-card">
                  <h3>{strategy.title}</h3>
                  <p>{strategy.description}</p>
                </article>
              ))}
            </div>
          </section>

          {totalResults === 0 && (
            <div className="student-empty-state student-resource-empty">
              <MessageSquareIcon className="student-empty-icon" />
              <h3>No matching resources</h3>
              <p>Try a different keyword or clear the search field.</p>
            </div>
          )}

          <EmergencySOS />
        </div>
      </main>
    </div>
  );
};

export default Resources;
