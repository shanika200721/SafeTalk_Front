import React from 'react';
import { useNavigate } from 'react-router-dom';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PsychologyIcon from '@mui/icons-material/Psychology';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LockIcon from '@mui/icons-material/Lock';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LoginIcon from '@mui/icons-material/Login';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import welcomeGirl from '../assets/welcome-girl.webp';
import './RegisterFlow.css';

const PsychiatricRegister = () => {
  const navigate = useNavigate();

  return (
    <main className="register-page" aria-label="SafeTalk staff registration information">
      <section className="register-shell register-staff-shell">
        <aside className="register-story-panel" aria-label="Staff access message">
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
              <span>Trusted</span>
              Care Teams
            </h1>
            <p>
              Staff access is protected so student wellbeing data stays safe and
              professionally managed.
            </p>
          </div>

          <div className="register-story-highlights">
            <article>
              <AdminPanelSettingsIcon aria-hidden="true" />
              <span>
                <strong>Admin approved</strong>
                <small>Staff accounts are provisioned securely.</small>
              </span>
            </article>
            <article>
              <LockIcon aria-hidden="true" />
              <span>
                <strong>Protected access</strong>
                <small>No public staff credential submission.</small>
              </span>
            </article>
          </div>

          <div className="register-illustration" aria-hidden="true">
            <img src={welcomeGirl} alt="" />
          </div>
        </aside>

        <section className="register-action-panel" aria-label="Staff access guidance">
          <div className="register-action-card">
            <div className="register-form-icon" aria-hidden="true">
              <MedicalServicesIcon />
            </div>
            <p className="register-eyebrow">Staff account access</p>
            <h2>Approval required</h2>
            <p className="register-action-copy">
              Counselor and psychiatrist accounts require administrative
              approval. Public self-registration is available only for student
              accounts.
            </p>

            <div className="register-info-panel">
              <div>
                <strong>Professional email</strong>
                <small>Staff provisioning will be handled by an administrator.</small>
              </div>
              <div>
                <strong>License or staff identifier</strong>
                <small>Do not submit credentials through the public registration API.</small>
              </div>
            </div>

            <button
              className="register-submit-button"
              type="button"
              onClick={() => navigate('/login')}
            >
              <LoginIcon />
              Go to Login
              <ArrowForwardIcon className="register-submit-arrow" />
            </button>

            <button
              className="register-secondary-button"
              type="button"
              onClick={() => navigate('/register')}
            >
              <ArrowBackIcon />
              Back to registration type
            </button>
          </div>
        </section>
      </section>
    </main>
  );
};

export default PsychiatricRegister;
