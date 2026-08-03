import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from 'lucide-react';
import { Sidebar } from '../layout/Sidebar';
import { EmergencySOS } from '../common/EmergencySOS';

export const WellnessLayout = ({ title, eyebrow, description, action, children }) => (
  <div className="student-shell wellness-theme">
    <Sidebar />
    <main className="student-main">
      <div className="student-page wellness-page">
        <Link to="/dashboard" className="student-top-link">
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
        <section className="wellness-hero">
          <div>
            <p className="wellness-eyebrow">{eyebrow}</p>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          {action && <div className="wellness-hero-action">{action}</div>}
        </section>
        {children}
        <EmergencySOS />
      </div>
    </main>
  </div>
);

export const WellnessCard = ({ icon: Icon, title, subtitle, meta, children, className = '' }) => (
  <article className={`wellness-card ${className}`}>
    {(Icon || meta) && (
      <div className="wellness-card-top">
        {Icon && (
          <span className="wellness-card-icon" aria-hidden="true">
            <Icon className="w-5 h-5" />
          </span>
        )}
        {meta && <span className="wellness-pill">{meta}</span>}
      </div>
    )}
    <h3>{title}</h3>
    {subtitle && <p>{subtitle}</p>}
    {children}
  </article>
);

export const WellnessToolbar = ({ search, onSearch, category, onCategory, categories = [], children }) => (
  <section className="wellness-toolbar" aria-label="Filter wellness content">
    {onSearch && (
      <label className="wellness-search">
        <span className="sr-only">Search</span>
        <input
          type="search"
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Search wellness resources..."
        />
      </label>
    )}
    {onCategory && (
      <label className="wellness-select">
        <span className="sr-only">Category</span>
        <select value={category} onChange={(event) => onCategory(event.target.value)}>
          <option value="">All categories</option>
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
    )}
    {children}
  </section>
);

export const CameraReadyPanel = () => (
  <section className="wellness-panel camera-ready-panel" aria-labelledby="camera-ready-title">
    <div>
      <p className="wellness-eyebrow">Consent Required</p>
      <h2 id="camera-ready-title">Camera Check-in</h2>
      <p>Facial analysis is currently unavailable.</p>
    </div>
    <div className="camera-ready-actions">
      <button type="button" className="student-btn student-btn-secondary">Start Camera</button>
      <button type="button" className="student-btn student-btn-secondary">Stop Camera</button>
      <button type="button" className="student-btn student-btn-secondary">Capture</button>
      <button type="button" className="student-btn student-btn-secondary">Retake</button>
    </div>
  </section>
);
