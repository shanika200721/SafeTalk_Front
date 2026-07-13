import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  FormControl,
  FormControlLabel,
  LinearProgress,
  MenuItem,
  Select,
  Slider,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBack from '@mui/icons-material/ArrowBack';
import BarChart from '@mui/icons-material/BarChart';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Edit from '@mui/icons-material/Edit';
import Favorite from '@mui/icons-material/Favorite';
import FitnessCenter from '@mui/icons-material/FitnessCenter';
import Groups from '@mui/icons-material/Groups';
import Hotel from '@mui/icons-material/Hotel';
import Psychology from '@mui/icons-material/Psychology';
import Save from '@mui/icons-material/Save';
import WarningAmber from '@mui/icons-material/WarningAmber';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Sidebar } from '../components/layout/Sidebar';
import { EmergencySOS } from '../components/common/EmergencySOS';

const moodOptions = [
  { value: 1, label: 'Very Bad', helper: 'Heavy day' },
  { value: 2, label: 'Bad', helper: 'Struggling' },
  { value: 3, label: 'Neutral', helper: 'Steady' },
  { value: 4, label: 'Good', helper: 'Doing okay' },
  { value: 5, label: 'Great', helper: 'Energized' },
];

const socialOptions = ['None', 'Limited', 'Moderate', 'Good'];

const defaultFormData = {
  mood: 3,
  sleep_hours: 7,
  exercise_minutes: 0,
  social_interaction: 'Moderate',
  stress_level: 5,
  anxiety_level: 5,
  negative_thoughts: false,
  substance_use_today: false,
  self_harm_thoughts: false,
  notes: '',
};

