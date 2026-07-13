import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  AttachFile as AttachFileIcon,
  Call as CallIcon,
  Close as CloseIcon,
  Menu as MenuIcon,
  Mic as MicIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  Send as SendIcon,
  Videocam as VideoCallIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { EmergencySOS } from '../components/common/EmergencySOS';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const formatMessageText = (text) => {
  if (!text) return [];
  return text
    .split(/(?<=[.!?])\s+(?=[A-Z])|(?<=[.!?])\n/g)
    .filter((paragraph) => paragraph.trim().length > 0);
};

const ChatSupport = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [allCounselors, setAllCounselors] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [counselorInfo, setCounselorInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const audioChunksRef = useRef([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadData(true);
    const interval = setInterval(() => loadData(false), 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const savedConversationId = localStorage.getItem('selectedChatConversationId');
    if (savedConversationId && conversations.length > 0) {
      let selected = conversations.find(
        (conversation) => conversation.user_id === parseInt(savedConversationId, 10)
      );
      if (!selected && allCounselors.length > 0) {
        selected = allCounselors.find(
          (counselor) => counselor.id === parseInt(savedConversationId, 10)
        );
      }
      if (selected) {
        setSelectedConversation(selected);
      }
    }
  }, [conversations, allCounselors]);

  const loadData = async (isInitialLoad = false) => {
    try {
      if (isInitialLoad) {
        setLoading(true);
      }

      const [convsResponse, counselorsResponse] = await Promise.all([
        api.get('/api/chat/conversations').catch(() => ({ data: [] })),
        api.get('/api/chat/counselors').catch(() => ({ data: [] })),
      ]);

      setConversations(convsResponse.data || []);
      setAllCounselors(counselorsResponse.data || []);
      setError('');
    } catch (err) {
      console.error('Error loading chat data:', err);
      if (isInitialLoad) {
        setError('Failed to load chat data');
      }
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      }
    }
  };

  const loadMessages = useCallback(async () => {
    if (!selectedConversation) return;

    try {
      const receiverId = selectedConversation.user_id || selectedConversation.id;
      console.log(`Loading messages from counselor ID: ${receiverId}`);
      const response = await api.get(`/api/chat/messages/${receiverId}`, {
        params: { limit: 100 },
      });
      setMessages(response.data || []);
    } catch (err) {
      console.error('Error loading messages:', err);
      setMessages([]);
    }
  }, [selectedConversation]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages();
      localStorage.setItem(
        'selectedChatConversationId',
        selectedConversation.user_id || selectedConversation.id
      );
      setCounselorInfo(selectedConversation);
    }
  }, [selectedConversation, loadMessages]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;

    const msgContent = messageText.trim();
    let tempMsgId;

    try {
      setSending(true);
      tempMsgId = Date.now();

      const tempMsg = {
        id: tempMsgId,
        sender_id: user?.id ? parseInt(user.id, 10) : null,
        message: msgContent,
        created_at: new Date().toISOString(),
        message_type: 'text',
      };

      setMessages((prev) => [...prev, tempMsg]);
      setMessageText('');

      const receiverId = parseInt(
        selectedConversation.user_id || selectedConversation.id,
        10
      );
      if (Number.isNaN(receiverId)) {
        throw new Error('Invalid receiver ID');
      }

      const response = await api.post('/api/chat/send', {
        receiver_id: receiverId,
        message: msgContent,
        message_type: 'text',
      });

      setMessages((prev) =>
        prev.map((message) =>
          message.id === tempMsgId
            ? {
                ...response.data,
                sender_id: parseInt(response.data.sender_id, 10),
              }
            : message
        )
      );

      await loadData(false);
    } catch (err) {
      console.error('Error sending message:', err);

      let errorMsg = 'Unknown error';
      if (Array.isArray(err.response?.data)) {
        errorMsg =
          err.response.data
            .map((item) => `${item.loc?.[1] || 'field'}: ${item.msg}`)
            .join('; ') || 'Validation error';
      } else if (err.response?.data?.detail) {
        errorMsg =
          typeof err.response.data.detail === 'string'
            ? err.response.data.detail
            : JSON.stringify(err.response.data.detail);
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.message) {
        errorMsg = err.message;
      }

      setError(`Failed to send message: ${errorMsg}`);
      if (tempMsgId) {
        setMessages((prev) => prev.filter((message) => message.id !== tempMsgId));
      }
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

  const formatTime = (timestamp) =>
    new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

  const getInitials = (name) =>
    name
      ?.split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'C';

  const handleCloseMenu = () => {
    setMenuAnchor(null);
  };

  const handleVoiceCall = () => {
    alert(`Initiating voice call with ${counselorInfo?.full_name}...`);
    console.log('Voice call initiated to:', counselorInfo?.id);
    handleCloseMenu();
  };

  const handleVideoCall = () => {
    alert(`Initiating video call with ${counselorInfo?.full_name}...`);
    console.log('Video call initiated to:', counselorInfo?.id);
    handleCloseMenu();
  };

  const handleStartVoiceMessage = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);

        try {
          if (!selectedConversation) {
            setError('No conversation selected');
            return;
          }

          const receiverId = selectedConversation.user_id || selectedConversation.id;
          if (!receiverId) {
            setError('Invalid receiver ID');
            return;
          }

          const formData = new FormData();
          formData.append('audio', audioBlob, 'voice_message.wav');
          formData.append('receiver_id', receiverId.toString());

          const tempMsgId = Date.now();
          const tempMsg = {
            id: tempMsgId,
            sender_id: user?.id,
            message: 'Voice message',
            created_at: new Date().toISOString(),
            message_type: 'voice',
            audio_url: audioUrl,
          };

          setMessages((prev) => [...prev, tempMsg]);
          setSending(true);

          const response = await api.post('/api/chat/send-voice', formData);

          setMessages((prev) =>
            prev.map((message) =>
              message.id === tempMsgId
                ? {
                    ...response.data,
                    audio_url: audioUrl,
                    sender_id: parseInt(response.data.sender_id, 10),
                  }
                : message
            )
          );
        } catch (err) {
          console.error('Error sending voice message:', err);

          let errorMsg = 'Failed to send voice message';
          if (err.response?.data?.detail) {
            errorMsg = Array.isArray(err.response.data.detail)
              ? err.response.data.detail
                  .map((item) => `${item.loc?.[1]}: ${item.msg}`)
                  .join('; ')
              : err.response.data.detail;
          } else if (err.message) {
            errorMsg = err.message;
          }

          setError(errorMsg);
          setMessages((prev) =>
            prev.filter((message) => message.message !== 'Voice message')
          );
        } finally {
          setSending(false);
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
          }
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError(`Unable to access microphone: ${err.message}`);
    }
  };

  const handleStopVoiceMessage = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !selectedConversation) return;

    try {
      setSending(true);

      const tempMsg = {
        id: Date.now(),
        sender_id: user?.id,
        message: file.name,
        created_at: new Date().toISOString(),
        message_type: 'file',
        file_name: file.name,
        file_size: `${(file.size / 1024).toFixed(2)} KB`,
      };

      setMessages((prev) => [...prev, tempMsg]);

      const formData = new FormData();
      formData.append('file', file);
      formData.append(
        'receiver_id',
        selectedConversation.user_id || selectedConversation.id
      );

      console.log('File ready to send:', file.name, formData);
      await loadData(false);
    } catch (err) {
      console.error('Error sending file:', err);
      setError('Failed to send file');
    } finally {
      setSending(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAttachFile = () => {
    fileInputRef.current?.click();
  };

  const selectConversation = (conversation) => {
    setSelectedConversation(conversation);
    setMobileOpen(false);
  };

  const renderStudentShell = (content) => (
    <div className="student-shell">
      <Sidebar />
      <main className="student-main">
        <div className="student-page student-chat-page">
          {content}
          <EmergencySOS />
        </div>
      </main>
    </div>
  );

  const renderConversationList = () => (
    <aside className={`student-chat-sidebar ${mobileOpen ? 'student-chat-sidebar-open' : ''}`}>
      <div className="student-chat-sidebar-head">
        <div>
          <Typography className="student-chat-sidebar-title">Counselors</Typography>
          <Typography className="student-chat-sidebar-subtitle">
            {conversations.length} active, {allCounselors.length} available
          </Typography>
        </div>
        <IconButton
          className="student-chat-close-list"
          onClick={() => setMobileOpen(false)}
          aria-label="Close counselor list"
        >
          <CloseIcon />
        </IconButton>
      </div>

      <List className="student-chat-list">
        {conversations.length > 0 && (
          <>
            <ListItem className="student-chat-list-label">
              <Typography>Active Conversations</Typography>
            </ListItem>
            {conversations.map((conversation) => (
              <ListItemButton
                key={`conversation-${conversation.id}`}
                selected={selectedConversation?.id === conversation.id}
                onClick={() => selectConversation(conversation)}
                className="student-chat-list-item"
              >
                <Avatar className="student-chat-avatar">
                  {getInitials(conversation.full_name)}
                </Avatar>
                <ListItemText
                  primary={conversation.full_name}
                  secondary={conversation.last_message || 'No messages yet'}
                  primaryTypographyProps={{ className: 'student-chat-list-name' }}
                  secondaryTypographyProps={{ className: 'student-chat-list-preview' }}
                />
                {conversation.unread_count > 0 && (
                  <Chip label={conversation.unread_count} size="small" color="error" />
                )}
              </ListItemButton>
            ))}
            <Divider />
          </>
        )}

        {allCounselors.length > 0 && (
          <>
            <ListItem className="student-chat-list-label">
              <Typography>Available Counselors</Typography>
            </ListItem>
            {allCounselors.map((counselor) => {
              const isInConversations = conversations.some(
                (conversation) => conversation.id === counselor.id
              );

              return (
                <ListItemButton
                  key={`counselor-${counselor.id}`}
                  selected={selectedConversation?.id === counselor.id}
                  onClick={() => selectConversation(counselor)}
                  className="student-chat-list-item"
                  sx={{ opacity: isInConversations ? 0.72 : 1 }}
                >
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    variant="dot"
                    className="student-chat-online-badge"
                  >
                    <Avatar className="student-chat-avatar student-chat-avatar-online">
                      {getInitials(counselor.full_name)}
                    </Avatar>
                  </Badge>
                  <ListItemText
                    primary={counselor.full_name}
                    secondary={`Online - ${counselor.role || 'Counselor'}`}
                    primaryTypographyProps={{ className: 'student-chat-list-name' }}
                    secondaryTypographyProps={{ className: 'student-chat-list-preview' }}
                  />
                </ListItemButton>
              );
            })}
          </>
        )}

        {conversations.length === 0 && allCounselors.length === 0 && (
          <ListItem>
            <ListItemText
              primary="No counselors available"
              secondary="Please check back later."
            />
          </ListItem>
        )}
      </List>
    </aside>
  );

  const renderMessages = () => {
    if (!selectedConversation || !counselorInfo) {
      return (
        <div className="student-chat-empty">
          <div className="student-chat-empty-icon">C</div>
          <Typography className="student-chat-empty-title">Select a counselor</Typography>
          <Typography className="student-chat-empty-text">
            Choose someone from the list to begin or continue a private support chat.
          </Typography>
        </div>
      );
    }

    if (messages.length === 0) {
      return (
        <div className="student-chat-empty">
          <div className="student-chat-empty-icon">{getInitials(counselorInfo.full_name)}</div>
          <Typography className="student-chat-empty-title">Start the conversation</Typography>
          <Typography className="student-chat-empty-text">
            Send your first message to {counselorInfo.full_name}.
          </Typography>
        </div>
      );
    }

    return messages.map((message) => {
      const currentUserId = user?.id ? parseInt(user.id, 10) : null;
      const msgSenderId = message.sender_id ? parseInt(message.sender_id, 10) : null;
      const isUserMessage = currentUserId && msgSenderId === currentUserId;
      const bubbleClass = isUserMessage
        ? 'student-chat-message student-chat-message-user'
        : 'student-chat-message student-chat-message-counselor';

      return (
        <div key={message.id} className={bubbleClass}>
          <Avatar className="student-chat-message-avatar">
            {isUserMessage ? 'You' : getInitials(counselorInfo.full_name)}
          </Avatar>
          <div className="student-chat-bubble">
            {message.message_type === 'voice' ? (
              <div className="student-chat-audio">
                <audio controls controlsList="nodownload">
                  <source
                    src={`http://localhost:8000/api/chat/audio/${
                      (message.message || '').includes('/')
                        ? message.message.split('/').pop()
                        : (message.message || '').split('\\').pop()
                    }`}
                    type="audio/wav"
                  />
                  Your browser does not support audio.
                </audio>
              </div>
            ) : (
              formatMessageText(message.message).map((paragraph, idx) => (
                <Typography key={idx} className="student-chat-message-text">
                  {paragraph}
                </Typography>
              ))
            )}
            <Typography className="student-chat-message-time">
              {formatTime(message.created_at)}
            </Typography>
          </div>
        </div>
      );
    });
  };

  if (loading) {
    return renderStudentShell(
      <div className="student-chat-loading">
        <CircularProgress />
        <Typography>Loading counselor chat...</Typography>
      </div>
    );
  }

  return renderStudentShell(
    <>
      <div className="student-chat-topbar">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashboard')}
          className="student-chat-back"
        >
          Back to Dashboard
        </Button>
        <Button
          startIcon={<RefreshIcon />}
          onClick={() => loadData(false)}
          className="student-chat-secondary-action"
          variant="outlined"
        >
          Refresh
        </Button>
      </div>

      <section className="student-chat-hero">
        <div>
          <p className="student-chat-eyebrow">Private Support</p>
          <h1>Counselor Chat</h1>
          <p>
            Message a counselor securely, continue recent conversations, or start
            with an available professional.
          </p>
        </div>
        <div className="student-chat-hero-stats">
          <span>{conversations.length}</span>
          <p>Active chats</p>
        </div>
      </section>

      {error && (
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <div className="student-chat-shell">
        <button
          type="button"
          className="student-chat-mobile-list-btn"
          onClick={() => setMobileOpen(true)}
        >
          <MenuIcon fontSize="small" />
          Counselors
        </button>

        {renderConversationList()}

        <section className="student-chat-window">
          <header className="student-chat-window-head">
            {counselorInfo ? (
              <div className="student-chat-contact">
                <Avatar className="student-chat-avatar student-chat-contact-avatar">
                  {getInitials(counselorInfo.full_name)}
                </Avatar>
                <div>
                  <Typography className="student-chat-contact-name">
                    {counselorInfo.full_name}
                  </Typography>
                  <Typography className="student-chat-contact-status">
                    Counselor Support
                  </Typography>
                </div>
              </div>
            ) : (
              <div>
                <Typography className="student-chat-contact-name">
                  No counselor selected
                </Typography>
                <Typography className="student-chat-contact-status">
                  Choose a counselor to begin.
                </Typography>
              </div>
            )}

            <div className="student-chat-tools">
              <Tooltip title="Voice Call">
                <span>
                  <IconButton
                    onClick={handleVoiceCall}
                    disabled={!counselorInfo}
                    className="student-chat-tool-btn"
                  >
                    <CallIcon />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Video Call">
                <span>
                  <IconButton
                    onClick={handleVideoCall}
                    disabled={!counselorInfo}
                    className="student-chat-tool-btn"
                  >
                    <VideoCallIcon />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="More Options">
                <span>
                  <IconButton
                    onClick={(event) => setMenuAnchor(event.currentTarget)}
                    disabled={!counselorInfo}
                    className="student-chat-tool-btn"
                  >
                    <MoreVertIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </div>
          </header>

          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={handleCloseMenu}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem
              onClick={() => {
                handleStartVoiceMessage();
                handleCloseMenu();
              }}
            >
              <MicIcon sx={{ mr: 1 }} /> Send Voice Message
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleAttachFile();
                handleCloseMenu();
              }}
            >
              <AttachFileIcon sx={{ mr: 1 }} /> Share Document
            </MenuItem>
          </Menu>

          <div className="student-chat-messages">
            {renderMessages()}
            <div ref={messagesEndRef} />
          </div>

          <footer className="student-chat-composer">
            {isRecording && (
              <div className="student-chat-recording">
                <span />
                <Typography>Recording voice message...</Typography>
                <Button size="small" variant="outlined" onClick={handleStopVoiceMessage}>
                  Stop and Send
                </Button>
              </div>
            )}

            <div className="student-chat-input-row">
              <Tooltip title={isRecording ? 'Stop Recording' : 'Record Voice Message'}>
                <span>
                  <IconButton
                    onClick={isRecording ? handleStopVoiceMessage : handleStartVoiceMessage}
                    disabled={!selectedConversation || sending}
                    className="student-chat-tool-btn"
                  >
                    <MicIcon />
                  </IconButton>
                </span>
              </Tooltip>
              <TextField
                fullWidth
                multiline
                maxRows={3}
                placeholder={
                  selectedConversation
                    ? 'Type your message...'
                    : 'Select a counselor to start messaging'
                }
                value={messageText}
                onChange={(event) => setMessageText(event.target.value)}
                onKeyPress={handleKeyPress}
                disabled={sending || isRecording || !selectedConversation}
                className="student-chat-input"
              />
              <Tooltip title="Share Document">
                <span>
                  <IconButton
                    onClick={handleAttachFile}
                    disabled={sending || isRecording || !selectedConversation}
                    className="student-chat-tool-btn"
                  >
                    <AttachFileIcon />
                  </IconButton>
                </span>
              </Tooltip>
              <Button
                variant="contained"
                onClick={handleSendMessage}
                disabled={sending || !messageText.trim() || isRecording || !selectedConversation}
                className="student-chat-send"
              >
                {sending ? <CircularProgress size={20} /> : <SendIcon />}
              </Button>
            </div>
          </footer>

          <input
            ref={fileInputRef}
            type="file"
            hidden
            onChange={handleFileSelect}
            accept="*/*"
          />
        </section>
      </div>
    </>
  );
};

export default ChatSupport;
