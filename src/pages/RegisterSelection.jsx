import React from 'react';
import { useNavigate } from 'react-router-dom';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SchoolIcon from '@mui/icons-material/School';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import SpaIcon from '@mui/icons-material/Spa';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LoginIcon from '@mui/icons-material/Login';
import welcomeGirl from '../assets/welcome-girl.webp';
import './RegisterFlow.css';

const RegisterSelection = () => {
  const navigate = useNavigate();

  return (
    <main className="register-page" aria-label="SafeTalk registration page">
      <section className="register-shell register-selection-shell">
        <aside className="register-story-panel" aria-label="SafeTalk registration message">
          <div className="register-brand">
            <span className="register-brand-mark" aria-hidden="true">
              <FavoriteBorderIcon />
            </span>
            <span>
              <strong>SafeTalk</strong>
              <small>Mental Health Support</small>
            </span>
          </div>

          <div className="register-story-copy">
            <h1>
              <span>Start With</span>
              Support
            </h1>
            <p>
              Choose the account type that fits your role and continue into a
              secure wellbeing experience.
            </p>
          </div>

          <div className="register-story-highlights">
            <article>
              <ShieldOutlinedIcon aria-hidden="true" />
              <span>
                <strong>Private by design</strong>
                <small>Your data is handled with care.</small>
              </span>
            </article>
            <article>
              <SpaIcon aria-hidden="true" />
              <span>
                <strong>Gentle onboarding</strong>
                <small>Simple steps, thoughtful support.</small>
              </span>
            </article>
          </div>

          <div className="register-illustration" aria-hidden="true">
            <img src={welcomeGirl} alt="" />
          </div>
        </aside>

        <section className="register-action-panel" aria-label="Registration type selection">
          <div className="register-action-card">
            <div className="register-form-icon" aria-hidden="true">
              <PsychologyIcon />
            </div>
            <p className="register-eyebrow">Create your account</p>
            <h2>Select registration type</h2>
            <p className="register-action-copy">
              SafeTalk gives each role the right access path, support tools,
              and privacy controls.
            </p>

            <div className="register-type-grid">
              <button
                className="register-type-card"
                type="button"
                onClick={() => navigate('/register/student')}
              >
                <span className="register-type-icon student" aria-hidden="true">
                  <SchoolIcon />
                </span>
                <span>
                  <strong>Student</strong>
                  <small>Create a personal SafeTalk wellbeing account.</small>
                </span>
                <ArrowForwardIcon />
              </button>

              <button
                className="register-type-card"
                type="button"
                onClick={() => navigate('/register/psychiatric')}
              >
                <span className="register-type-icon staff" aria-hidden="true">
                  <MedicalServicesIcon />
                </span>
                <span>
                  <strong>Psychiatric Staff</strong>
                  <small>View staff access and approval guidance.</small>
                </span>
                <ArrowForwardIcon />
              </button>
            </div>

            <div className="register-bottom-actions">
              <button type="button" onClick={() => navigate('/login')}>
                <LoginIcon />
                Already have an account?
              </button>
              <button type="button" onClick={() => navigate('/landing')}>
                Back to Home
              </button>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
};

export default RegisterSelection;
