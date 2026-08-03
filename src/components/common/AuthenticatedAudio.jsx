import { useEffect, useState } from 'react';
import { Typography } from '@mui/material';
import api from '../../services/api';

const AuthenticatedAudio = ({ message, className, style }) => {
  const [audioUrl, setAudioUrl] = useState(message?.audio_url || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(!message?.audio_url);

  useEffect(() => {
    let objectUrl = '';
    let cancelled = false;

    const loadAudio = async () => {
      if (!message?.id || message?.audio_url) {
        setAudioUrl(message?.audio_url || '');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        const response = await api.get(`/api/chat/messages/${message.id}/audio`, {
          responseType: 'blob',
        });
        objectUrl = URL.createObjectURL(response.data);
        if (!cancelled) {
          setAudioUrl(objectUrl);
        }
      } catch (err) {
        if (!cancelled) {
          const status = err.response?.status;
          if (status === 401) {
            setError('Please sign in again to play this voice message.');
          } else if (status === 403) {
            setError('You do not have access to this voice message.');
          } else {
            setError('Voice message is unavailable.');
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadAudio();

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [message?.id, message?.audio_url]);

  if (loading) {
    return <Typography variant="caption">Loading voice message...</Typography>;
  }

  if (error || !audioUrl) {
    return <Typography variant="caption">{error || 'Voice message is unavailable.'}</Typography>;
  }

  return (
    <audio className={className} style={style} controls controlsList="nodownload">
      <source src={audioUrl} type="audio/wav" />
      Your browser does not support audio.
    </audio>
  );
};

export default AuthenticatedAudio;
