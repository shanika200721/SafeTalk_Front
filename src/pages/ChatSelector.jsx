import React from 'react';
import {
  ArrowBack as ArrowBackIcon,
  SmartToy as SmartToyIcon,
  SupportAgent as SupportAgentIcon,
} from '@mui/icons-material';
import { Button, Card, CardContent, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { EmergencySOS } from '../components/common/EmergencySOS';

const supportOptions = [
  {
    title: 'SafeTalk Bot',
    subtitle: '24/7 AI mental health support',
    description:
      'Use instant guided support when you want to talk through feelings, stress, anxiety, or coping steps.',
    action: 'Start Bot Chat',
    path: '/safetalk-bot',
    icon: SmartToyIcon,
    tone: 'bot',
    points: ['Instant responses', 'Available anytime', 'Confidential support'],
  },
  {
    title: 'Chat with Counselor',
    subtitle: 'Connect with a real professional',
    description:
      'Continue a private conversation with an available counselor for personal guidance and follow-up.',
    action: 'Open Counselor Chat',
    path: '/chat-with-counselor',
    icon: SupportAgentIcon,
    tone: 'counselor',
    points: ['Professional support', 'Private messaging', 'Follow-up conversations'],
  },
];

const ChatSelector = () => {
  const navigate = useNavigate();

  return (
    <div className="student-shell">
      <Sidebar />
      <main className="student-main">
        <div className="student-page student-chat-hub-page">
          <div className="student-chat-topbar">
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/dashboard')}
              className="student-chat-back"
            >
              Back to Dashboard
            </Button>
          </div>

          <section className="student-chat-hub-hero">
            <div>
              <p className="student-chat-eyebrow">Chat Support</p>
              <h1>Choose Your Support Channel</h1>
              <p>
                Start with the SafeTalk Bot for immediate support, or connect
                directly with a counselor when you need professional guidance.
              </p>
            </div>
          </section>

          <div className="student-chat-option-grid">
            {supportOptions.map((option) => {
              const Icon = option.icon;

              return (
                <Card
                  key={option.title}
                  className={`student-chat-option-card student-chat-option-${option.tone}`}
                  onClick={() => navigate(option.path)}
                >
                  <CardContent>
                    <div className="student-chat-option-head">
                      <span className="student-chat-option-icon">
                        <Icon />
                      </span>
                      <div>
                        <Typography className="student-chat-option-title">
                          {option.title}
                        </Typography>
                        <Typography className="student-chat-option-subtitle">
                          {option.subtitle}
                        </Typography>
                      </div>
                    </div>

                    <Typography className="student-chat-option-description">
                      {option.description}
                    </Typography>

                    <ul className="student-chat-option-list">
                      {option.points.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>

                    <Button
                      variant="contained"
                      fullWidth
                      className="student-chat-option-action"
                      onClick={(event) => {
                        event.stopPropagation();
                        navigate(option.path);
                      }}
                    >
                      {option.action}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="student-chat-hub-note">
            <CardContent>
              <Typography>
                For urgent safety concerns, use the emergency support button or
                contact local emergency services immediately.
              </Typography>
            </CardContent>
          </Card>

          <EmergencySOS />
        </div>
      </main>
    </div>
  );
};

export default ChatSelector;
