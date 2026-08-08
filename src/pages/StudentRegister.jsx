import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import BadgeIcon from '@mui/icons-material/Badge';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useAuth } from '../context/AuthContext';
import welcomeGirl from '../assets/welcome-girl.webp';
import './RegisterFlow.css';

const StudentRegister = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const result = await register({
        email: formData.email,
        username: formData.username,
        password: formData.password,
        full_name: `${formData.firstName} ${formData.lastName}`,
        role: 'student',
      });

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/terms');
        }, 1500);
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="register-page" aria-label="SafeTalk student registration">
      <section className="register-shell register-form-shell">
        <aside className="register-story-panel" aria-label="Student registration message">
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
              <span>Join With</span>
              Care
            </h1>
            <p>
              Create your student account and begin a private wellbeing journey
              shaped around your needs.
            </p>
          </div>

          <div className="register-story-highlights">
            <article>
              <SchoolIcon aria-hidden="true" />
              <span>
                <strong>Student support</strong>
                <small>Tools for daily check-ins and assessment.</small>
              </span>
            </article>
            <article>
              <PsychologyIcon aria-hidden="true" />
              <span>
                <strong>Beyond words</strong>
                <small>Support informed by multiple wellbeing signals.</small>
              </span>
            </article>
          </div>

          <div className="register-illustration" aria-hidden="true">
            <img src={welcomeGirl} alt="" />
          </div>
        </aside>

        <section className="register-action-panel" aria-label="Student registration form">
          <div className="register-action-card">
            <div className="register-form-icon" aria-hidden="true">
              <SchoolIcon />
            </div>
            <p className="register-eyebrow">Student account</p>
            <h2>Create your account</h2>
            <p className="register-action-copy">
              Use your details to set up secure access to SafeTalk.
            </p>

            {error && (
              <div className="register-alert error" role="alert">
                {error}
              </div>
            )}

            {success && (
              <div className="register-alert success" role="status">
                Registration successful. Redirecting to terms and conditions...
              </div>
            )}

            <form className="register-form" onSubmit={handleSubmit}>
              <div className="register-two-column">
                <label className="register-field">
                  <span>First name</span>
                  <span className="register-input-wrap">
                    <PersonIcon aria-hidden="true" />
                    <input
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      placeholder="John"
                      autoComplete="given-name"
                    />
                  </span>
                </label>

                <label className="register-field">
                  <span>Last name</span>
                  <span className="register-input-wrap">
                    <PersonIcon aria-hidden="true" />
                    <input
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      placeholder="Smith"
                      autoComplete="family-name"
                    />
                  </span>
                </label>
              </div>

              <label className="register-field">
                <span>Email</span>
                <span className="register-input-wrap">
                  <EmailIcon aria-hidden="true" />
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="john@gmail.com"
                    autoComplete="email"
                  />
                </span>
              </label>

              <label className="register-field">
                <span>Username</span>
                <span className="register-input-wrap">
                  <BadgeIcon aria-hidden="true" />
                  <input
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    placeholder="your_username"
                    autoComplete="username"
                  />
                </span>
              </label>

              <div className="register-two-column">
                <label className="register-field">
                  <span>Password</span>
                  <span className="register-input-wrap">
                    <LockIcon aria-hidden="true" />
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="Password"
                      autoComplete="new-password"
                    />
                    <button
                      className="register-password-toggle"
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </button>
                  </span>
                </label>

                <label className="register-field">
                  <span>Confirm</span>
                  <span className="register-input-wrap">
                    <LockIcon aria-hidden="true" />
                    <input
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      placeholder="Confirm"
                      autoComplete="new-password"
                    />
                    <button
                      className="register-password-toggle"
                      type="button"
                      onClick={() => setShowConfirmPassword((value) => !value)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </button>
                  </span>
                </label>
              </div>

              <button
                className="register-submit-button"
                type="submit"
                disabled={loading || success}
              >
                <SchoolIcon />
                {loading ? 'Registering...' : 'Register'}
                <ArrowForwardIcon className="register-submit-arrow" />
              </button>
            </form>

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

export default StudentRegister;
