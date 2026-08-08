import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Badge,
  Chip,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Send as SendIcon,
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Call as CallIcon,
  Videocam as VideoCallIcon,
  Mic as MicIcon,
  AttachFile as AttachFileIcon,
  MoreVert as MoreVertIcon,
  AccountCircle as AccountCircleIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import counselorService from '../services/counselorService';
import VideoBackground from '../components/common/VideoBackground';
import AuthenticatedAudio from '../components/common/AuthenticatedAudio';

const SRI_LANKA_TIME_ZONE = 'Asia/Colombo';

const parseServerDate = (timestamp) => {
  if (!timestamp) return null;
  const value = String(timestamp);
  const hasTimezone = /(?:z|[+-]\d{2}:?\d{2})$/i.test(value);
  return new Date(hasTimezone ? value : `${value}Z`);
};

const formatMessageText = (text) => {
  if (!text) return [];
  return text
    .split(/(?<=[.!?])\s+(?=[A-Z])|(?<=[.!?])\n/g)
    .filter(p => p.trim().length > 0);
};

const getChatStudentId = (student) => Number(student?.student?.id || student?.user_id || student?.id);

const normalizeChatStudent = (student) => {
  const studentId = getChatStudentId(student);
  return {
    ...student,
    id: studentId,
    user_id: studentId,
    full_name: student?.student?.full_name || student?.full_name || student?.name || student?.username || 'Student',
    email: student?.student?.email || student?.email || '',
    last_message: student?.last_message || null,
    last_message_time: student?.last_message_time || student?.last_checkin || student?.last_assessment || null,
    unread_count: Number(student?.unread_count || 0),
    latest_message_type: student?.latest_message_type || null,
    conversation_id: student?.conversation_id || null,
  };
};

