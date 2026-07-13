import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Avatar,
  Button,
  Chip,
  CircularProgress,
  List,
  ListItem,
  TextField,
  Typography,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Send as SendIcon,
  SmartToy as SmartToyIcon,
  SupportAgent as SupportAgentIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { EmergencySOS } from '../components/common/EmergencySOS';
import api from '../services/api';

const formatMessageText = (text) => {
  if (!text) return [];
  return text
    .split(/(?<=[.!?])\s+(?=[A-Z])|(?<=[.!?])\n/g)
    .filter((paragraph) => paragraph.trim().length > 0);
};

const getIntentColor = (intent) => {
  const colors = {
    suicidal_ideation: '#dc2626',
    self_harm: '#ea580c',
    depression: '#2563eb',
    anxiety: '#7c3aed',
    stress: '#be185d',
    loneliness: '#0891b2',
    low_self_worth: '#0f766e',
    support_seeking: '#16a34a',
  };
  return colors[intent] || '#64748b';
};

const SafeTalkBot = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      id: 0,
      type: 'bot',
      text: "Hi, I'm SafeTalk Bot. I'm here to listen and help you talk through what you are feeling. How are you today?",
      timestamp: new Date(),
    },
  ]);
  const [userInput, setUserInput] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const messagesEndRef = useRef(null);

  const loadHistory = useCallback(async () => {
    try {
      const response = await api.get('/api/bot/safetalk/history', {
        params: { limit: 50 },
      });
      setHistory(response.data.messages || []);
    } catch (err) {
      console.error('Error loading history:', err);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        await loadHistory();
      } catch (err) {
        console.error('Error initializing bot:', err);
        setError('Failed to initialize bot. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [loadHistory]);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const userMsg = userInput.trim();

    try {
      setSending(true);
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-user`,
          type: 'user',
          text: userMsg,
          timestamp: new Date(),
        },
      ]);
      setUserInput('');

      const response = await api.post('/api/bot/safetalk/chat', {
        message: userMsg,
      });

      const botData = response.data;
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-bot`,
          type: 'bot',
          text: botData.response,
          is_crisis: botData.is_crisis,
          crisis_resources: botData.crisis_resources,
          timestamp: botData.timestamp,
        },
      ]);

      await loadHistory();
      setError('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

  const renderStudentShell = (content) => (
    <div className="student-shell">
      <Sidebar />
      <main className="student-main">
        <div className="student-page student-bot-page">
          {content}
          <EmergencySOS />
        </div>
      </main>
    </div>
  );

  if (loading) {
    return renderStudentShell(
      <div className="student-chat-loading">
        <CircularProgress />
        <Typography>Loading SafeTalk Bot...</Typography>
      </div>
    );
  }

  return renderStudentShell(
    <>
      <div className="student-chat-topbar">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/chat-support')}
          className="student-chat-back"
        >
          Back to Chat Support
        </Button>
        <Button
          startIcon={<SupportAgentIcon />}
          variant="outlined"
          onClick={() => navigate('/chat-with-counselor')}
          className="student-chat-secondary-action"
        >
          Talk to Counselor
        </Button>
      </div>

      <section className="student-bot-hero">
        <div>
          <p className="student-chat-eyebrow">SafeTalk Bot</p>
          <h1>AI Support Chat</h1>
          <p>
            Talk through your feelings, get grounding prompts, and receive
            immediate supportive responses anytime.
          </p>
        </div>
        <span className="student-bot-hero-icon">
          <SmartToyIcon />
        </span>
      </section>

      {error && (
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <div className="student-bot-shell">
        <aside className="student-bot-history">
          <div className="student-bot-history-head">
            <Typography className="student-bot-history-title">Recent Chats</Typography>
            <Typography className="student-bot-history-subtitle">
              {history.length} saved conversations
            </Typography>
          </div>

          <List className="student-bot-history-list">
            {history.length === 0 ? (
              <ListItem className="student-bot-history-empty">
                <Typography>No previous conversations yet.</Typography>
              </ListItem>
            ) : (
              history.map((entry, index) => (
                <ListItem key={`${entry.created_at}-${index}`} className="student-bot-history-item">
                  <Typography className="student-bot-history-user">
                    You: {entry.user_message?.substring(0, 54)}
                    {entry.user_message?.length > 54 ? '...' : ''}
                  </Typography>
                  <Typography className="student-bot-history-response">
                    Bot: {entry.bot_response?.substring(0, 54)}
                    {entry.bot_response?.length > 54 ? '...' : ''}
                  </Typography>
                  <div className="student-bot-history-meta">
                    {entry.intent && (
                      <Chip
                        label={entry.intent}
                        size="small"
                        sx={{
                          backgroundColor: getIntentColor(entry.intent),
                          color: '#ffffff',
                        }}
                      />
                    )}
                    {entry.created_at && (
                      <span>{new Date(entry.created_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </ListItem>
              ))
            )}
          </List>
        </aside>

        <section className="student-bot-window">
          <div className="student-bot-window-head">
            <div className="student-chat-contact">
              <Avatar className="student-bot-avatar">
                <SmartToyIcon />
              </Avatar>
              <div>
                <Typography className="student-chat-contact-name">
                  SafeTalk Bot
                </Typography>
                <Typography className="student-chat-contact-status">
                  24/7 mental health support
                </Typography>
              </div>
            </div>
          </div>

          <div className="student-chat-messages student-bot-messages">
            {messages.map((message) => {
              const isUserMessage = message.type === 'user';
              const messageClass = isUserMessage
                ? 'student-chat-message student-chat-message-user'
                : 'student-chat-message student-chat-message-counselor';

              return (
                <div key={message.id} className={messageClass}>
                  <Avatar className="student-chat-message-avatar">
                    {isUserMessage ? 'You' : <SmartToyIcon fontSize="small" />}
                  </Avatar>
                  <div className="student-chat-bubble">
                    {formatMessageText(message.text).map((paragraph, index) => (
                      <Typography key={index} className="student-chat-message-text">
                        {paragraph.trim()}
                      </Typography>
                    ))}

                    {message.is_crisis && (
                      <Alert severity="error" className="student-bot-crisis-alert">
                        <Typography className="student-bot-crisis-title">
                          Crisis support recommended
                        </Typography>
                        {message.crisis_resources?.map((resource, index) => (
                          <Typography key={index} className="student-bot-crisis-resource">
                            {resource}
                          </Typography>
                        ))}
                      </Alert>
                    )}

                    <Typography className="student-chat-message-time">
                      {formatTime(message.timestamp)}
                    </Typography>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <footer className="student-chat-composer">
            <div className="student-chat-input-row">
              <TextField
                fullWidth
                multiline
                maxRows={4}
                placeholder="Type your message... Shift+Enter for a new line"
                value={userInput}
                onChange={(event) => setUserInput(event.target.value)}
                onKeyPress={handleKeyPress}
                disabled={sending}
                className="student-chat-input"
              />
              <Button
                variant="contained"
                onClick={handleSendMessage}
                disabled={sending || !userInput.trim()}
                className="student-chat-send student-bot-send"
              >
                {sending ? <CircularProgress size={20} /> : <SendIcon />}
              </Button>
            </div>
          </footer>
        </section>
      </div>
    </>
  );
};

export default SafeTalkBot;
