import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Avatar,
  Button,
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemButton,
  TextField,
  Typography,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Call as CallIcon,
  Groups as GroupsIcon,
  MenuBook as MenuBookIcon,
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

const getTopicColor = (topic) => {
  const colors = {
    'Safety support': '#b91c1c',
    'Exam stress': '#7c3aed',
    'Sleep support': '#2563eb',
    'Anxiety support': '#0f766e',
    'Low mood': '#0891b2',
    Greeting: '#64748b',
    Information: '#475569',
    'Coping exercise': '#16a34a',
    'General support': '#0369a1',
  };
  return colors[topic] || '#64748b';
};

const createWelcomeMessage = () => ({
  id: 0,
  type: 'bot',
  text: "Hi. I'm SafeTalk Bot. I can offer supportive conversation and safety guidance, but I'm not a replacement for professional or emergency care. How are you feeling today?",
  timestamp: new Date(),
});

const mapApiMessages = (items = []) => {
  const mapped = [];
  items.forEach((entry) => {
    mapped.push({
      id: `${entry.id}-user`,
      type: 'user',
      text: entry.user_message,
      timestamp: entry.created_at,
    });
    mapped.push({
      id: `${entry.id}-bot`,
      type: 'bot',
      text: entry.bot_response,
      route: entry.route,
      severity: entry.severity,
      legacy_response: entry.legacy_response,
      response_policy_version: entry.response_policy_version,
      timestamp: entry.created_at,
    });
  });
  return mapped;
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
  const [conversations, setConversations] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [conversationLoading, setConversationLoading] = useState(false);
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

  const loadConversations = useCallback(async () => {
    try {
      const response = await api.get('/api/bot/safetalk/conversations');
      const activeConversations = response.data || [];
      setConversations(activeConversations);
      return activeConversations;
    } catch (err) {
      console.error('Error loading SafeTalk conversations:', err);
      return [];
    }
  }, []);

  const loadConversation = useCallback(async (id) => {
    if (!id) return;
    try {
      setConversationLoading(true);
      const response = await api.get(`/api/bot/safetalk/conversations/${id}`, {
        params: { limit: 100 },
      });
      setConversationId(response.data.conversation.id);
      localStorage.setItem('selectedSafeTalkConversationId', String(response.data.conversation.id));
      const loadedMessages = mapApiMessages(response.data.messages || []);
      setMessages(loadedMessages.length > 0 ? loadedMessages : [createWelcomeMessage()]);
      setError('');
    } catch (err) {
      console.error('Error loading SafeTalk conversation:', err);
      setError('Could not open that conversation. It may no longer be available.');
    } finally {
      setConversationLoading(false);
    }
  }, []);

  const startNewConversation = useCallback(async () => {
    const response = await api.post('/api/bot/safetalk/conversations', {});
    setConversationId(response.data.id);
    localStorage.setItem('selectedSafeTalkConversationId', String(response.data.id));
    setMessages([createWelcomeMessage()]);
    await loadConversations();
    return response.data.id;
  }, [loadConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const [, loadedConversations] = await Promise.all([loadHistory(), loadConversations()]);
        const savedId = Number(localStorage.getItem('selectedSafeTalkConversationId'));
        const selected = loadedConversations.find((conversation) => conversation.id === savedId) || loadedConversations[0];
        if (selected) {
          await loadConversation(selected.id);
        }
      } catch (err) {
        console.error('Error initializing bot:', err);
        setError('Failed to initialize bot. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [loadHistory, loadConversations, loadConversation]);

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

      const activeConversationId = conversationId || (await startNewConversation());
      const response = await api.post('/api/bot/safetalk/chat', {
        message: userMsg,
        conversation_id: activeConversationId,
      });

      const botData = response.data;
      setConversationId(botData.conversation_id || activeConversationId);
      localStorage.setItem('selectedSafeTalkConversationId', String(botData.conversation_id || activeConversationId));
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-bot`,
          type: 'bot',
          text: botData.message || botData.response,
          route: botData.route,
          severity: botData.severity,
          safety_check_required: botData.safety_check_required,
          human_contact_recommended: botData.human_contact_recommended,
          recommended_actions: botData.recommended_actions || [],
          resource_actions: botData.resource_actions || [],
          limitations: botData.limitations || [],
          timestamp: botData.timestamp,
        },
      ]);

      await Promise.all([loadHistory(), loadConversations()]);
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
        <Button
          variant="outlined"
          onClick={startNewConversation}
          className="student-chat-secondary-action"
        >
          New Chat
        </Button>
      </div>

      <section className="student-bot-hero">
        <div>
          <p className="student-chat-eyebrow">SafeTalk Bot</p>
          <h1>AI Support Chat</h1>
          <p>
            Talk through your feelings, get grounding prompts, and receive
            non-diagnostic safety guidance anytime.
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

      <Alert severity="info">
        SafeTalk is not a replacement for professional or emergency care. It cannot contact a counselor or emergency services for you.
      </Alert>

      <div className="student-bot-shell">
        <aside className="student-bot-history">
          <div className="student-bot-history-head">
            <Typography className="student-bot-history-title">Recent Chats</Typography>
              <Typography className="student-bot-history-subtitle">
              {conversations.length || history.length} saved conversations
            </Typography>
          </div>

          <List className="student-bot-history-list">
            {conversations.length === 0 ? (
              <ListItem className="student-bot-history-empty">
                <Typography>No previous conversations yet.</Typography>
              </ListItem>
            ) : (
              conversations.map((entry) => (
                <ListItemButton
                  key={entry.id}
                  selected={entry.id === conversationId}
                  className="student-bot-history-item"
                  onClick={() => loadConversation(entry.id)}
                >
                  <Typography className="student-bot-history-user">
                    {entry.title || entry.topic_label || 'SafeTalk conversation'}
                  </Typography>
                  <Typography className="student-bot-history-response">
                    {entry.last_message_preview || 'No messages yet'}
                  </Typography>
                  <div className="student-bot-history-meta">
                    {entry.topic_label && (
                      <Chip
                        label={entry.topic_label}
                        size="small"
                        sx={{
                          backgroundColor: getTopicColor(entry.topic_label),
                          color: '#ffffff',
                        }}
                      />
                    )}
                    {entry.legacy_response && (
                      <Chip label="Earlier conversation" size="small" variant="outlined" />
                    )}
                    {entry.updated_at && (
                      <span>{new Date(entry.updated_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </ListItemButton>
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
                  Support chat - not emergency service
                </Typography>
              </div>
            </div>
          </div>

          <div className="student-chat-messages student-bot-messages">
            {conversationLoading && (
              <div className="student-chat-loading">
                <CircularProgress size={24} />
                <Typography>Opening conversation...</Typography>
              </div>
            )}
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

                    {message.legacy_response && (
                      <Alert severity="info" className="student-bot-crisis-alert">
                        Earlier conversation - generated by a previous response version.
                      </Alert>
                    )}

                    {message.resource_actions?.length > 0 && (
                      <Alert severity={message.human_contact_recommended ? 'error' : 'info'} className="student-bot-crisis-alert">
                        <Typography className="student-bot-crisis-title">
                          {message.human_contact_recommended ? 'Immediate support recommended' : 'Support options'}
                        </Typography>
                        <div className="student-bot-resource-actions">
                          {message.resource_actions.map((action, index) => {
                            const label = action.label || 'Open support resources';
                            const isEmergency = label === 'Call emergency services';
                            const Icon = isEmergency
                              ? CallIcon
                              : label === 'Contact someone I trust'
                                ? GroupsIcon
                                : MenuBookIcon;
                            return (
                              <Button
                                key={`${label}-${index}`}
                                size="small"
                                variant={isEmergency ? 'contained' : 'outlined'}
                                color={isEmergency ? 'error' : 'primary'}
                                startIcon={<Icon />}
                                aria-label={label}
                                onClick={() => {
                                  if (action.type === 'support_resources' || action.type === 'open_in_app') {
                                    navigate(action.target || '/resources');
                                  } else if (action.type === 'emergency') {
                                    setError('SafeTalk cannot place calls. Please use your phone to contact local emergency services now.');
                                  } else if (action.type === 'trusted_contact') {
                                    setError('Please call or message someone you trust directly. SafeTalk has not contacted anyone.');
                                  }
                                }}
                              >
                                {label}
                              </Button>
                            );
                          })}
                        </div>
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
