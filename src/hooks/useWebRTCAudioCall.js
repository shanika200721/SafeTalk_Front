import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../services/api';

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

const toSessionSignal = (description) => ({
  type: description.type,
  sdp: description.sdp,
});

const toIceSignal = (candidate) => ({
  candidate: candidate.candidate,
  sdpMid: candidate.sdpMid,
  sdpMLineIndex: candidate.sdpMLineIndex,
  usernameFragment: candidate.usernameFragment || null,
});

const candidateKey = (candidate) => [
  candidate.from_user_id,
  candidate.candidate,
  candidate.sdpMid,
  candidate.sdpMLineIndex,
].join('|');

export const getCallAudioStatusText = (status, error) => {
  if (error) return error;
  switch (status) {
    case 'starting':
      return 'Starting audio...';
    case 'waiting-audio':
      return 'Waiting for audio connection...';
    case 'waiting-signal':
      return 'Connecting audio...';
    case 'connecting':
      return 'Audio connecting...';
    case 'connected':
      return 'Audio connected';
    case 'remote-ready':
      return 'Remote audio ready';
    case 'reconnecting':
      return 'Audio reconnecting...';
    case 'tap-to-hear':
      return 'Tap Hear Audio to listen';
    case 'error':
      return 'Audio unavailable';
    default:
      return '';
  }
};

