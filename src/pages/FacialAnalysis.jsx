import React, { useEffect, useRef, useState } from 'react';
import { Alert, Box, Button, Container, Paper, Stack, Typography } from '@mui/material';
import ArrowBack from '@mui/icons-material/ArrowBack';
import CameraAlt from '@mui/icons-material/CameraAlt';
import StopCircle from '@mui/icons-material/StopCircle';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import Replay from '@mui/icons-material/Replay';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import studentService from '../services/studentService';
import { predictFace } from '../services/modalityService';

const MAX_CAPTURE_BYTES = 2 * 1024 * 1024;

const FacialAnalysis = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [status, setStatus] = useState(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [captureUrl, setCaptureUrl] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraOn(false);
  };

  useEffect(() => {
    studentService.getFacialAnalysisStatus()
      .then(setStatus)
      .catch(() => setError('Unable to load facial-analysis status.'));
    return () => stopCamera();
  }, []);

  const grantConsent = async () => {
    await Promise.all([
      api.put('/api/consents/facial_capture', { is_granted: true, policy_version: '1.0' }),
      api.put('/api/consents/facial_model_processing', { is_granted: true, policy_version: '1.0' }),
    ]);
    const next = await studentService.getFacialAnalysisStatus();
    setStatus(next);
    setMessage('Facial check-in consent saved.');
  };

  const startCamera = async () => {
    setError('');
    if (status?.runtime_state === 'inactive') {
      setError('Facial analysis is currently unavailable. No image is required.');
      return;
    }
    if (!status?.consent?.facial_capture || !status?.consent?.facial_model_processing) {
      setError('Please grant facial capture and processing consent before starting the camera.');
      return;
    }
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
    streamRef.current = stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
    }
    setCameraOn(true);
  };

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !cameraOn) {
      setError('Start the camera before capturing.');
      return;
    }
    const width = video.videoWidth;
    const height = video.videoHeight;
    if (width < 160 || height < 160 || width > 1920 || height > 1080) {
      setError('Unsupported image dimensions for facial check-in.');
      return;
    }
    canvas.width = width;
    canvas.height = height;
    canvas.getContext('2d').drawImage(video, 0, 0, width, height);
    const url = canvas.toDataURL('image/jpeg', 0.85);
    if (!url.startsWith('data:image/jpeg')) {
      setError('Unsupported image type.');
      return;
    }
    if (Math.ceil((url.length * 3) / 4) > MAX_CAPTURE_BYTES) {
      setError('Captured image is too large.');
      return;
    }
    setCaptureUrl(url);
  };

  const submit = async () => {
    if (!captureUrl) {
      setError('Capture an image before submitting.');
      return;
    }
    if (status?.runtime_state === 'inactive') {
      setError('Facial runtime is inactive, so no facial prediction will be generated.');
      return;
    }
    const response = await predictFace({ source_reference_id: `browser-capture-${Date.now()}` });
    setMessage(response.failure_message_safe || 'Facial check-in submitted.');
    stopCamera();
  };

  const inactive = status?.runtime_state === 'inactive';
  const experimental = status?.runtime_state === 'experimental';

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/dashboard')} sx={{ mb: 2 }}>
        Back to Dashboard
      </Button>
      <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4" gutterBottom>Facial Check-in</Typography>
            <Typography color="text.secondary">
              Optional facial-emotion analysis uses only an explicitly captured image. It is not identity recognition, continuous monitoring, or diagnosis.
            </Typography>
          </Box>

          {inactive && (
            <Alert severity="info">
              Facial analysis is currently unavailable. You may review the feature and privacy information, but no facial prediction will be generated.
            </Alert>
          )}
          {experimental && (
            <Alert severity="warning">
              Experimental facial-emotion signal. Results may be inaccurate and are not a diagnosis.
            </Alert>
          )}
          {message && <Alert severity="success">{message}</Alert>}
          {error && <Alert severity="warning">{error}</Alert>}

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6">Privacy Details</Typography>
            <ul>
              <li>No automatic camera activation</li>
              <li>No background capture or continuous analysis</li>
              <li>No identity, age, gender, or ethnicity inference</li>
              <li>No hidden upload or auto-submission</li>
              <li>Images are only for explicitly submitted analysis when runtime approval exists</li>
            </ul>
            {!status?.consent?.facial_capture && (
              <Button variant="outlined" onClick={grantConsent}>Grant Facial Consent</Button>
            )}
          </Paper>

          <Box sx={{ minHeight: 320, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2, display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
            {captureUrl ? (
              <img src={captureUrl} alt="Explicit facial check-in capture preview" style={{ maxWidth: '100%', maxHeight: 320, objectFit: 'contain' }} />
            ) : (
              <>
                <video ref={videoRef} muted playsInline style={{ display: cameraOn ? 'block' : 'none', maxWidth: '100%', maxHeight: 320 }} />
                {!cameraOn && <Stack alignItems="center" spacing={1}><CameraAlt sx={{ fontSize: 56, color: 'text.disabled' }} /><Typography color="text.secondary">{inactive ? 'Camera unavailable while runtime is inactive.' : 'Camera is off.'}</Typography></Stack>}
              </>
            )}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button startIcon={<CameraAlt />} variant="contained" disabled={inactive || cameraOn} onClick={startCamera}>Start Camera</Button>
            <Button startIcon={<StopCircle />} variant="outlined" disabled={!cameraOn} onClick={stopCamera}>Stop Camera</Button>
            <Button startIcon={<PhotoCamera />} variant="outlined" disabled={!cameraOn} onClick={capture}>Capture</Button>
            <Button startIcon={<Replay />} variant="outlined" disabled={!captureUrl} onClick={() => setCaptureUrl('')}>Retake</Button>
            <Button variant="contained" disabled={!captureUrl || inactive} onClick={submit}>Submit</Button>
            <Button variant="text" onClick={() => navigate('/dashboard')}>Cancel</Button>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
};

export default FacialAnalysis;