const CounselorChat = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State
  const [conversations, setConversations] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [studentInfo, setStudentInfo] = useState(null);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Media state
  const [isRecording, setIsRecording] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  
  // Refs
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversations on mount
  useEffect(() => {
    loadData(true);
    const interval = setInterval(() => loadData(false), 5000);
    return () => clearInterval(interval);
  }, []);

  // Restore selected student from localStorage
  useEffect(() => {
    const savedStudentId =
      localStorage.getItem('selectedChatStudentId') ||
      localStorage.getItem('selectedChatConversationId');
    if (savedStudentId && conversations.length > 0 && !selectedStudent) {
      const selected = conversations.find(c => getChatStudentId(c) === parseInt(savedStudentId, 10));
      if (selected) {
        setSelectedStudent(selected);
      }
    }
  }, [conversations, selectedStudent]);

  // Load messages when student selected
  useEffect(() => {
    if (selectedStudent) {
      loadMessages();
      const studentId = getChatStudentId(selectedStudent);
      localStorage.setItem('selectedChatStudentId', String(studentId));
      localStorage.setItem('selectedChatConversationId', String(studentId));
      setStudentInfo(selectedStudent);
    }
  }, [selectedStudent]);

  const loadData = async (isInitialLoad = false) => {
    try {
      if (isInitialLoad) {
        setLoading(true);
      }
      
      let conversationRows = [];
      let conversationLoadFailed = false;
      try {
        const response = await api.get('/api/chat/conversations');
        conversationRows = response.data || [];
      } catch (conversationErr) {
        conversationLoadFailed = true;
        console.error('Error loading recent chat conversations:', conversationErr);
      }

      let assignedStudents = [];
      try {
        const assigned = await counselorService.getAllStudents({ limit: 200 });
        assignedStudents = assigned.students || [];
      } catch (assignedErr) {
        console.warn('Unable to load assigned students for chat list:', assignedErr);
      }

      const merged = new Map();
      assignedStudents.map(normalizeChatStudent).forEach((student) => {
        if (student.user_id) merged.set(student.user_id, student);
      });
      conversationRows.map(normalizeChatStudent).forEach((conversation) => {
        if (!conversation.user_id) return;
        merged.set(conversation.user_id, {
          ...(merged.get(conversation.user_id) || {}),
          ...conversation,
        });
      });

      const nextConversations = [...merged.values()].sort((a, b) => {
        const aTime = parseServerDate(a.last_message_time)?.getTime() || 0;
        const bTime = parseServerDate(b.last_message_time)?.getTime() || 0;
        if (aTime !== bTime) return bTime - aTime;
        return (a.full_name || '').localeCompare(b.full_name || '');
      });

      setConversations(nextConversations);
      setSelectedStudent((current) => {
        if (!current) return current;
        return nextConversations.find((student) => getChatStudentId(student) === getChatStudentId(current)) || current;
      });
      setError(conversationLoadFailed ? 'Assigned students loaded, but recent chat previews could not be refreshed.' : '');
    } catch (err) {
      console.error('Error loading conversations:', err);
      if (isInitialLoad) {
        setError('Failed to load conversations');
      }
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      }
    }
  };

  const loadMessages = async () => {
    if (!selectedStudent) return;
    try {
      const receiverId = getChatStudentId(selectedStudent);
      const response = await api.get(`/api/chat/messages/${receiverId}`, {
        params: { limit: 100 }
      });
      setMessages(response.data || []);
    } catch (err) {
      console.error('Error loading messages:', err);
      setMessages([]);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedStudent) {
      console.warn('⚠️ Cannot send: messageText empty or no selectedStudent');
      return;
    }

    const msgContent = messageText.trim();
    let tempMsgId; // Declare outside try block so it's accessible in catch block
    
    try {
      setSending(true);
      
      // Debug logging
      
      tempMsgId = Date.now();
      const tempMsg = {
        id: tempMsgId,
        sender_id: user?.id ? parseInt(user.id) : null,
        message: msgContent,
        created_at: new Date().toISOString(),
        message_type: 'text'
      };
      
      setMessages([...messages, tempMsg]);
      setMessageText('');

      const receiverId = parseInt(getChatStudentId(selectedStudent), 10);
      if (isNaN(receiverId)) {
        throw new Error(`Invalid receiver_id: selectedStudent=${JSON.stringify(selectedStudent)}`);
      }
      
      const payload = {
        receiver_id: receiverId,
        message: msgContent,
        message_type: 'text'
      };
      
      
      const response = await api.post('/api/chat/send', payload);


      setMessages(prev => 
        prev.map(m => m.id === tempMsgId ? {
          ...response.data,
          sender_id: parseInt(response.data.sender_id)
        } : m)
      );
      
      try {
        await loadData(false);
      } catch (err) {
        console.warn('Warning: Failed to refresh conversations list:', err);
      }
    } catch (err) {
      console.error('❌ Error sending message:', err);
      console.error('Full error response:', err.response?.data);
      
      // Extract error message safely - handle Pydantic validation errors (arrays of error objects)
      let errorMsg = 'Unknown error';
      
      if (Array.isArray(err.response?.data)) {
        // Pydantic validation error - array of error objects
        const errors = err.response.data
          .map(e => `${e.loc?.[1] || 'field'}: ${e.msg || 'validation error'}`)
          .join('; ');
        errorMsg = errors || 'Validation error';
      } else if (err.response?.data?.detail) {
        errorMsg = typeof err.response.data.detail === 'string' 
          ? err.response.data.detail 
          : JSON.stringify(err.response.data.detail);
      } else if (err.message && typeof err.message === 'string' && err.message !== '[object Object]') {
        errorMsg = err.message;
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      }
      
      setError(`Failed to send message: ${errorMsg}`);
      if (tempMsgId) {
        setMessages(prev => prev.filter(m => m.id !== tempMsgId));
      }
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    const date = parseServerDate(timestamp);
    if (!date || Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('en-LK', {
      timeZone: SRI_LANKA_TIME_ZONE,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase() || 'S';
  };

  // Call handlers
  const handleVoiceCall = () => {
    alert(`Initiating voice call with ${studentInfo?.full_name}...`);
  };

  const handleVideoCall = () => {
    alert(`Initiating video call with ${studentInfo?.full_name}...`);
  };

  // Voice message handlers
  const handleStartVoiceMessage = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream; // Save stream for later use
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
        
        
        // Send voice message
        try {
          if (!selectedStudent) {
            setError('No student selected');
            return;
          }
          
          const receiverId = getChatStudentId(selectedStudent);
          if (!receiverId) {
            setError('Invalid receiver ID');
            return;
          }
          
          const formData = new FormData();
          formData.append('audio', audioBlob, 'voice_message.wav');
          formData.append('receiver_id', receiverId.toString());


          // Add temporary voice message to UI
          const tempMsgId = Date.now();
          const tempMsg = {
            id: tempMsgId,
            sender_id: user?.id,
            message: '🎙️ Voice message',
            created_at: new Date().toISOString(),
            message_type: 'voice',
            audio_url: audioUrl
          };
          setMessages([...messages, tempMsg]);
          setSending(true);

          // Upload to server - use axios with proper headers
          const response = await api.post('/api/chat/send-voice', formData);
          
          
          // Update with server response
          setMessages(prev => 
            prev.map(m => m.id === tempMsgId ? {
              ...response.data,
              audio_url: audioUrl,
              sender_id: parseInt(response.data.sender_id)
            } : m)
          );
          setSending(false);
        } catch (err) {
          console.error('❌ Error sending voice message:', err);
          console.error('Response data:', err.response?.data);
          console.error('Status:', err.response?.status);
          console.error('Message:', err.message);
          
          let errorMsg = 'Failed to send voice message';
          if (err.response?.data?.detail) {
            if (Array.isArray(err.response.data.detail)) {
              errorMsg = err.response.data.detail
                .map(e => `${e.loc?.[1]}: ${e.msg}`)
                .join('; ');
            } else {
              errorMsg = err.response.data.detail;
            }
          } else if (err.message) {
            errorMsg = err.message;
          }
          
          setError(errorMsg);
          setSending(false);
          // Remove the failed temp message
          setMessages(prev => prev.filter(m => m.message !== '🎙️ Voice message'));
        }
        
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setMenuAnchor(null);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Unable to access microphone: ' + err.message);
    }
  };

  const handleStopVoiceMessage = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleAttachFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setSending(true);
      const tempMsg = {
        id: Date.now(),
        sender_id: user?.id,
        message: `📄 ${file.name}`,
        created_at: new Date().toISOString(),
        message_type: 'file',
        file_name: file.name,
        file_size: (file.size / 1024).toFixed(2) + ' KB'
      };
      
      setMessages([...messages, tempMsg]);
      // TODO: Upload to server
      
      loadData(false);
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

  if (loading) {
    return (
      <VideoBackground overlay={true}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '80vh'
        }}>
          <Box sx={{ textAlign: 'center', color: 'white' }}>
            <CircularProgress sx={{ mb: 2, color: 'white' }} />
            <Typography>Loading conversations...</Typography>
          </Box>
        </Box>
      </VideoBackground>
    );
  }

  return (
    <VideoBackground overlay={true}>
      <Box sx={{
        display: 'flex',
        height: '100vh',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <Box sx={{
          p: 2,
          bgcolor: 'rgba(0,0,0,0.3)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 10
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              color="inherit"
              onClick={() => setMobileOpen((value) => !value)}
              size="small"
              sx={{ display: { xs: 'inline-flex', md: 'none' } }}
              aria-label="Open student conversations"
            >
              <MenuIcon />
            </IconButton>
            <IconButton 
              color="inherit" 
              onClick={() => navigate(-1)}
              size="small"
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 'bold', textTransform: 'none' }}>
              💬 Student Support Chat
            </Typography>
          </Box>
          <Tooltip title="Refresh">
            <IconButton 
              color="inherit"
              onClick={() => loadData(false)}
              size="small"
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert 
            severity="error" 
            onClose={() => setError('')}
            sx={{ m: 1 }}
          >
            {error}
          </Alert>
        )}

        {/* Main Content */}
        <Box sx={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden'
        }}>
          {/* Students List */}
          <Box sx={{
            width: { xs: (mobileOpen || !selectedStudent) ? '100%' : '0', md: '350px' },
            minWidth: { xs: (mobileOpen || !selectedStudent) ? '100%' : '0', md: '350px' },
            flexShrink: 0,
            bgcolor: 'white',
            borderRight: '1px solid #e0e0e0',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            overflowX: 'hidden',
            transition: 'width 0.3s'
          }}>
            <Box sx={{
              p: 2,
              bgcolor: '#f5f5f5',
              borderBottom: '1px solid #e0e0e0'
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#666' }}>
                👥 Student Conversations ({conversations.length})
              </Typography>
            </Box>

            {conversations.length === 0 ? (
              <Box sx={{
                p: 3,
                textAlign: 'center',
                color: '#999'
              }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569' }}>
                  No student chats yet
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', mt: 0.75, color: '#64748b' }}>
                  Assigned students and new messages will appear here.
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {conversations.map((conv) => (
                  <ListItemButton
                    key={`conv-${conv.id}`}
                    selected={getChatStudentId(selectedStudent) === getChatStudentId(conv)}
                    onClick={() => {
                      setSelectedStudent(conv);
                      setMobileOpen(false);
                    }}
                    sx={{
                      borderLeft: getChatStudentId(selectedStudent) === getChatStudentId(conv) ? '4px solid #667eea' : 'none',
                      '&.Mui-selected': {
                        bgcolor: '#f0f0f0',
                        '&:hover': { bgcolor: '#e8e8e8' }
                      }
                    }}
                  >
                    <Badge
                      badgeContent={conv.unread_count}
                      color="error"
                      overlap="circular"
                      anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                      }}
                    >
                      <AccountCircleIcon sx={{ 
                        fontSize: '2.5rem', 
                        color: '#667eea',
                        mr: 1 
                      }} />
                    </Badge>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                          {conv.full_name}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" sx={{ 
                          color: '#666',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          display: 'block'
                        }}>
                          {conv.last_message || 'No messages yet'}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                ))}
              </List>
            )}
          </Box>

          {/* Chat Area */}
          <Box sx={{
            display: { xs: selectedStudent ? 'flex' : 'none', md: 'flex' },
            flexDirection: 'column',
            flex: 1,
            bgcolor: 'rgba(255,255,255,0.98)',
            overflow: 'hidden'
          }}>
            {selectedStudent && studentInfo ? (
              <>
                {/* Chat Header */}
                <Box sx={{
                  p: 2,
                  bgcolor: '#2d3748',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.25)'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar 
                      sx={{
                        bgcolor: '#667eea',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        color: '#fff'
                      }}
                    >
                      {getInitials(studentInfo.full_name)}
                    </Avatar>
                    <Box>
                      <Typography 
                        variant="subtitle1" 
                        sx={{ 
                          fontWeight: 'bold', 
                          color: '#ffffff',
                          fontSize: '1.1rem',
                          letterSpacing: '0.5px'
                        }}
                      >
                        {studentInfo.full_name}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: '#cbd5e0',
                          fontSize: '0.85rem',
                          fontWeight: '500'
                        }}
                      >
                        📚 Student
                      </Typography>
                    </Box>
                  </Box>
                  
                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Tooltip title="Voice Call">
                      <IconButton 
                        size="small"
                        onClick={() => handleVoiceCall()}
                        sx={{ color: '#fff', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                      >
                        <CallIcon sx={{ fontSize: '1.3rem' }} />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Video Call">
                      <IconButton 
                        size="small"
                        onClick={() => handleVideoCall()}
                        sx={{ color: '#fff', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                      >
                        <VideoCallIcon sx={{ fontSize: '1.3rem' }} />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="More Options">
                      <IconButton 
                        size="small"
                        onClick={(e) => setMenuAnchor(e.currentTarget)}
                        sx={{ color: '#fff', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                      >
                        <MoreVertIcon sx={{ fontSize: '1.3rem' }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                
                {/* Menu */}
                <Menu
                  anchorEl={menuAnchor}
                  open={Boolean(menuAnchor)}
                  onClose={() => setMenuAnchor(null)}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <MenuItem onClick={() => { handleStartVoiceMessage(); setMenuAnchor(null); }}>
                    <MicIcon sx={{ mr: 1 }} /> Send Voice Message
                  </MenuItem>
                  <MenuItem onClick={() => { handleAttachFile(); setMenuAnchor(null); }}>
                    <AttachFileIcon sx={{ mr: 1 }} /> Share Document
                  </MenuItem>
                </Menu>

                {/* Messages */}
                <Box sx={{
                  flex: 1,
                  overflowY: 'auto',
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                  bgcolor: 'rgba(245, 247, 250, 0.9)',
                  '&::-webkit-scrollbar': { width: '6px' },
                  '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
                  '&::-webkit-scrollbar-thumb': { bgcolor: '#ccc', borderRadius: '3px' }
                }}>
                  {messages.length === 0 ? (
                    <Box sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      flexDirection: 'column',
                      gap: 1
                    }}>
                      <Typography sx={{ fontSize: '3rem', opacity: 0.5 }}>
                        💬
                      </Typography>
                      <Typography sx={{ 
                        color: '#999', 
                        textAlign: 'center',
                        fontSize: '0.95rem'
                      }}>
                        Send your first message to begin chatting with {studentInfo.full_name}
                      </Typography>
                    </Box>
                  ) : (
                    messages.map((msg) => {
                      const currentUserId = user?.id ? parseInt(user.id) : null;
                      const msgSenderId = msg.sender_id ? parseInt(msg.sender_id) : null;
                      const isUserMessage = currentUserId && msgSenderId === currentUserId;
                      
                      return (
                      <Box
                        key={msg.id}
                        sx={{
                          display: 'flex',
                          justifyContent: isUserMessage ? 'flex-end' : 'flex-start',
                          mb: 0.5
                        }}
                      >
                        <Box sx={{
                          display: 'flex',
                          flexDirection: isUserMessage ? 'row-reverse' : 'row',
                          gap: 1,
                          maxWidth: '85%',
                          alignItems: 'flex-end'
                        }}>
                          <Avatar 
                            sx={{
                              width: 28,
                              height: 28,
                              bgcolor: isUserMessage ? '#667eea' : '#86efac',
                              fontSize: '0.75rem',
                              fontWeight: 'bold',
                              color: isUserMessage ? 'white' : '#333'
                            }}
                          >
                            {isUserMessage ? 'You' : '👤'}
                          </Avatar>
                          
                          <Box sx={{
                            bgcolor: isUserMessage ? '#667eea' : '#e3f2fd',
                            color: isUserMessage ? 'white' : '#333',
                            p: '10px 14px',
                            borderRadius: '12px',
                            wordBreak: 'break-word'
                          }}>
                            {msg.message_type === 'voice' ? (
                              // Voice message - display audio player
                              (() => {
                                return (
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                    <Box sx={{ 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      gap: 1,
                                      width: '100%'
                                    }}>
                                      <AuthenticatedAudio
                                        message={msg}
                                        style={{
                                          height: '36px',
                                          flex: 1,
                                          minWidth: '180px',
                                          maxWidth: '280px',
                                          cursor: 'pointer',
                                        }}
                                      />
                                    </Box>
                                    {!isUserMessage && (
                                      <Chip
                                        size="small"
                                        variant="outlined"
                                        label={
                                          msg.ai_analysis_requested
                                            ? `Supporting voice-emotion signal: ${msg.ai_analysis_status || 'processing'}`
                                            : 'Voice-emotion signal not requested'
                                        }
                                        sx={{
                                          alignSelf: 'flex-start',
                                          borderColor: isUserMessage ? 'rgba(255,255,255,0.6)' : '#90caf9',
                                          color: isUserMessage ? 'white' : '#1f4f76',
                                        }}
                                      />
                                    )}
                                    <Typography 
                                      variant="caption" 
                                      sx={{
                                        display: 'block',
                                        opacity: 0.8,
                                        fontSize: '0.7rem',
                                        fontWeight: 500
                                      }}
                                    >
                                      {formatTime(msg.created_at)}
                                    </Typography>
                                  </Box>
                                );
                              })()
                            ) : (
                              // Text message
                              <>
                                {formatMessageText(msg.message).map((paragraph, idx) => (
                                  <Typography 
                                    key={idx}
                                    variant="body2" 
                                    sx={{ 
                                      mb: idx < formatMessageText(msg.message).length - 1 ? 1 : 0,
                                      lineHeight: 1.5
                                    }}
                                  >
                                    {paragraph}
                                  </Typography>
                                ))}
                                <Typography 
                                  variant="caption" 
                                  sx={{
                                    display: 'block',
                                    mt: 0.5,
                                    opacity: 0.7,
                                    fontSize: '0.7rem'
                                  }}
                                >
                                  {formatTime(msg.created_at)}
                                </Typography>
                              </>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </Box>

                {/* Message Input */}
                <Box sx={{
                  p: 2,
                  bgcolor: 'white',
                  borderTop: '1px solid #e0e0e0'
                }}>
                  {isRecording && (
                    <Box sx={{
                      mb: 1,
                      p: 1.5,
                      bgcolor: '#fff3cd',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      border: '1px solid #ffc107'
                    }}>
                      <Box sx={{
                        width: 12,
                        height: 12,
                        bgcolor: '#dc3545',
                        borderRadius: '50%',
                        animation: 'pulse 1.5s infinite'
                      }} />
                      <Typography sx={{ fontSize: '0.9rem', color: '#333' }}>
                        🎙️ Recording voice message...
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={handleStopVoiceMessage}
                        sx={{
                          ml: 'auto',
                          color: '#dc3545',
                          borderColor: '#dc3545',
                          fontSize: '0.8rem',
                          py: 0.5
                        }}
                      >
                        Stop & Send
                      </Button>
                    </Box>
                  )}
                  
                  <Box sx={{
                    display: 'flex',
                    gap: 1,
                    alignItems: 'flex-end'
                  }}>
                    <Tooltip title={isRecording ? 'Stop Recording' : 'Record Voice Message'}>
                      <IconButton
                        size="small"
                        onClick={isRecording ? handleStopVoiceMessage : handleStartVoiceMessage}
                        sx={{
                          color: isRecording ? '#dc3545' : '#999',
                          bgcolor: isRecording ? '#fff5f5' : 'transparent',
                          '&:hover': { 
                            bgcolor: isRecording ? '#ffe0e0' : '#f5f5f5'
                          }
                        }}
                      >
                        <MicIcon />
                      </IconButton>
                    </Tooltip>
                    
                    <TextField
                      fullWidth
                      multiline
                      maxRows={3}
                      placeholder="Type your message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={sending || isRecording}
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '10px',
                          bgcolor: '#f5f5f5'
                        }
                      }}
                    />
                    
                    <Tooltip title="Share Document">
                      <IconButton
                        size="small"
                        onClick={handleAttachFile}
                        disabled={sending || isRecording}
                        sx={{
                          color: '#999',
                          '&:hover': { bgcolor: '#f5f5f5' }
                        }}
                      >
                        <AttachFileIcon />
                      </IconButton>
                    </Tooltip>
                    
                    <Button
                      variant="contained"
                      onClick={handleSendMessage}
                      disabled={sending || !messageText.trim() || isRecording}
                      sx={{
                        bgcolor: '#667eea',
                        minWidth: '80px',
                        '&:hover': { bgcolor: '#5568d3' }
                      }}
                    >
                      {sending ? (
                        <CircularProgress size={20} sx={{ color: 'white' }} />
                      ) : (
                        <SendIcon />
                      )}
                    </Button>
                  </Box>
                </Box>
                
                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  hidden
                  onChange={handleFileSelect}
                  accept="*/*"
                />
                
                {/* CSS for pulse animation */}
                <style>{`
                  @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                  }
                `}</style>
              </>
            ) : (
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                textAlign: 'center',
                color: '#334155'
              }}>
                <Box>
                  <Typography variant="h5" sx={{ mb: 1, fontWeight: 800, color: '#1f2937' }}>
                    Select a Student
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#64748b' }}>
                    Choose from the list to start chatting
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </VideoBackground>
  );
};

export default CounselorChat;