export default function useWebRTCAudioCall(activeCall, currentUserId) {
  const remoteAudioRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const seenIceCandidatesRef = useRef(new Set());
  const [audioStatus, setAudioStatus] = useState('idle');
  const [audioError, setAudioError] = useState('');
  const [localMuted, setLocalMuted] = useState(false);
  const [remoteAudioReady, setRemoteAudioReady] = useState(false);

  const cleanup = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.onicecandidate = null;
      peerConnectionRef.current.ontrack = null;
      peerConnectionRef.current.onconnectionstatechange = null;
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (remoteAudioRef.current) {
      remoteAudioRef.current.pause();
      remoteAudioRef.current.srcObject = null;
    }
    remoteStreamRef.current = null;
    seenIceCandidatesRef.current = new Set();
    setRemoteAudioReady(false);
  }, []);

  useEffect(() => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getAudioTracks().forEach((track) => {
      track.enabled = !localMuted;
    });
  }, [localMuted]);

  const playRemoteAudio = useCallback(async () => {
    const audio = remoteAudioRef.current;
    if (!audio?.srcObject && remoteStreamRef.current) {
      audio.srcObject = remoteStreamRef.current;
    }
    if (!audio?.srcObject) {
      setAudioStatus('waiting-audio');
      return;
    }
    try {
      audio.muted = false;
      audio.volume = 1;
      await audio.play();
      setAudioStatus('connected');
    } catch {
      setAudioStatus('tap-to-hear');
    }
  }, []);

  useEffect(() => {
    const audio = remoteAudioRef.current;
    if (!audio || !remoteStreamRef.current) return undefined;

    audio.srcObject = remoteStreamRef.current;
    audio.autoplay = true;
    audio.playsInline = true;
    audio.muted = false;
    audio.volume = 1;

    const handlePlaying = () => setAudioStatus('connected');
    const handlePause = () => {
      if (remoteStreamRef.current) setAudioStatus('tap-to-hear');
    };

    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('pause', handlePause);
    playRemoteAudio();

    return () => {
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('pause', handlePause);
    };
  }, [playRemoteAudio, remoteAudioReady]);

  useEffect(() => {
    const callId = activeCall?.id;
    const isAnswered = activeCall?.status === 'answered';
    const userId = Number(currentUserId);

    if (!callId || !isAnswered || !userId) {
      cleanup();
      setAudioStatus('idle');
      setAudioError('');
      return undefined;
    }

    let cancelled = false;
    let signalTimer;
    const isCaller = Number(activeCall.caller_id) === userId;
    const signalPath = `/api/chat/calls/${callId}/signal`;

    const postSignal = (payload) => api.post(signalPath, payload).catch(() => null);

    const applyRemoteIce = async (iceCandidates = []) => {
      const peer = peerConnectionRef.current;
      if (!peer?.remoteDescription) return;

      for (const candidate of iceCandidates) {
        if (!candidate?.candidate || Number(candidate.from_user_id) === userId) continue;
        const key = candidateKey(candidate);
        if (seenIceCandidatesRef.current.has(key)) continue;
        seenIceCandidatesRef.current.add(key);
        try {
          await peer.addIceCandidate(new RTCIceCandidate({
            candidate: candidate.candidate,
            sdpMid: candidate.sdpMid,
            sdpMLineIndex: candidate.sdpMLineIndex,
          }));
        } catch {
          // A late or duplicate candidate can be ignored; polling will continue.
        }
      }
    };

    const pollSignals = async () => {
      const peer = peerConnectionRef.current;
      if (!peer || cancelled) return;

      const response = await api.get(signalPath).catch(() => null);
      if (!response?.data || cancelled) return;
      const { offer, answer, ice_candidates: iceCandidates = [] } = response.data;

      if (!isCaller && offer?.sdp && !peer.remoteDescription) {
        try {
          await peer.setRemoteDescription(new RTCSessionDescription({
            type: offer.type || 'offer',
            sdp: offer.sdp,
          }));
          const answerDescription = await peer.createAnswer();
          await peer.setLocalDescription(answerDescription);
          await postSignal({ answer: toSessionSignal(answerDescription) });
          setAudioStatus('connecting');
        } catch (err) {
          setAudioError(err.message || 'Unable to answer audio signal.');
        }
      }

      if (isCaller && answer?.sdp && !peer.remoteDescription) {
        try {
          await peer.setRemoteDescription(new RTCSessionDescription({
            type: answer.type || 'answer',
            sdp: answer.sdp,
          }));
          setAudioStatus('connecting');
        } catch (err) {
          setAudioError(err.message || 'Unable to connect audio answer.');
        }
      }

      await applyRemoteIce(iceCandidates);
    };

    const startAudioCall = async () => {
      try {
        setAudioStatus('starting');
        setAudioError('');

        if (!navigator.mediaDevices?.getUserMedia || !window.RTCPeerConnection) {
          throw new Error('Live audio calls are not supported in this browser.');
        }

        const localStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
          video: false,
        });
        if (cancelled) {
          localStream.getTracks().forEach((track) => track.stop());
          return;
        }

        localStreamRef.current = localStream;
        localStream.getAudioTracks().forEach((track) => {
          track.enabled = !localMuted;
        });

        const peer = new RTCPeerConnection({ iceServers: ICE_SERVERS });
        peerConnectionRef.current = peer;
        localStream.getTracks().forEach((track) => peer.addTrack(track, localStream));

        peer.onicecandidate = (event) => {
          if (event.candidate) {
            postSignal({ ice_candidate: toIceSignal(event.candidate) });
          }
        };

        peer.ontrack = (event) => {
          const remoteStream = event.streams?.[0] || remoteStreamRef.current || new MediaStream();
          if (!event.streams?.[0] && event.track && !remoteStream.getTracks().some((track) => track.id === event.track.id)) {
            remoteStream.addTrack(event.track);
          }
          remoteStreamRef.current = remoteStream;
          setRemoteAudioReady(true);
          setAudioStatus((current) => (current === 'connected' ? current : 'remote-ready'));

          if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = remoteStream;
            playRemoteAudio();
          }
        };

        peer.onconnectionstatechange = () => {
          if (['connected', 'completed'].includes(peer.connectionState)) {
            const audio = remoteAudioRef.current;
            if (remoteStreamRef.current && audio?.paused) {
              setAudioStatus('tap-to-hear');
            } else if (remoteStreamRef.current) {
              setAudioStatus('connected');
            } else {
              setAudioStatus('connecting');
            }
          } else if (['failed', 'disconnected'].includes(peer.connectionState)) {
            setAudioStatus('reconnecting');
          } else if (peer.connectionState === 'closed') {
            setAudioStatus('idle');
          }
        };

        if (isCaller) {
          const offerDescription = await peer.createOffer();
          await peer.setLocalDescription(offerDescription);
          await postSignal({ offer: toSessionSignal(offerDescription) });
        }

        setAudioStatus(isCaller ? 'waiting-audio' : 'waiting-signal');
        await pollSignals();
        signalTimer = setInterval(pollSignals, 1200);
      } catch (err) {
        cleanup();
        setAudioStatus('error');
        setAudioError(err.message || 'Unable to start live audio.');
      }
    };

    startAudioCall();

    return () => {
      cancelled = true;
      if (signalTimer) clearInterval(signalTimer);
      cleanup();
    };
  }, [activeCall?.id, activeCall?.status, activeCall?.caller_id, cleanup, currentUserId, playRemoteAudio]);

  return {
    remoteAudioRef,
    audioStatus,
    audioError,
    remoteAudioReady,
    localMuted,
    setLocalMuted,
    playRemoteAudio,
  };
}
