import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import SpaIcon from '@mui/icons-material/Spa';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useAuth } from '../context/AuthContext';
import welcomeGirl from '../assets/welcome-girl.webp';
import './Login.css';

const COUNSELOR_ROLES = new Set(['counselor', 'psychiatrist']);

const landingPathForRole = (role) => {
  if (role === 'admin') return '/admin';
  if (COUNSELOR_ROLES.has(role)) return '/counselor';
  return '/dashboard';
};

const supportItems = [
  {
    icon: <ShieldOutlinedIcon />,
    title: 'Private',
    copy: 'Secure wellbeing support.',
    tone: 'teal',
  },
  {
    icon: <ScienceOutlinedIcon />,
    title: 'Evidence Based',
    copy: 'Assessments with purpose.',
    tone: 'blue',
  },
  {
    icon: <SpaIcon />,
    title: 'Gentle Care',
    copy: 'Personalized next steps.',
    tone: 'violet',
  },
];

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    setLoading(true);

    try {
      const result = await login(formData.username, formData.password);
      if (result.success) {
        navigate(landingPathForRole(result.user?.role));
      } else {
        setError(result.error || 'Invalid username or password');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page" aria-label="SafeTalk login page">
      <section className="login-shell">
        <aside className="login-story-panel" aria-label="SafeTalk support message">
          <div className="login-brand">
            <span className="login-brand-mark" aria-hidden="true">
              <FavoriteBorderIcon />
            </span>
            <span>
              <strong>SafeTalk</strong>
              <small>Mental Health Support</small>
            </span>
          </div>

          <div className="login-story-copy">
            <h1>
              <span>Your Mind</span>
              Matters
            </h1>
            <p>
              Log in to continue your wellbeing journey with private,
              understanding support.
            </p>
          </div>

          <div className="login-support-list">
            {supportItems.map(({ icon, title, copy, tone }) => (
              <article className="login-support-item" key={title}>
                <span className={`login-support-icon ${tone}`} aria-hidden="true">
                  {icon}
                </span>
                <span>
                  <strong>{title}</strong>
                  <small>{copy}</small>
                </span>
              </article>
            ))}
          </div>

          <figure className="login-quote">
            <blockquote>
              You are not alone. SafeTalk is here when you are ready.
            </blockquote>
          </figure>

          <div className="login-orbit" aria-hidden="true">
            <span className="login-orbit-ring ring-one" />
            <span className="login-orbit-ring ring-two" />
            <span className="login-orbit-dot dot-one" />
            <span className="login-orbit-dot dot-two" />
          </div>

          <div className="login-illustration" aria-hidden="true">
            <img src={welcomeGirl} alt="" />
          </div>
        </aside>

        <section className="login-form-panel" aria-label="Login form">
          <div className="login-form-card">
            <div className="login-form-icon" aria-hidden="true">
              <PsychologyIcon />
            </div>

            <p className="login-eyebrow">Welcome back</p>
            <h2>Log in to SafeTalk</h2>
            <p className="login-form-copy">
              Continue toward better wellbeing with thoughtful support that
              understands more than words.
            </p>

            {error && (
              <div className="login-error" role="alert">
                {error}
              </div>
            )}

            <form className="login-form" onSubmit={handleSubmit}>
              <label className="login-field">
                <span>Username</span>
                <span className="login-input-wrap">
                  <EmailIcon aria-hidden="true" />
                  <input
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    autoComplete="username"
                    placeholder="Enter your username"
                  />
                </span>
              </label>

              <label className="login-field">
                <span>Password</span>
                <span className="login-input-wrap">
                  <LockIcon aria-hidden="true" />
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    autoComplete="current-password"
                    placeholder="Enter your password"
                  />
                  <button
                    className="login-password-toggle"
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </button>
                </span>
              </label>

              <div className="login-form-row">
                <label className="login-check">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                  />
                  <span>Remember me</span>
                </label>
              </div>

              <button
                className="login-submit-button"
                type="submit"
                disabled={loading}
              >
                <LoginIcon />
                {loading ? 'Logging in...' : 'Log In'}
                <ArrowForwardIcon className="login-submit-arrow" />
              </button>
            </form>

            <button
              className="login-register-button"
              type="button"
              onClick={() => navigate('/register')}
            >
              <PersonAddAlt1Icon />
              Create an account
            </button>
          </div>
        </section>
      </section>
    </main>
  );
};

export default Login;
