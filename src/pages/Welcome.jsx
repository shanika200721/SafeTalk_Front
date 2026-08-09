import React from 'react';
import { useNavigate } from 'react-router-dom';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SpaIcon from '@mui/icons-material/Spa';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import welcomeGirl from '../assets/welcome-girl.webp';
import './Welcome.css';

const features = [
  {
    icon: <ShieldOutlinedIcon />,
    title: 'Private and Secure',
    copy: 'Your wellbeing data is protected with care.',
    tone: 'teal',
  },
  {
    icon: <ScienceOutlinedIcon />,
    title: 'Science Backed',
    copy: 'Evidence-based assessments and resources.',
    tone: 'blue',
  },
  {
    icon: <SpaIcon />,
    title: 'Personalized Support',
    copy: 'Tools and guidance tailored for you.',
    tone: 'violet',
  },
];

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <main className="welcome-page" aria-label="SafeTalk welcome page">
      <section className="welcome-shell">
        <div className="welcome-story-panel">
          <div className="welcome-brand">
            <span className="welcome-brand-mark" aria-hidden="true">
              <FavoriteBorderIcon />
            </span>
            <span>
              <strong>SafeTalk</strong>
              <small>Mental Health Support</small>
            </span>
          </div>

          <div className="welcome-story-copy">
            <h1>
              <span>Your Mind</span>
              Matters
            </h1>
            <p>
              SafeTalk is here to support your mental wellbeing with care,
              understanding, and privacy.
            </p>
          </div>

          <div className="welcome-feature-list" aria-label="SafeTalk highlights">
            {features.map(({ icon, title, copy, tone }) => (
              <article className="welcome-feature" key={title}>
                <span className={`welcome-feature-icon ${tone}`} aria-hidden="true">
                  {icon}
                </span>
                <span>
                  <strong>{title}</strong>
                  <small>{copy}</small>
                </span>
              </article>
            ))}
          </div>

          <figure className="welcome-quote">
            <blockquote>
              It's okay to not be okay. You do not have to go through it alone.
            </blockquote>
          </figure>

          <div className="welcome-orbit" aria-hidden="true">
            <span className="orbit-ring ring-one" />
            <span className="orbit-ring ring-two" />
            <span className="orbit-dot dot-one" />
            <span className="orbit-dot dot-two" />
            <span className="orbit-dot dot-three" />
          </div>

          <div className="welcome-illustration" aria-hidden="true">
            <img src={welcomeGirl} alt="" />
          </div>
        </div>

        <div className="welcome-action-panel">
          <div className="welcome-action-inner">
            <div className="welcome-action-icon" aria-hidden="true">
              <PsychologyIcon />
            </div>

            <p className="welcome-eyebrow">An intelligent support platform</p>
            <h2>Welcome to SafeTalk</h2>
            <p className="welcome-action-copy">
              Continue your journey toward better wellbeing with gentle,
              private support that understands more than words.
            </p>

            <div className="welcome-actions" aria-label="Account actions">
              <button
                className="welcome-primary-button"
                type="button"
                onClick={() => navigate('/login')}
              >
                <LoginIcon />
                Login
                <ArrowForwardIcon className="welcome-button-arrow" />
              </button>

              <button
                className="welcome-secondary-button"
                type="button"
                onClick={() => navigate('/register')}
              >
                <PersonAddAlt1Icon />
                Sign Up
              </button>
            </div>

            <div className="welcome-help-row" aria-label="Support promises">
              <span>Confidential</span>
              <span>Responsive</span>
              <span>Supportive</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Welcome;
