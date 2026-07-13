import React, { useState, useEffect, useRef, useCallback } from 'react';
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
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import VideoBackground from '../components/common/VideoBackground';

// Format message text into readable paragraphs
const formatMessageText = (text) => {
  if (!text) return [];
  return text
    .split(/(?<=[.!?])\s+(?=[A-Z])|(?<=[.!?])\n/g)
    .filter(p => p.trim().length > 0);
};

const ChatSupport = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State
  const [conversations, setConversations] = useState([]);
  const [allCounselors, setAllCounselors] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [counselorInfo, setCounselorInfo] = useState(null);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Call and media state
  const [callDialogOpen, setCallDialogOpen] = useState(false);
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

  // Load conversations and counselors on mount
  useEffect(() => {
    loadData(true); // true = initial load
    const interval = setInterval(() => loadData(false), 5000); // false = background refresh
    return () => clearInterval(interval);
  }, []);

  // Restore selected conversation from localStorage on mount
  useEffect(() => {
    const savedConversationId = localStorage.getItem('selectedChatConversationId');
    if (savedConversationId && conversations.length > 0) {
      // Try to find it in conversations first (conversations use user_id)
      let selected = conversations.find(c => c.user_id === parseInt(savedConversationId));
      if (!selected && allCounselors.length > 0) {
        // If not in conversations, try counselors (counselors use id)
        selected = allCounselors.find(c => c.id === parseInt(savedConversationId));
      }
      if (selected) {
        setSelectedConversation(selected);
      }
    }
  }, [conversations, allCounselors]);

  // Load messages when conversation selected
  useEffect(() => {
    if (selectedConversation) {
      loadMessages();
      // Save selected conversation to localStorage for restoration on refresh
      localStorage.setItem('selectedChatConversationId', selectedConversation.user_id || selectedConversation.id);
      // Counselor info is already stored in selectedConversation
      // No need to look it up in conversations/allCounselors because those change constantly
      setCounselorInfo(selectedConversation);
    }
  }, [selectedConversation]); // Only depend on selectedConversation, NOT on conversations/allCounselors

  const loadData = async (isInitialLoad = false) => {
    try {
      // Only show loading on initial load, not on background refreshes
      if (isInitialLoad) {
        setLoading(true);
      }
      
      // Load both conversations and available counselors in parallel
      const [convsResponse, counselorsResponse] = await Promise.all([
        api.get('/api/chat/conversations').catch(() => ({ data: [] })),
        api.get('/api/chat/counselors').catch(() => ({ data: [] }))
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

  const loadMessages = async () => {
    if (!selectedConversation) return;
    try {
      const receiverId = selectedConversation.user_id || selectedConversation.id;
      console.log(`📨 Loading messages from counselor ID: ${receiverId}`);
      const response = await api.get(`/api/chat/messages/${receiverId}`, {
        params: { limit: 100 }
      });
      console.log(`✅ Loaded ${response.data?.length || 0} messages`);
      setMessages(response.data || []);
    } catch (err) {
      console.error('Error loading messages:', err);
      // If no messages yet, just clear the list (new conversation)
      setMessages([]);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) {
      console.warn('⚠️ Cannot send: messageText empty or no selectedConversation');
      return;
    }

    const msgContent = messageText.trim();
    let tempMsgId; // Declare outside try block so it's accessible in catch block
    
    try {
      setSending(true);
      
      // Debug logging
      console.log('🔍 Selected Conversation:', selectedConversation);
      console.log('🔍 Selected Conversation ID type:', typeof selectedConversation.id, 'value:', selectedConversation.id);
      
      // Optimistically add message
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

      // Send to API
      // API returns conversations with 'user_id', but available counselors use 'id'
      const receiverId = parseInt(selectedConversation.user_id || selectedConversation.id);
      if (isNaN(receiverId)) {
        throw new Error(`Invalid receiver_id: selectedConversation=${JSON.stringify(selectedConversation)}`);
      }
      
      const payload = {
        receiver_id: receiverId,
        message: msgContent,
        message_type: 'text'
      };
      
      console.log('📨 Request payload:', payload);
      console.log('📨 Sending to API:', JSON.stringify(payload));
      
      const response = await api.post('/api/chat/send', payload);

      console.log(`✅ Message sent successfully (ID: ${response.data?.id})`, response.data);

      // Update with server response - ensure all fields are present
      setMessages(prev => 
        prev.map(m => m.id === tempMsgId ? {
          ...response.data,
          sender_id: parseInt(response.data.sender_id)
        } : m)
      );
      
      // Refresh conversations list (background refresh)
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
          .map(e => `${e.loc?.[1] || 'field'}: ${e.msg}` || e.msg)
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
      // Remove the failed temp message
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
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase() || 'C';
  };

  // Call handlers
  const handleCallClick = (event) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
  };

  const handleVoiceCall = () => {
    alert(`Initiating voice call with ${counselorInfo?.full_name}...`);
    console.log('Voice call initiated to:', counselorInfo?.id);
    handleCloseMenu();
    // TODO: Integrate Twilio or WebRTC for voice calling
  };

  const handleVideoCall = () => {
    alert(`Initiating video call with ${counselorInfo?.full_name}...`);
    console.log('Video call initiated to:', counselorInfo?.id);
    handleCloseMenu();
    // TODO: Integrate Twilio or WebRTC for video calling
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
        
        console.log('🎤 Voice message recorded:', audioBlob.size, 'bytes');
        
        // Send voice message
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

          console.log('📤 Voice message details:');
          console.log('  Receiver ID:', receiverId);
          console.log('  Audio size:', audioBlob.size, 'bytes');
          console.log('  Content-Type:', audioBlob.type);

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
          
          console.log('✅ Voice message sent successfully:', response.data);
          
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
      console.log('🎤 Recording started...');
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Unable to access microphone: ' + err.message);
    }
  };;

  const handleStopVoiceMessage = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // File/Document upload handlers
  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setSending(true);
      
      // Create temporary file message
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

      // Send file to server (multipart form data)
      const formData = new FormData();
      formData.append('file', file);
      formData.append('receiver_id', selectedConversation.user_id || selectedConversation.id);

      console.log('File ready to send:', file.name);
      
      // In a real app, upload to server
      // await api.post('/api/chat/send-file', formData);
      
      loadData(false);
    } catch (err) {
      console.error('Error sending file:', err);
      setError('Failed to send file');
      setMessages(prev => prev.filter(m => m.id !== (Date.now())));
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
            <Typography>Loading chat...</Typography>
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
              onClick={() => navigate('/chat')}
              size="small"
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 'bold', textTransform: 'none' }}>
              💬 Counselor Chat Support
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

        {error && (
          <Alert severity="error" onClose={() => setError('')} sx={{ m: 1 }}>
            {error}
          </Alert>
        )}

        {/* Main Chat Area */}
        <Box sx={{
          display: 'flex',
          flex: 1,
          gap: 0,
          overflow: 'hidden'
        }}>
          {/* Conversations List - Sidebar */}
          <Box sx={{
            width: { xs: mobileOpen ? '100%' : 0, sm: '100%', md: '28%' },
            bgcolor: 'rgba(255,255,255,0.95)',
            borderRight: { md: '1px solid #e0e0e0' },
            display: 'flex',
            flexDirection: 'column',
            transition: 'width 0.3s',
            overflow: 'hidden',
            zIndex: 20
          }}>
        {/* Conversations Header */}
            <Box sx={{
              p: 2,
              bgcolor: '#667eea',
              color: 'white'
            }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                👨‍⚕️ Counselor Support
              </Typography>
              <Typography variant="caption">
                {conversations.length} active, {allCounselors.length} available
              </Typography>
            </Box>

            {/* Conversations List */}
            <List sx={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              '&::-webkit-scrollbar': { width: '6px' },
              '&::-webkit-scrollbar-track': { bgcolor: '#f1f1f1' },
              '&::-webkit-scrollbar-thumb': { bgcolor: '#667eea', borderRadius: '3px' }
            }}>
              {/* Active Conversations Section */}
              {conversations.length > 0 && (
                <>
                  <ListItem sx={{ p: 1, bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#666' }}>
                      💬 ACTIVE CONVERSATIONS
                    </Typography>
                  </ListItem>
                  {conversations.map((conv) => (
                    <ListItemButton
                      key={`conv-${conv.id}`}
                      selected={selectedConversation?.id === conv.id}
                      onClick={() => {
                        setSelectedConversation(conv);
                        setMobileOpen(false);
                      }}
                      sx={{
                        borderLeft: selectedConversation?.id === conv.id ? '4px solid #667eea' : 'none',
                        '&.Mui-selected': {
                          bgcolor: '#f0f0f0',
                          '&:hover': { bgcolor: '#e8e8e8' }
                        }
                      }}
                    >
                      <Avatar 
                        sx={{
                          bgcolor: '#667eea',
                          mr: 2,
                          fontSize: '0.9rem',
                          fontWeight: 'bold'
                        }}
                      >
                        {getInitials(conv.full_name)}
                      </Avatar>
                      <ListItemText
                        primary={<Typography variant="subtitle2" sx={{ fontWeight: 500 }}>{conv.full_name}</Typography>}
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
                      {conv.unread_count > 0 && (
                        <Chip
                          label={conv.unread_count}
                          size="small"
                          color="error"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </ListItemButton>
                  ))}
                  <Divider sx={{ my: 1 }} />
                </>
              )}

              {/* Available Counselors Section */}
              {allCounselors.length > 0 && (
                <>
                  <ListItem sx={{ p: 1, bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#666' }}>
                      ✅ AVAILABLE COUNSELORS
                    </Typography>
                  </ListItem>
                  {allCounselors.map((counselor) => {
                    // Check if already in conversations
                    const isInConversations = conversations.some(c => c.id === counselor.id);
                    return (
                      <ListItemButton
                        key={`counselor-${counselor.id}`}
                        selected={selectedConversation?.id === counselor.id}
                        onClick={() => {
                          setSelectedConversation(counselor);
                          setMobileOpen(false);
                        }}
                        sx={{
                          borderLeft: selectedConversation?.id === counselor.id ? '4px solid #667eea' : 'none',
                          opacity: isInConversations ? 0.7 : 1,
                          '&.Mui-selected': {
                            bgcolor: '#f0f0f0',
                            '&:hover': { bgcolor: '#e8e8e8' }
                          }
                        }}
                      >
                        <Badge
                          overlap="circular"
                          anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                          }}
                          variant="dot"
                          sx={{
                            '& .MuiBadge-badge': {
                              bgcolor: '#86efac',
                              boxShadow: '0 0 0 2px white'
                            }
                          }}
                        >
                          <Avatar 
                            sx={{
                              bgcolor: '#86efac',
                              mr: 2,
                              fontSize: '0.9rem',
                              fontWeight: 'bold',
                              color: '#333'
                            }}
                          >
                            {getInitials(counselor.full_name)}
                          </Avatar>
                        </Badge>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                              {counselor.full_name}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" sx={{ color: '#86efac', fontWeight: '600' }}>
                              🟢 Online • {counselor.role}
                            </Typography>
                          }
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
                    secondary="Please check back later"
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              )}
            </List>
          </Box>

          {/* Chat Window */}
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            bgcolor: 'rgba(255,255,255,0.98)',
            overflow: 'hidden'
          }}>
            {selectedConversation && counselorInfo ? (
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
                      {getInitials(counselorInfo.full_name)}
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
                        {counselorInfo.full_name}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: '#cbd5e0',
                          fontSize: '0.85rem',
                          fontWeight: '500'
                        }}
                      >
                        💬 Counselor Support
                      </Typography>
                    </Box>
                  </Box>
                  
                  {/* Call and Action Buttons */}
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
                    
                    {mobileOpen && (
                      <IconButton 
                        color="inherit" 
                        onClick={() => setMobileOpen(false)}
                        sx={{ display: { md: 'none' }, color: '#fff' }}
                      >
                        <CloseIcon />
                      </IconButton>
                    )}
                  </Box>
                </Box>
                
                {/* Call Menu */}
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
                      textAlign: 'center'
                    }}>
                      <Box>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                          👋 Start the conversation
                        </Typography>
                        <Typography color="text.secondary">
                          Send your first message to begin chatting with {counselorInfo.full_name}
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    messages.map((msg) => {
                      // Ensure proper comparison - both should be numbers
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
                            {isUserMessage ? 'You' : '👨‍⚕️'}
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
                                // Extract filename from path
                                const fullPath = msg.message || '';
                                const filename = fullPath.includes('/') ? fullPath.split('/').pop() : fullPath.split('\\').pop();
                                const audioUrl = `http://localhost:8000/api/chat/audio/${filename}`;
                                
                                console.log('🎙️ Voice message details:', {
                                  fullPath,
                                  filename,
                                  audioUrl,
                                  msgId: msg.id,
                                  timestamp: msg.created_at
                                });
                                
                                return (
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                    <Box sx={{ 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      gap: 1,
                                      width: '100%'
                                    }}>
                                      <audio 
                                        controls
                                        controlsList="nodownload"
                                        onLoadedMetadata={(e) => {
                                          console.log('✅ Audio loaded:', {
                                            duration: e.target.duration,
                                            src: e.target.src
                                          });
                                        }}
                                        onError={(e) => {
                                          console.error('❌ Audio error:', {
                                            error: e,
                                            src: e.target.src,
                                            networkState: e.target.networkState,
                                            readyState: e.target.readyState
                                          });
                                        }}
                                        style={{ 
                                          height: '36px', 
                                          flex: 1,
                                          minWidth: '180px',
                                          maxWidth: '280px',
                                          cursor: 'pointer'
                                        }}
                                      >
                                        <source src={audioUrl} type="audio/wav" />
                                        Your browser does not support audio.
                                      </audio>
                                    </Box>
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
                  {/* Recording Indicator */}
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
                  
                  {/* Input Area */}
                  <Box sx={{
                    display: 'flex',
                    gap: 1,
                    alignItems: 'flex-end'
                  }}>
                    {/* Voice Message Button */}
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
                    
                    {/* Message Input */}
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
                    
                    {/* File Attachment Button */}
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
                    
                    {/* Send Button */}
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
                color: 'white'
              }}>
                <Box>
                  <Typography variant="h5" sx={{ mb: 1 }}>
                    📬 Select a Counselor
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Choose from your conversation list to start chatting
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

export default ChatSupport;