const DailyCheckin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(defaultFormData);
  const [mode, setMode] = useState('check');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [todayCheckin, setTodayCheckin] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const loadCheckinData = async () => {
      try {
        const response = await api.get('/api/checkin/today');
        if (response.data.checked_in && response.data.checkin) {
          const checkin = { ...defaultFormData, ...response.data.checkin };
          setTodayCheckin(checkin);
          setFormData(checkin);
          setMode('view');
        } else {
          setMode('form');
        }
      } catch {
        console.log('No check-in today yet or API error');
        setMode('form');
      } finally {
        setLoading(false);
      }
    };

    loadCheckinData();
  }, []);

  const handleMoodChange = (newMood) => {
    setFormData((prev) => ({ ...prev, mood: newMood }));
  };

  const handleSliderChange = (field) => (event, newValue) => {
    setFormData((prev) => ({ ...prev, [field]: newValue }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const calculateRiskScore = () => {
    let score = 0;
    score += (5 - formData.mood) * 15;
    score += formData.stress_level * 3;
    score += formData.anxiety_level * 2;

    if (formData.sleep_hours < 5 || formData.sleep_hours > 10) {
      score += 15;
    } else if (formData.sleep_hours < 6 || formData.sleep_hours > 9) {
      score += 10;
    }

    if (formData.exercise_minutes === 0) score += 10;
    if (formData.social_interaction === 'None') score += 20;
    if (formData.social_interaction === 'Limited') score += 10;
    if (formData.negative_thoughts) score += 15;
    if (formData.substance_use_today) score += 25;
    if (formData.self_harm_thoughts) score += 50;

    return Math.min(100, Math.round(score));
  };

  const getRiskLevel = (score) => {
    if (score >= 70) {
      return {
        level: 'CRITICAL',
        color: '#dc2626',
        className: 'student-checkin-risk-critical',
        tone: 'Immediate support is recommended.',
      };
    }
    if (score >= 50) {
      return {
        level: 'HIGH',
        color: '#ea580c',
        className: 'student-checkin-risk-high',
        tone: 'Extra care and support may help today.',
      };
    }
    if (score >= 30) {
      return {
        level: 'MODERATE',
        color: '#ca8a04',
        className: 'student-checkin-risk-moderate',
        tone: 'Keep watching your stress and energy.',
      };
    }
    return {
      level: 'LOW',
      color: '#16a34a',
      className: 'student-checkin-risk-low',
      tone: 'Your check-in looks steady today.',
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      if (isEditing && todayCheckin) {
        const response = await api.put('/api/checkin/today', formData);
        const checkin = { ...defaultFormData, ...response.data };
        setSuccess('Check-in updated successfully.');
        setTodayCheckin(checkin);
        setFormData(checkin);
        setIsEditing(false);
        setMode('view');
      } else {
        const response = await api.post('/api/checkin/today', formData);
        const checkin = { ...defaultFormData, ...response.data };
        setSuccess('Daily check-in recorded successfully.');
        setTodayCheckin(checkin);
        setFormData(checkin);
        setMode('view');
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail || err.message || 'Failed to save check-in';
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = () => {
    setIsEditing(true);
    setMode('form');
  };

  const riskScore = calculateRiskScore();
  const riskInfo = getRiskLevel(riskScore);
  const selectedMood = moodOptions.find((mood) => mood.value === formData.mood);

  const renderStudentShell = (content) => (
    <div className="student-shell">
      <Sidebar />
      <main className="student-main">
        <div className="student-page student-checkin-page">
          {content}
          <EmergencySOS />
        </div>
      </main>
    </div>
  );

  const MetricCard = ({ icon, label, value, tone }) => (
    <Card className="student-checkin-card student-checkin-metric-card">
      <CardContent>
        <div className="student-checkin-metric-head">
          <span className="student-checkin-card-icon">{icon}</span>
          <Typography className="student-checkin-card-label">{label}</Typography>
        </div>
        <Typography className="student-checkin-metric-value">{value}</Typography>
        {tone && <Typography className="student-checkin-card-note">{tone}</Typography>}
      </CardContent>
    </Card>
  );

  const SliderCard = ({ icon, label, valueLabel, children }) => (
    <Card className="student-checkin-card">
      <CardContent>
        <div className="student-checkin-field-head">
          <span className="student-checkin-card-icon">{icon}</span>
          <div>
            <Typography className="student-checkin-field-title">{label}</Typography>
            <Typography className="student-checkin-field-value">{valueLabel}</Typography>
          </div>
        </div>
        <div className="student-checkin-slider-wrap">{children}</div>
      </CardContent>
    </Card>
  );

  const RiskSummary = () => (
    <Card className={`student-checkin-risk-card ${riskInfo.className}`}>
      <CardContent>
        <div className="student-checkin-risk-head">
          <div>
            <Typography className="student-checkin-risk-label">
              Well-being Score
            </Typography>
            <Typography className="student-checkin-risk-score">
              {riskScore}%
            </Typography>
          </div>
          <Chip
            label={riskInfo.level}
            className="student-checkin-risk-chip"
            sx={{ color: riskInfo.color, borderColor: riskInfo.color }}
            variant="outlined"
          />
        </div>
        <Typography className="student-checkin-risk-note">{riskInfo.tone}</Typography>
        <LinearProgress
          variant="determinate"
          value={riskScore}
          className="student-checkin-risk-progress"
          sx={{
            '& .MuiLinearProgress-bar': {
              backgroundColor: riskInfo.color,
            },
          }}
        />
        <Typography className="student-checkin-card-note">
          Ranges: 0-29 Low, 30-49 Moderate, 50-69 High, 70+ Critical
        </Typography>
      </CardContent>
    </Card>
  );

  const TopBar = ({ completed = false }) => (
    <div className="student-checkin-topbar">
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/dashboard')}
        className="student-checkin-back"
      >
        Back to Dashboard
      </Button>
      {completed && (
        <Button
          startIcon={<Edit />}
          variant="contained"
          onClick={handleStartEdit}
          className="student-checkin-primary-action"
        >
          Edit Today's Entry
        </Button>
      )}
    </div>
  );

  if (loading) {
    return renderStudentShell(
      <div className="student-checkin-loading">
        <CircularProgress />
        <Typography>Loading today's check-in...</Typography>
      </div>
    );
  }

  if (mode === 'view' && todayCheckin) {
    const completedMood =
      moodOptions.find((mood) => mood.value === todayCheckin.mood) ||
      selectedMood;

    return renderStudentShell(
      <>
        <TopBar completed />

        <section className="student-checkin-hero student-checkin-hero-complete">
          <div>
            <p className="student-checkin-eyebrow">Today</p>
            <h1>Check-in Completed</h1>
            <p>Your wellness snapshot has been saved for today.</p>
          </div>
          <CheckCircle className="student-checkin-hero-icon" />
        </section>

        {success && <Alert severity="success">{success}</Alert>}

        <div className="student-checkin-grid student-checkin-grid-2">
          <Card className="student-checkin-card student-checkin-mood-summary">
            <CardContent>
              <Typography className="student-checkin-card-label">
                Your Mood
              </Typography>
              <Typography className="student-checkin-mood-score">
                {todayCheckin.mood}/5
              </Typography>
              <Typography className="student-checkin-mood-label">
                {completedMood?.label || 'Not recorded'}
              </Typography>
            </CardContent>
          </Card>

          <RiskSummary />
        </div>

        <div className="student-checkin-grid student-checkin-grid-4">
          <MetricCard
            icon={<Hotel />}
            label="Sleep Hours"
            value={`${todayCheckin.sleep_hours}h`}
          />
          <MetricCard
            icon={<FitnessCenter />}
            label="Exercise"
            value={`${todayCheckin.exercise_minutes}m`}
          />
          <MetricCard
            icon={<Favorite />}
            label="Stress Level"
            value={`${todayCheckin.stress_level}/10`}
          />
          <MetricCard
            icon={<Psychology />}
            label="Anxiety Level"
            value={`${todayCheckin.anxiety_level}/10`}
          />
        </div>

        <div className="student-checkin-grid student-checkin-grid-2">
          <Card className="student-checkin-card">
            <CardContent>
              <div className="student-checkin-field-head">
                <span className="student-checkin-card-icon"><Groups /></span>
                <div>
                  <Typography className="student-checkin-field-title">
                    Social Interaction
                  </Typography>
                  <Chip label={todayCheckin.social_interaction} />
                </div>
              </div>
              {todayCheckin.notes && (
                <Typography className="student-checkin-notes">
                  {todayCheckin.notes}
                </Typography>
              )}
            </CardContent>
          </Card>

          <Card className="student-checkin-card">
            <CardContent>
              <div className="student-checkin-field-head">
                <span className="student-checkin-card-icon"><WarningAmber /></span>
                <div>
                  <Typography className="student-checkin-field-title">
                    Risk Factors
                  </Typography>
                  <Typography className="student-checkin-card-note">
                    Sensitive items reported today
                  </Typography>
                </div>
              </div>
              <div className="student-checkin-chip-row">
                {todayCheckin.negative_thoughts && <Chip label="Negative thoughts" />}
                {todayCheckin.substance_use_today && <Chip label="Substance use" />}
                {todayCheckin.self_harm_thoughts && (
                  <Chip label="Self-harm thoughts" color="error" />
                )}
                {!todayCheckin.negative_thoughts &&
                  !todayCheckin.substance_use_today &&
                  !todayCheckin.self_harm_thoughts && (
                    <Chip label="No risk factors reported" color="success" />
                  )}
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return renderStudentShell(
    <>
      <TopBar />

      <section className="student-checkin-hero">
        <div>
          <p className="student-checkin-eyebrow">
            {isEditing ? 'Update Entry' : 'Daily Check-in'}
          </p>
          <h1>{isEditing ? "Edit Today's Check-in" : 'How are you today?'}</h1>
          <p>
            Log a quick snapshot of your mood, rest, activity, and stress so
            your support can stay timely.
          </p>
        </div>
        <BarChart className="student-checkin-hero-icon" />
      </section>

      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}

      <form onSubmit={handleSubmit} className="student-checkin-form">
        <Card className="student-checkin-card">
          <CardContent>
            <div className="student-checkin-section-head">
              <div>
                <Typography className="student-checkin-field-title">
                  How are you feeling today?
                </Typography>
                <Typography className="student-checkin-card-note">
                  Selected: {selectedMood?.label}
                </Typography>
              </div>
            </div>

            <div className="student-checkin-mood-grid">
              {moodOptions.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => handleMoodChange(option.value)}
                  className={`student-checkin-mood-option ${
                    formData.mood === option.value ? 'student-checkin-mood-active' : ''
                  }`}
                >
                  <span className="student-checkin-mood-number">{option.value}</span>
                  <span className="student-checkin-mood-name">{option.label}</span>
                  <span className="student-checkin-mood-helper">{option.helper}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="student-checkin-grid student-checkin-grid-2">
          <SliderCard
            icon={<Hotel />}
            label="Sleep Hours Last Night"
            valueLabel={`${formData.sleep_hours} hours`}
          >
            <Slider
              min={0}
              max={12}
              step={0.5}
              value={formData.sleep_hours}
              onChange={handleSliderChange('sleep_hours')}
              valueLabelDisplay="auto"
            />
          </SliderCard>

          <SliderCard
            icon={<FitnessCenter />}
            label="Exercise Minutes Today"
            valueLabel={`${formData.exercise_minutes} minutes`}
          >
            <Slider
              min={0}
              max={180}
              step={5}
              value={formData.exercise_minutes}
              onChange={handleSliderChange('exercise_minutes')}
              valueLabelDisplay="auto"
            />
          </SliderCard>
        </div>

        <div className="student-checkin-grid student-checkin-grid-2">
          <SliderCard
            icon={<Favorite />}
            label="Stress Level"
            valueLabel={`${formData.stress_level}/10`}
          >
            <Slider
              min={1}
              max={10}
              step={1}
              value={formData.stress_level}
              onChange={handleSliderChange('stress_level')}
              valueLabelDisplay="auto"
            />
          </SliderCard>

          <SliderCard
            icon={<Psychology />}
            label="Anxiety Level"
            valueLabel={`${formData.anxiety_level}/10`}
          >
            <Slider
              min={1}
              max={10}
              step={1}
              value={formData.anxiety_level}
              onChange={handleSliderChange('anxiety_level')}
              valueLabelDisplay="auto"
            />
          </SliderCard>
        </div>

        <div className="student-checkin-grid student-checkin-grid-2">
          <Card className="student-checkin-card">
            <CardContent>
              <div className="student-checkin-field-head">
                <span className="student-checkin-card-icon"><Groups /></span>
                <div>
                  <Typography className="student-checkin-field-title">
                    Social Interaction Today
                  </Typography>
                  <Typography className="student-checkin-card-note">
                    Choose the closest match for today.
                  </Typography>
                </div>
              </div>
              <FormControl fullWidth>
                <Select
                  name="social_interaction"
                  value={formData.social_interaction}
                  onChange={handleInputChange}
                  className="student-checkin-select"
                >
                  {socialOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </CardContent>
          </Card>

          <Card className="student-checkin-card student-checkin-risk-factor-card">
            <CardContent>
              <div className="student-checkin-field-head">
                <span className="student-checkin-card-icon"><WarningAmber /></span>
                <div>
                  <Typography className="student-checkin-field-title">
                    Risk Factors
                  </Typography>
                  <Typography className="student-checkin-card-note">
                    Mark anything that applies today.
                  </Typography>
                </div>
              </div>
              <div className="student-checkin-checkboxes">
                <FormControlLabel
                  control={
                    <Checkbox
                      name="negative_thoughts"
                      checked={formData.negative_thoughts}
                      onChange={handleInputChange}
                    />
                  }
                  label="Experiencing negative thoughts"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      name="substance_use_today"
                      checked={formData.substance_use_today}
                      onChange={handleInputChange}
                    />
                  }
                  label="Substance use today"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      name="self_harm_thoughts"
                      checked={formData.self_harm_thoughts}
                      onChange={handleInputChange}
                    />
                  }
                  label="Thoughts of self-harm"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="student-checkin-card">
          <CardContent>
            <Typography className="student-checkin-field-title">
              Additional Notes
            </Typography>
            <Typography className="student-checkin-card-note">
              Optional context your counselor may need.
            </Typography>
            <TextField
              fullWidth
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Share anything else you would like your counselor to know..."
              multiline
              rows={4}
              className="student-checkin-textarea"
            />
          </CardContent>
        </Card>

        <RiskSummary />

        <div className="student-checkin-actions">
          <Button
            variant="outlined"
            startIcon={<BarChart />}
            onClick={() => navigate('/checkin-records')}
            className="student-checkin-secondary-action"
          >
            View All Records
          </Button>
          <div className="student-checkin-actions-right">
            <Button
              onClick={() => (isEditing ? setMode('view') : navigate('/dashboard'))}
              variant="outlined"
              disabled={submitting}
            >
              {isEditing ? 'Cancel' : 'Back'}
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<Save />}
              disabled={submitting}
              className="student-checkin-primary-action"
            >
              {submitting
                ? 'Saving...'
                : isEditing
                  ? 'Update Check-in'
                  : 'Submit Check-in'}
            </Button>
          </div>
        </div>
      </form>
    </>
  );
};

export default DailyCheckin;
