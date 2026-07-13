import React from 'react';
import { Container, Paper, Typography, Box, Button, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBack from '@mui/icons-material/ArrowBack';
import Send from '@mui/icons-material/Send';

const ChatInterface = () => {
  const navigate = useNavigate();
  const [message, setMessage] = React.useState('');

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/dashboard')} sx={{ mb: 2 }}>
        Back to Dashboard
      </Button>
      <Paper sx={{ p: 3, height: '70vh', display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h5" gutterBottom>
          Chat with SafeTalk AI
        </Typography>
        
        {/* Chat messages area */}
        <Box sx={{ flexGrow: 1, bgcolor: '#f5f5f5', p: 2, borderRadius: 2, mb: 2, overflow: 'auto' }}>
          <Typography variant="body2" color="text.secondary" align="center">
            Chat interface coming soon. You'll be able to:
          </Typography>
          <ul>
            <li>Chat with AI about your feelings</li>
            <li>Get real-time text analysis for risk detection</li>
            <li>Receive therapeutic responses based on CBT</li>
          </ul>
        </Box>

        {/* Input area */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            placeholder="Type your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            variant="outlined"
            size="small"
          />
          <Button variant="contained" endIcon={<Send />} disabled>
            Send
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ChatInterface;