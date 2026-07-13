import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Paper,
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Avatar,
  List,
  ListItem,
} from '@mui/material';
import {
  Send as SendIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// Function to format long text into readable paragraphs
const formatMessageText = (text) => {
  if (!text) return '';
  return text
    .split(/(?<=[.!?])\s+(?=[A-Z])|(?<=[.!?])\n/g)
    .filter(p => p.trim().length > 0);
};

const SafeTalkBot = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Chat state
  const [messages, setMessages] = useState([
    {
      id: 0,
      type: 'bot',
      text: "👋 Hi! I'm SafeTalk Bot, your 24/7 mental health support companion. I'm here to listen and help. How are you feeling today?",
      timestamp: new Date()
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [history, setHistory] = useState([]);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  
  const messagesEndRef = useRef(null);
  const historyEndRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load bot info and history on mount
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
  }, []);

  const loadHistory = async () => {
    try {
      const response = await api.get('/api/bot/safetalk/history', {
        params: { limit: 50 }
      });
      setHistory(response.data.messages || []);
    } catch (err) {
      console.error('Error loading history:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const userMsg = userInput.trim();
    
    try {
      setSending(true);
      
      // Add user message to display
      setMessages(prev => [...prev, {
        id: prev.length,
        type: 'user',
        text: userMsg,
        timestamp: new Date()
      }]);
      setUserInput('');

      // Send to bot
      const response = await api.post('/api/bot/safetalk/chat', {
        message: userMsg
      });

      const botData = response.data;
      
      // Add bot response
      setMessages(prev => [...prev, {
        id: prev.length,
        type: 'bot',
        text: botData.response,
        is_crisis: botData.is_crisis,
        crisis_resources: botData.crisis_resources,
        timestamp: botData.timestamp
      }]);

      loadHistory();
      setError('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (date) => {
    const now = new Date(date);
    return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getIntentColor = (intent) => {
    const colors = {
      'suicidal_ideation': '#d32f2f',
      'self_harm': '#f57c00',
      'depression': '#1976d2',
      'anxiety': '#7b1fa2',
      'stress': '#c2185b',
      'loneliness': '#0097a7',
      'low_self_worth': '#00796b',
      'support_seeking': '#388e3c',
    };
    return colors[intent] || '#666';
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography>Loading SafeTalk Bot...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="100%" disableGutters sx={{ py: 0, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, borderBottom: '1px solid #e0e0e0', backgroundColor: '#fafafa' }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/dashboard')} 
          sx={{ fontWeight: 'bold', textTransform: 'none' }}
        >
          Back
        </Button>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            🤖 SafeTalk Bot
          </Typography>
          <Typography variant="caption" sx={{ color: '#666' }}>
            💚 24/7 Mental Health Support
          </Typography>
        </Box>
        <Button
          variant="outlined"
          onClick={() => navigate('/chat')}
          sx={{ fontWeight: 'bold', textTransform: 'none' }}
        >
          👥 Talk to Counselor
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ m: 2, mb: 0 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Main Chat Area */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '25% 75%' }, gap: 1, flex: 1, overflow: 'hidden', p: 2 }}>
        
        {/* Chat History Panel - Left */}
        <Paper sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column', overflow: 'hidden', backgroundColor: '#f9f9f9' }}>
          <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              📋 Recent Chats
            </Typography>
            <Typography variant="caption" sx={{ color: '#999' }}>
              {history.length} conversations
            </Typography>
          </Box>

          {/* History List */}
          <Box sx={{ flex: 1, overflowY: 'auto' }}>
            {history.length === 0 ? (
              <Box sx={{ p: 2 }}>
                <Typography variant="caption" sx={{ color: '#999' }}>
                  No previous conversations yet.
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {history.map((msg, idx) => (
                  <ListItem key={idx} sx={{ py: 1.5, px: 1, borderBottom: '1px solid #e0e0e0', '&:hover': { backgroundColor: '#f0f0f0' }, display: 'block', wordBreak: 'break-word' }}>
                    <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5, color: '#667eea' }}>
                      You: {msg.user_message.substring(0, 40)}{msg.user_message.length > 40 ? '...' : ''}
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', color: '#666', mb: 0.5 }}>
                      Bot: {msg.bot_response.substring(0, 40)}{msg.bot_response.length > 40 ? '...' : ''}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                      <Chip
                        label={msg.intent}
                        size="small"
                        sx={{ 
                          backgroundColor: getIntentColor(msg.intent),
                          color: 'white',
                          fontSize: '0.65rem',
                          height: '18px'
                        }}
                      />
                      <Typography variant="caption" sx={{ color: '#999', fontSize: '0.7rem' }}>
                        {new Date(msg.created_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
            <div ref={historyEndRef} />
          </Box>
        </Paper>

        {/* Main Chat Window - Center/Right */}
        <Paper sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Messages Area */}
          <Box sx={{
            flex: 1,
            overflowY: 'auto',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            backgroundColor: '#fafafa'
          }}>
            {messages.map((msg) => {
              const paragraphs = formatMessageText(msg.text);
              return (
                <Box key={msg.id} sx={{ display: 'flex', justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start', gap: 1 }}>
                  {msg.type === 'bot' && (
                    <Avatar sx={{ bgcolor: '#667eea', width: 36, height: 36, flexShrink: 0, mt: 0.5 }}>
                      🤖
                    </Avatar>
                  )}
                  
                  <Box sx={{ maxWidth: '75%' }}>
                    <Paper
                      sx={{
                        backgroundColor: msg.type === 'user' ? '#667eea' : '#e3f2fd',
                        color: msg.type === 'user' ? 'white' : 'black',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        wordWrap: 'break-word',
                        boxShadow: msg.type === 'user' ? '0 1px 3px rgba(0,0,0,0.2)' : '0 1px 2px rgba(0,0,0,0.1)',
                      }}
                    >
                      {/* Display paragraphs separately */}
                      {paragraphs.length > 1 ? (
                        <Box>
                          {paragraphs.map((para, idx) => (
                            <Typography 
                              key={idx} 
                              variant="body2" 
                              sx={{ 
                                mb: idx < paragraphs.length - 1 ? 1 : 0,
                                lineHeight: 1.6,
                                whiteSpace: 'pre-wrap'
                              }}
                            >
                              {para.trim()}
                            </Typography>
                          ))}
                        </Box>
                      ) : (
                        <Typography variant="body2" sx={{ mb: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                          {msg.text}
                        </Typography>
                      )}
                    </Paper>

                    {/* Crisis Alert */}
                    {msg.is_crisis && (
                      <Alert severity="error" sx={{ mt: 1, py: 0.8, fontSize: '0.875rem' }}>
                        <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block' }}>
                          ⚠️ Crisis Detected
                        </Typography>
                        {msg.crisis_resources?.length > 0 && (
                          <Box sx={{ mt: 0.5 }}>
                            <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5 }}>
                              Emergency Resources:
                            </Typography>
                            {msg.crisis_resources.map((resource, idx) => (
                              <Typography key={idx} variant="caption" sx={{ display: 'block', mb: 0.3 }}>
                                📞 {resource}
                              </Typography>
                            ))}
                          </Box>
                        )}
                      </Alert>
                    )}

                    {/* Timestamp */}
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        opacity: 0.6,
                        fontSize: '0.75rem',
                        mt: 0.8,
                        textAlign: msg.type === 'user' ? 'right' : 'left'
                      }}
                    >
                      {formatTime(msg.timestamp)}
                    </Typography>
                  </Box>

                  {msg.type === 'user' && (
                    <Avatar sx={{ bgcolor: '#764ba2', width: 36, height: 36, flexShrink: 0, mt: 0.5 }}>
                      👤
                    </Avatar>
                  )}
                </Box>
              );
            })}

            <div ref={messagesEndRef} />
          </Box>

          {/* Message Input */}
          <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0', backgroundColor: 'white' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                multiline
                maxRows={4}
                placeholder="Type your message here... (Shift+Enter for new line)"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={sending}
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    backgroundColor: '#f5f5f5',
                    '&:hover': { backgroundColor: '#f0f0f0' }
                  }
                }}
              />
              <Button
                variant="contained"
                sx={{
                  backgroundColor: '#667eea',
                  '&:hover': { backgroundColor: '#5568d3' },
                  minWidth: '80px',
                  alignSelf: 'flex-end'
                }}
                onClick={handleSendMessage}
                disabled={sending || !userInput.trim()}
                endIcon={<SendIcon />}
              >
                {sending ? 'Sending...' : 'Send'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default SafeTalkBot;
