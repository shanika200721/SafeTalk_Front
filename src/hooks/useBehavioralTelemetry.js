import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import api, { getStoredToken } from '../services/api';
import { useAuth } from '../context/AuthContext';

const FLUSH_INTERVAL_MS = 300000;
const TYPING_GAP_MS = 2000;

const emptyCounters = () => ({
  interactionCount: 0,
  typingActiveMs: 0,
  typingPauseCount: 0,
  typedCharacterCount: 0,
  firstInteractionAt: null,
});

export default function useBehavioralTelemetry() {
  const location = useLocation();
  const { isAuthenticated, isStudent } = useAuth();
  const sessionRef = useRef({
    sessionId: null,
    startedAt: 0,
    sourcePage: '',
    counters: emptyCounters(),
    lastKeyAt: null,
  });

  useEffect(() => {
    if (!isAuthenticated || !isStudent) return undefined;

    sessionRef.current = {
      sessionId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      startedAt: performance.now(),
      sourcePage: location.pathname,
      counters: emptyCounters(),
      lastKeyAt: null,
    };

    const noteInteraction = () => {
      const state = sessionRef.current;
      state.counters.interactionCount += 1;
      if (state.counters.firstInteractionAt === null) {
        state.counters.firstInteractionAt = performance.now();
      }
    };

    const noteKeydown = (event) => {
      if (event.ctrlKey || event.altKey || event.metaKey) return;
      noteInteraction();
      const state = sessionRef.current;
      const now = performance.now();
      if (state.lastKeyAt !== null) {
        const gap = now - state.lastKeyAt;
        if (gap <= TYPING_GAP_MS) {
          state.counters.typingActiveMs += gap;
        } else {
          state.counters.typingPauseCount += 1;
        }
      }
      state.lastKeyAt = now;
      if (event.key && event.key.length === 1) {
        state.counters.typedCharacterCount += 1;
      }
    };

    const buildPayload = () => {
      const state = sessionRef.current;
      const sessionDurationSeconds = Math.max(0, (performance.now() - state.startedAt) / 1000);
      const firstInteractionAt = state.counters.firstInteractionAt;
      return {
        event_type: 'session_summary',
        source_page: state.sourcePage,
        session_id: state.sessionId,
        session_duration_seconds: Number(sessionDurationSeconds.toFixed(3)),
        interaction_count: state.counters.interactionCount,
        response_latency_ms: firstInteractionAt === null ? null : Number((firstInteractionAt - state.startedAt).toFixed(3)),
        typing_active_ms: Number(state.counters.typingActiveMs.toFixed(3)),
        typing_pause_count: state.counters.typingPauseCount,
        typed_character_count: state.counters.typedCharacterCount,
        metadata: {
          path_changed: state.sourcePage !== location.pathname,
        },
      };
    };

    const resetWindow = () => {
      const state = sessionRef.current;
      state.startedAt = performance.now();
      state.sourcePage = location.pathname;
      state.counters = emptyCounters();
      state.lastKeyAt = null;
    };

    const flush = async (useKeepalive = false) => {
      const token = getStoredToken();
      if (!token) return;
      const payload = buildPayload();
      if (payload.session_duration_seconds < 1 && payload.interaction_count === 0) return;
      resetWindow();
      try {
        if (useKeepalive && typeof fetch === 'function') {
          await fetch(`${api.defaults.baseURL}/api/modalities/behavioral/telemetry`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
            keepalive: true,
          });
          return;
        }
        await api.post('/api/modalities/behavioral/telemetry', payload);
      } catch {
        // Consent withdrawals and transient network failures should not interrupt the student UI.
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        void flush(true);
      }
    };

    const intervalId = window.setInterval(() => {
      void flush(false);
    }, FLUSH_INTERVAL_MS);

    window.addEventListener('click', noteInteraction, true);
    window.addEventListener('keydown', noteKeydown, true);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('click', noteInteraction, true);
      window.removeEventListener('keydown', noteKeydown, true);
      document.removeEventListener('visibilitychange', handleVisibility);
      void flush(true);
    };
  }, [isAuthenticated, isStudent, location.pathname]);
}
