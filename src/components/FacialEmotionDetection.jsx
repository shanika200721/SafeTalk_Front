import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Alert,
  Chip,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Close as CloseIcon,
  EmojiEmotions as EmotionsIcon,
  BarChart as BarChartIcon,
} from '@mui/icons-material';

/**
 * COMPONENT: FacialEmotionDetection
 * 
 * PURPOSE:
 * - Detect facial expressions and emotions from webcam
 * - Measure mood level using facial analysis
 * - Display mood summary and statistics
 * - Monitor emotional wellbeing in real-time
 */
const FacialEmotionDetection = ({ open, onClose }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);

  // State management
  const [analyzing, setAnalyzing] = useState(false);
  const [emotions, setEmotions] = useState(null);
  const [dominantEmotion, setDominantEmotion] = useState(null);
  const [moodScore, setMoodScore] = useState(0);
  const [emotionHistory, setEmotionHistory] = useState([]);
  const [error, setError] = useState(null);
  const [videoReady, setVideoReady] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);

  // Emotion to mood mapping
  const emotionMoodMap = {
    happy: 90,
    surprised: 75,
    neutral: 50,
    sad: 30,
    angry: 25,
    fearful: 20,
    disgusted: 15,
  };

  const emotionColors = {
    happy: '#4caf50',
    surprised: '#ff9800',
    neutral: '#9e9e9e',
    sad: '#2196f3',
    angry: '#f44336',
    fearful: '#9c27b0',
    disgusted: '#795548',
  };

  // Initialize webcam
  useEffect(() => {
    if (open) {
      initializeCamera();
      // Add timeout to enable UI after 3 seconds even if camera fails
      const timeoutId = setTimeout(() => {
        setVideoReady(true);
      }, 3000);
      return () => clearTimeout(timeoutId);
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [open]);

  // Timer for session duration
  useEffect(() => {
    if (analyzing) {
      const interval = setInterval(() => {
        setSessionDuration((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [analyzing]);

  const initializeCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 } },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setVideoReady(true);
        };
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Failed to access camera. Please allow camera permissions and try again.');
      // Set videoReady to true anyway so user can see the interface
      setVideoReady(true);
    }
  };

  // Simulate facial emotion detection (using mock data)
  // In production, integrate with face-api.js or TensorFlow.js
  const detectFacialEmotions = async () => {
    try {
      setAnalyzing(true);

      // Simulate emotion detection over 5 seconds
      const mockEmotions = {
        happy: Math.random() * 100,
        surprised: Math.random() * 50,
        neutral: Math.random() * 75,
        sad: Math.random() * 30,
        angry: Math.random() * 25,
        fearful: Math.random() * 20,
        disgusted: Math.random() * 15,
      };

      // Find dominant emotion
      const dominant = Object.entries(mockEmotions).reduce((a, b) =>
        a[1] > b[1] ? a : b
      )[0];

      setEmotions(mockEmotions);
      setDominantEmotion(dominant);

      // Calculate mood score (0-100)
      const score = emotionMoodMap[dominant] || 50;
      setMoodScore(score);

      // Add to history
      setEmotionHistory((prev) => [
        ...prev,
        {
          timestamp: new Date(),
          emotion: dominant,
          confidence: mockEmotions[dominant],
          moodScore: score,
        },
      ]);

      // Continue analysis
      setTimeout(() => {
        if (analyzing) {
          detectFacialEmotions();
        }
      }, 3000);
    } catch (err) {
      console.error('Emotion detection error:', err);
      setError('Error detecting emotions. Please try again.');
      setAnalyzing(false);
    }
  };

  const stopAnalysis = () => {
    setAnalyzing(false);
    setSessionDuration(0);
  };

  const handleClose = () => {
    stopAnalysis();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    onClose();
  };

  // Calculate average mood from history
  const getAverageMood = () => {
    if (emotionHistory.length === 0) return 0;
    const sum = emotionHistory.reduce((acc, entry) => acc + entry.moodScore, 0);
    return Math.round(sum / emotionHistory.length);
  };

  // Get mood classification
  const getMoodClassification = () => {
    const avg = getAverageMood();
    if (avg >= 75) return 'Excellent 😊';
    if (avg >= 50) return 'Good 🙂';
    if (avg >= 25) return 'Fair 😐';
    return 'Poor 😔';
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EmotionsIcon />
          <span>Facial Emotion Analysis</span>
        </Box>
        <Button onClick={handleClose} color="error" size="small">
          <CloseIcon />
        </Button>
      </DialogTitle>

      <DialogContent sx={{ py: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Video Feed */}
          <Grid item xs={12} md={6}>
            <Card sx={{ backgroundColor: '#000', borderRadius: 2 }}>
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: 300,
                  backgroundColor: '#000',
                  borderRadius: 2,
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {!videoReady ? (
                  <CircularProgress />
                ) : (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                )}
                {analyzing && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      color: '#4caf50',
                      padding: '8px 12px',
                      borderRadius: 2,
                    }}
                  >
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        backgroundColor: '#4caf50',
                        borderRadius: '50%',
                        animation: 'pulse 1s infinite',
                        '@keyframes pulse': {
                          '0%, 100%': { opacity: 1 },
                          '50%': { opacity: 0.5 },
                        },
                      }}
                    />
                    <Typography variant="caption">
                      {sessionDuration}s
                    </Typography>
                  </Box>
                )}
              </Box>
            </Card>
          </Grid>

          {/* Emotion Analysis */}
          <Grid item xs={12} md={6}>
            {analyzing && emotions ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Dominant Emotion */}
                <Card sx={{ background: `linear-gradient(135deg, ${emotionColors[dominantEmotion]}20 0%, ${emotionColors[dominantEmotion]}10 100%)` }}>
                  <CardContent>
                    <Typography variant="subtitle2" sx={{ color: '#666', mb: 1 }}>
                      Current Emotion
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="h4" sx={{ color: emotionColors[dominantEmotion], fontWeight: 'bold' }}>
                        {dominantEmotion?.toUpperCase()}
                      </Typography>
                      <Chip
                        label={`${Math.round(emotions[dominantEmotion])}% confidence`}
                        color="primary"
                      />
                    </Box>
                  </CardContent>
                </Card>

                {/* Mood Score */}
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" sx={{ color: '#666', mb: 2 }}>
                      Mood Level
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', color: moodScore >= 50 ? '#4caf50' : '#ff9800' }}>
                        {moodScore}/100
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#999' }}>
                        {getMoodClassification()}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={moodScore}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: '#f0f0f0',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: moodScore >= 50 ? '#4caf50' : '#ff9800',
                          borderRadius: 5,
                        },
                      }}
                    />
                  </CardContent>
                </Card>

                {/* Emotion Breakdown */}
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" sx={{ color: '#666', mb: 2 }}>
                      Emotion Breakdown
                    </Typography>
                    {Object.entries(emotions).map(([emotion, value]) => (
                      <Box key={emotion} sx={{ mb: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>
                            {emotion}
                          </Typography>
                          <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                            {Math.round(value)}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(100, value)}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: '#f0f0f0',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: emotionColors[emotion],
                              borderRadius: 3,
                            },
                          }}
                        />
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" sx={{ color: '#999', mb: 2 }}>
                  Start analysis to see emotion breakdown
                </Typography>
              </Box>
            )}
          </Grid>

          {/* Session Summary */}
          {emotionHistory.length > 0 && (
            <Grid item xs={12}>
              <Card sx={{ background: 'linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%)' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <BarChartIcon sx={{ color: '#4caf50' }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Session Summary
                    </Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                          {getAverageMood()}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#666' }}>
                          Avg Mood
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" sx={{ color: '#2196f3', fontWeight: 'bold' }}>
                          {emotionHistory.length}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#666' }}>
                          Samples
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" sx={{ color: '#ff9800', fontWeight: 'bold' }}>
                          {sessionDuration}s
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#666' }}>
                          Duration
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" sx={{ color: '#9c27b0', fontWeight: 'bold' }}>
                          {getMoodClassification()}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#666' }}>
                          Status
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ pb: 2, pr: 2, gap: 1 }}>
        {!analyzing ? (
          <Button
            onClick={detectFacialEmotions}
            variant="contained"
            color="success"
            disabled={!videoReady}
          >
            Start Analysis
          </Button>
        ) : (
          <Button onClick={stopAnalysis} variant="contained" color="error">
            Stop Analysis
          </Button>
        )}
        <Button onClick={handleClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FacialEmotionDetection;
