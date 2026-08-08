import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import EmergencyIcon from '@mui/icons-material/Emergency';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import welcomeGirl from '../assets/welcome-girl.webp';
import './TermsOfService.css';

const consentOptions = [
  ['profile_processing', 'Profile processing', 'Legacy combined profile consent retained for existing records.'],
  ['profile_data_storage', 'Profile data storage', 'Required before saving profile assessment drafts or submissions.'],
  ['profile_model_processing', 'Profile model processing', 'Required before profile answers are processed by the verified profile model.'],
  ['dass21_processing', 'DASS-21 processing', 'Required before submitting or updating questionnaire responses.'],
  ['mood_processing', 'Mood check-in processing', 'Required before creating or updating daily check-ins.'],
  ['text_processing', 'Automated text analysis', 'Optional. Direct counselor chat is not blocked by this consent.'],
  ['voice_processing', 'Voice messages', 'Optional until you record or upload voice messages.'],
  ['face_processing', 'Facial data processing', 'Legacy combined facial consent retained for existing records.'],
  ['facial_capture', 'Facial capture', 'Optional. Required before the camera can capture an image.'],
  ['facial_model_processing', 'Facial model processing', 'Optional. Required before an explicitly captured image can be processed.'],
  ['behavioral_processing', 'Behavioral data processing', 'Optional and not pre-granted.'],
  ['counselor_escalation', 'Counselor escalation', 'Allows risk-related information to be surfaced for counselor review.'],
  ['research_data_use', 'Research data use', 'Optional research use. Withdrawal does not delete historical records in this phase.'],
];

const acknowledgementOptions = [
  ['notEmergency', 'I understand this is not an emergency service.'],
  ['responsibleUse', 'I agree to use this service responsibly and provide accurate information.'],
  ['aiLimitations', 'I understand AI outputs are support signals and do not replace professional care.'],
  ['readTerms', 'I have read and understand these terms.'],
  ['ageConsent', 'I am 18 years or older, or I have appropriate guardian consent if required.'],
];

const TermsOfService = () => {
  const navigate = useNavigate();
  const { user, acceptTerms } = useAuth();
  const [acknowledgements, setAcknowledgements] = useState({
    notEmergency: false,
    responsibleUse: false,
    aiLimitations: false,
    readTerms: false,
    ageConsent: false,
  });
  const [consents, setConsents] = useState({});
  const [initialConsents, setInitialConsents] = useState({});
  const [policyVersion, setPolicyVersion] = useState('1.0');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const allAcknowledged = Object.values(acknowledgements).every(Boolean);

  useEffect(() => {
    const loadConsentState = async () => {
      try {
        const [policyResponse, consentResponse] = await Promise.all([
          api.get('/api/consents/policy'),
          api.get('/api/consents'),
        ]);
        const current = consentResponse.data.consents || {};
        const state = {};
        consentOptions.forEach(([type]) => {
          state[type] = Boolean(current[type]?.is_granted);
        });
        setPolicyVersion(policyResponse.data.policy_version || '1.0');
        setConsents(state);
        setInitialConsents(state);
      } catch {
        setError('Sign in is required before consent choices can be saved.');
      }
    };

    loadConsentState();
  }, []);

  const toggleAcknowledgement = (name) => {
    setAcknowledgements((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const toggleConsent = (name) => {
    setConsents((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleContinue = async () => {
    if (!allAcknowledged) {
      setError('Please complete the required acknowledgements to continue.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const changedEntries = Object.entries(consents).filter(
        ([type, value]) => initialConsents[type] !== value
      );
      await Promise.all(
        changedEntries.map(([type, value]) =>
          api.put(`/api/consents/${type}`, {
            is_granted: value,
            policy_version: policyVersion,
          })
        )
      );
      acceptTerms();
      if (user?.role === 'admin') {
        navigate('/admin');
      } else if (user?.role === 'counselor' || user?.role === 'psychiatrist') {
        navigate('/counselor');
      } else {
        navigate('/dashboard');
      }
    } catch {
      setError('Unable to save consent choices. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="terms-page" aria-label="SafeTalk terms and consent page">
      <section className="terms-shell">
        <aside className="terms-story-panel" aria-label="Terms overview">
          <div className="terms-brand">
            <span className="terms-brand-mark" aria-hidden="true">
              <FavoriteBorderIcon />
            </span>
            <span>
              <strong>SafeTalk</strong>
              <small>Mental Health Support</small>
            </span>
          </div>

          <div className="terms-story-copy">
            <h1>
              <span>Your Consent</span>
              Matters
            </h1>
            <p>
              Review how SafeTalk supports you, what it cannot replace, and how
              your wellbeing data may be processed.
            </p>
          </div>

          <div className="terms-story-highlights">
            <article>
              <EmergencyIcon aria-hidden="true" />
              <span>
                <strong>Not emergency care</strong>
                <small>Use emergency services if you are in immediate danger.</small>
              </span>
            </article>
            <article>
              <LockIcon aria-hidden="true" />
              <span>
                <strong>Consent controlled</strong>
                <small>Your choices guide future data processing.</small>
              </span>
            </article>
          </div>

          <div className="terms-illustration" aria-hidden="true">
            <img src={welcomeGirl} alt="" />
          </div>
        </aside>

        <section className="terms-panel" aria-label="Terms and consent form">
          <div className="terms-card">
            <header className="terms-header">
              <div className="terms-form-icon" aria-hidden="true">
                <PsychologyIcon />
              </div>
              <div>
                <p className="terms-eyebrow">Policy version {policyVersion}</p>
                <h2>Terms and Consent</h2>
              </div>
            </header>

            <div className="terms-notice info">
              This app is a support and screening tool, not an emergency
              service. Consent choices control future processing and do not
              delete historical records in Phase 4B.
            </div>

            <div className="terms-scroll-panel">
              <section className="terms-section">
                <div className="terms-section-heading">
                  <FactCheckIcon aria-hidden="true" />
                  <div>
                    <h3>Required Acknowledgements</h3>
                    <p>All acknowledgements are required before continuing.</p>
                  </div>
                </div>

                <div className="terms-check-list">
                  {acknowledgementOptions.map(([name, label]) => (
                    <label className="terms-check-item" key={name}>
                      <input
                        type="checkbox"
                        checked={acknowledgements[name]}
                        onChange={() => toggleAcknowledgement(name)}
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </section>

              <section className="terms-section">
                <div className="terms-section-heading">
                  <ShieldOutlinedIcon aria-hidden="true" />
                  <div>
                    <h3>Consent Choices</h3>
                    <p>Choose which future processing permissions you grant.</p>
                  </div>
                </div>

                <div className="terms-consent-grid">
                  {consentOptions.map(([type, label, description]) => (
                    <label className="terms-consent-card" key={type}>
                      <input
                        type="checkbox"
                        checked={Boolean(consents[type])}
                        onChange={() => toggleConsent(type)}
                      />
                      <span>
                        <strong>{label}</strong>
                        <small>{description}</small>
                      </span>
                    </label>
                  ))}
                </div>
              </section>
            </div>

            {error && (
              <div className="terms-notice error" role="alert">
                {error}
              </div>
            )}

            <button
              className="terms-submit-button"
              type="button"
              onClick={handleContinue}
              disabled={loading}
            >
              <CheckCircleIcon />
              {loading ? 'Saving...' : 'Continue'}
              <ArrowForwardIcon className="terms-submit-arrow" />
            </button>
          </div>
        </section>
      </section>
    </main>
  );
};

export default TermsOfService;
