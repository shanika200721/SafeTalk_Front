import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Box, Button, Container, FormControl, InputLabel, MenuItem, Paper, Select, Stack, Typography } from '@mui/material';
import ArrowBack from '@mui/icons-material/ArrowBack';
import CameraAlt from '@mui/icons-material/CameraAlt';
import StopCircle from '@mui/icons-material/StopCircle';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import Replay from '@mui/icons-material/Replay';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import studentService from '../services/studentService';
import { predictFace } from '../services/modalityService';
import { Sidebar } from '../components/layout/Sidebar';
import STUDENT_ROUTES from '../routes/studentRoutes';

const MAX_CAPTURE_BYTES = 2 * 1024 * 1024;

const FacialAnalysis = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [status, setStatus] = useState(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraStarting, setCameraStarting] = useState(false);
  const [cameraPermission, setCameraPermission] = useState('unknown');
  const [cameraDevices, setCameraDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [captureUrl, setCaptureUrl] = useState('');
  const [message, setMessage] = useState('');
  const [messageSeverity, setMessageSeverity] = useState('success');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const cameraConsentGranted = Boolean(status?.consent?.facial_capture);
  const processingConsentGranted = Boolean(status?.consent?.facial_model_processing);
  const inactive = status?.runtime_state === 'inactive';
  const experimental = status?.runtime_state === 'experimental';
  const appOrigin = window.location.origin;
  const alternateLocalOrigin = window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5173'
    : window.location.hostname === 'localhost'
      ? 'http://127.0.0.1:5173'
      : '';
  const legacyGetUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
  const cameraSupported = Boolean(navigator.mediaDevices?.getUserMedia || legacyGetUserMedia);
  const cameraDisabledReason = useMemo(() => {
    if (cameraOn) return 'Camera is already on.';
    if (cameraStarting) return 'Camera is starting.';
    if (!cameraConsentGranted) return 'Facial capture consent is required before the camera can start.';
    if (!cameraSupported) return 'Camera access is not supported by this browser.';
    if (cameraPermission === 'denied') return 'Browser camera permission is blocked for this site.';
    if (!window.isSecureContext && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return 'Camera access requires a secure browser context.';
    }
    return '';
  }, [cameraConsentGranted, cameraOn, cameraPermission, cameraStarting, cameraSupported]);

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
      .catch((err) => {
        const statusCode = err.response?.status;
        if (statusCode === 403) {
          setError('You do not have permission or the required consent.');
          return;
        }
        if (statusCode === 401) {
          setError('Session expired. Sign in again.');
          return;
        }
        setError('The request could not be completed.');
      });
    return () => stopCamera();
  }, []);

  const refreshCameraPermission = async () => {
    if (!navigator.permissions?.query) {
      setCameraPermission('unknown');
      return 'unknown';
    }
    try {
      const permission = await navigator.permissions.query({ name: 'camera' });
      setCameraPermission(permission.state);
      permission.onchange = () => setCameraPermission(permission.state);
      return permission.state;
    } catch {
      setCameraPermission('unknown');
      return 'unknown';
    }
  };

  useEffect(() => {
    refreshCameraPermission();
  }, []);

  const refreshCameraDevices = async () => {
    if (!navigator.mediaDevices?.enumerateDevices) {
      setCameraDevices([]);
      return [];
    }
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((device) => device.kind === 'videoinput');
      setCameraDevices(videoDevices);
      if (!selectedDeviceId && videoDevices.length === 1) {
        setSelectedDeviceId(videoDevices[0].deviceId);
      }
      return videoDevices;
    } catch {
      setCameraDevices([]);
      return [];
    }
  };

  const grantConsent = async () => {
    await Promise.all([
      api.put('/api/consents/facial_capture', { is_granted: true, policy_version: '1.0' }),
      api.put('/api/consents/facial_model_processing', { is_granted: true, policy_version: '1.0' }),
    ]);
    const next = await studentService.getFacialAnalysisStatus();
    setStatus(next);
    setMessageSeverity('success');
    setMessage('Facial check-in consent saved.');
  };

  const cameraErrorMessage = (err) => {
    if (!window.isSecureContext && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return 'Camera access requires a secure browser context.';
    }
    if (!cameraSupported) {
      return 'Camera access is not supported by this browser.';
    }
    if (err?.name === 'NotAllowedError' || err?.name === 'SecurityError') {
      if (cameraPermission === 'denied') {
        return 'Camera permission was denied. Allow camera access in your browser settings and try again.';
      }
      return 'Camera could not start because the browser blocked access. Check the camera icon in the address bar, allow camera access for this site, then try again.';
    }
    if (err?.name === 'NotFoundError' || err?.name === 'OverconstrainedError') {
      return 'No camera is available on this device.';
    }
    if (err?.name === 'NotReadableError' || err?.name === 'AbortError') {
      return 'The browser could not open this camera. Select another camera if one is listed, or check Windows camera privacy settings and try again.';
    }
    return 'The request could not be completed.';
  };

  const requestCameraStream = async () => {
    const getCamera = (constraints) => {
      if (navigator.mediaDevices?.getUserMedia) {
        return navigator.mediaDevices.getUserMedia(constraints);
      }
      return new Promise((resolve, reject) => {
        legacyGetUserMedia.call(navigator, constraints, resolve, reject);
      });
    };

    const attempts = [];
    if (selectedDeviceId) {
      attempts.push({ video: { deviceId: { exact: selectedDeviceId } }, audio: false });
    }
    attempts.push({ video: true, audio: false });

    const devices = await refreshCameraDevices();
    devices
      .filter((device) => device.deviceId && device.deviceId !== selectedDeviceId)
      .forEach((device) => {
        attempts.push({ video: { deviceId: { exact: device.deviceId } }, audio: false });
      });

    let lastError = null;
    for (const constraints of attempts) {
      try {
        return await getCamera(constraints);
      } catch (err) {
        lastError = err;
        if (err?.name === 'NotAllowedError' || err?.name === 'SecurityError' || err?.name === 'NotFoundError') {
          throw err;
        }
      }
    }
    throw lastError;
  };

  const startCamera = async () => {
    setError('');
    setMessage('');
    if (!cameraConsentGranted) {
      setError('You do not have permission or the required consent.');
      return;
    }
    if (!cameraSupported) {
      setError('Camera access is not supported by this browser.');
      return;
    }
    if (!window.isSecureContext && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      setError('Camera access requires a secure browser context.');
      return;
    }
    setCameraStarting(true);
    try {
      stopCamera();
      await refreshCameraPermission();
      const stream = await requestCameraStream();
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOn(true);
      await refreshCameraPermission();
      await refreshCameraDevices();
      if (inactive) {
        setMessageSeverity('info');
        setMessage('Camera preview is working. Facial analysis is currently unavailable, so no image will be analyzed or submitted.');
      }
    } catch (err) {
      console.error('Camera start failed:', err);
      stopCamera();
      await refreshCameraPermission();
      setError(cameraErrorMessage(err));
    } finally {
      setCameraStarting(false);
    }
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
    stopCamera();
  };

  const submit = async () => {
    if (!captureUrl) {
      setError('Capture an image before submitting.');
      return;
    }
    if (inactive) {
      setError('Facial analysis is currently unavailable. No image will be analyzed.');
      return;
    }
    if (!processingConsentGranted) {
      setError('You do not have permission or the required consent.');
      return;
    }
    try {
      setSubmitting(true);
      setError('');
      setMessage('');
      const response = await predictFace({
        source_reference_id: `browser-capture-${Date.now()}`,
        image_data_url: captureUrl,
      });
      setMessageSeverity(response.status === 'succeeded' ? 'success' : 'info');
      setMessage(response.failure_message_safe || 'Facial check-in submitted.');
      stopCamera();
    } catch (err) {
      const detail = err.response?.data?.detail;
      const safeMessage = typeof detail === 'object'
        ? detail.message
        : typeof detail === 'string'
          ? detail
          : '';
      setError(safeMessage || 'Facial check-in could not be completed. Please retry.');
    } finally {
      setSubmitting(false);
    }
  };

  const cancel = () => {
    stopCamera();
    navigate(STUDENT_ROUTES.DASHBOARD);
  };

  const retake = () => {
    stopCamera();
    setCaptureUrl('');
    setError('');
  };

  return (
    <div className="student-shell wellness-theme">
      <Sidebar />
      <main className="student-main">
        <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate(STUDENT_ROUTES.DASHBOARD)} sx={{ mb: 2 }}>
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
                  Facial analysis is currently unavailable. No image will be analyzed.
                </Alert>
              )}
              {experimental && (
                <Alert severity="warning">
                  Experimental facial-emotion signal. Results may be inaccurate and are not a diagnosis.
                </Alert>
              )}
              {message && <Alert severity={messageSeverity}>{message}</Alert>}
              {error && cameraPermission !== 'denied' && <Alert severity="warning">{error}</Alert>}
              <Alert severity={cameraDisabledReason ? 'warning' : 'info'}>
                {cameraDisabledReason || `Camera ready. Browser permission state: ${cameraPermission}. Consent ON; analysis remains contextual and non-fusion.`}
              </Alert>
              {cameraPermission === 'denied' && (
                <Alert
                  severity="warning"
                  action={(
                    <Button color="inherit" size="small" onClick={refreshCameraPermission}>
                      Re-check
                    </Button>
                  )}
                >
                  Browser camera permission is blocked for {appOrigin}. Use the lock or camera icon in the address bar, set Camera to Allow for this exact address, reload the page, then press Start Camera again.
                  {alternateLocalOrigin && ` Permissions for ${alternateLocalOrigin} are separate from this address.`}
                </Alert>
              )}

              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6">Privacy Details</Typography>
                <ul>
                  <li>No automatic camera activation</li>
                  <li>No background capture or continuous analysis</li>
                  <li>No identity, age, gender, or ethnicity inference</li>
                  <li>No hidden upload or auto-submission</li>
                  <li>Images are only submitted for analysis when runtime approval exists</li>
                </ul>
                {!cameraConsentGranted && (
                  <Button variant="outlined" onClick={grantConsent}>Grant Facial Consent</Button>
                )}
              </Paper>

              <Box sx={{ minHeight: 320, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2, display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
                {captureUrl ? (
                  <img src={captureUrl} alt="Explicit facial check-in capture preview" style={{ maxWidth: '100%', maxHeight: 320, objectFit: 'contain' }} />
                ) : (
                  <>
                    <video ref={videoRef} muted playsInline style={{ display: cameraOn ? 'block' : 'none', maxWidth: '100%', maxHeight: 320 }} />
                    {!cameraOn && <Stack alignItems="center" spacing={1}><CameraAlt sx={{ fontSize: 56, color: 'text.disabled' }} /><Typography color="text.secondary">{cameraStarting ? 'Starting camera...' : inactive ? 'Preview is available after camera access is allowed. No image will be analyzed.' : 'Camera is off.'}</Typography></Stack>}
                  </>
                )}
                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </Box>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
                <FormControl size="small" sx={{ minWidth: 260 }} disabled={cameraOn || cameraStarting || cameraDevices.length === 0}>
                  <InputLabel>Camera</InputLabel>
                  <Select
                    label="Camera"
                    value={selectedDeviceId}
                    onChange={(event) => setSelectedDeviceId(event.target.value)}
                  >
                    <MenuItem value="">Default camera</MenuItem>
                    {cameraDevices.map((device, index) => (
                      <MenuItem key={device.deviceId || index} value={device.deviceId}>
                        {device.label || `Camera ${index + 1}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button variant="outlined" disabled={cameraOn || cameraStarting} onClick={refreshCameraDevices}>
                  Detect Cameras
                </Button>
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button startIcon={<CameraAlt />} variant="contained" disabled={Boolean(cameraDisabledReason)} onClick={startCamera}>{cameraStarting ? 'Starting...' : 'Start Camera'}</Button>
                <Button startIcon={<StopCircle />} variant="outlined" disabled={!cameraOn} onClick={stopCamera}>Stop Camera</Button>
                <Button startIcon={<PhotoCamera />} variant="outlined" disabled={!cameraOn} onClick={capture}>Capture</Button>
                <Button startIcon={<Replay />} variant="outlined" disabled={!captureUrl} onClick={retake}>Retake</Button>
                <Button variant="contained" disabled={!captureUrl || inactive || !processingConsentGranted || submitting} onClick={submit}>{submitting ? 'Processing...' : 'Submit'}</Button>
                <Button variant="text" onClick={cancel}>Cancel</Button>
              </Stack>
            </Stack>
          </Paper>
        </Container>
      </main>
    </div>
  );
};

export default FacialAnalysis;
