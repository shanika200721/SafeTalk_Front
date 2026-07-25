import React, { useEffect, useRef, useState } from 'react';
import { HeartIcon, MusicIcon, PauseIcon, PlayIcon } from 'lucide-react';
import wellnessService from '../services/wellnessService';
import { ambientSounds } from '../data/wellnessContent';
import { WellnessCard, WellnessLayout } from '../components/wellness/WellnessLayout';

const frequencies = {
  Rain: 180,
  Ocean: 120,
  Forest: 240,
  Wind: 160,
  Fireplace: 95,
  'White Noise': 420,
  'Brown Noise': 80,
  Cafe: 260,
};

const AmbientSounds = () => {
  const [sounds, setSounds] = useState(ambientSounds.map((title) => ({ id: title.toLowerCase().replaceAll(' ', '-'), title })));
  const [selected, setSelected] = useState('Rain');
  const [volume, setVolume] = useState(35);
  const [timer, setTimer] = useState(10);
  const [loop, setLoop] = useState(true);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    wellnessService.getAmbientSounds()
      .then((data) => setSounds(data.items || sounds))
      .catch(() => {});
  }, []);

  const stop = () => {
    window.clearTimeout(timerRef.current);
    const audio = audioRef.current;
    if (audio) {
      audio.gain.gain.linearRampToValueAtTime(0.0001, audio.context.currentTime + 0.25);
      window.setTimeout(() => {
        audio.source.stop();
        audio.context.close();
      }, 280);
    }
    audioRef.current = null;
    setPlaying(false);
  };

  const play = () => {
    if (audioRef.current) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const context = new AudioContext();
    const source = context.createOscillator();
    const gain = context.createGain();
    source.type = selected.includes('Noise') ? 'triangle' : 'sine';
    source.frequency.value = frequencies[selected] || 180;
    source.connect(gain);
    gain.connect(context.destination);
    gain.gain.value = volume / 2500;
    source.start();
    audioRef.current = { context, source, gain };
    setPlaying(true);
    if (!loop) timerRef.current = window.setTimeout(stop, timer * 60 * 1000);
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.gain.gain.linearRampToValueAtTime(volume / 2500, audioRef.current.context.currentTime + 0.15);
    }
  }, [volume]);

  useEffect(() => () => stop(), []);

  const toggleFavorite = (sound) => {
    setSounds((items) => items.map((item) => item.id === sound.id ? { ...item, favorite: !item.favorite } : item));
  };

  return (
    <WellnessLayout
      title="Ambient Sounds"
      eyebrow="No Autoplay"
      description="Choose gentle background sound with volume, timer, loop, and favorites. Audio starts only when you press Play."
      action={<MusicIcon className="w-8 h-8" />}
    >
      <section className="wellness-card-grid wellness-card-grid-4">
        {sounds.map((sound) => (
          <WellnessCard key={sound.id} icon={MusicIcon} title={sound.title} subtitle="Timer-based sound" className={selected === sound.title ? 'wellness-card-selected' : ''}>
            <div className="wellness-card-actions">
              <button type="button" className="student-btn student-btn-secondary" onClick={() => { stop(); setSelected(sound.title); }}>Select</button>
              <button type="button" className="wellness-icon-action" onClick={() => toggleFavorite(sound)} aria-label={`Favorite ${sound.title}`} aria-pressed={Boolean(sound.favorite)}>
                <HeartIcon className="w-5 h-5" fill={sound.favorite ? 'currentColor' : 'none'} />
              </button>
            </div>
          </WellnessCard>
        ))}
      </section>

      <section className="wellness-panel sound-control-panel">
        <div>
          <p className="wellness-eyebrow">Selected Sound</p>
          <h2>{selected}</h2>
        </div>
        <label>
          Volume
          <input type="range" min="0" max="100" value={volume} onChange={(event) => setVolume(Number(event.target.value))} />
        </label>
        <label>
          Timer
          <select value={timer} onChange={(event) => setTimer(Number(event.target.value))}>
            <option value={5}>5 minutes</option>
            <option value={10}>10 minutes</option>
            <option value={20}>20 minutes</option>
            <option value={30}>30 minutes</option>
          </select>
        </label>
        <label className="wellness-check">
          <input type="checkbox" checked={loop} onChange={(event) => setLoop(event.target.checked)} />
          Loop until stopped
        </label>
        <div className="wellness-control-row">
          <button type="button" className="student-btn student-btn-primary" onClick={play} disabled={playing}>
            <PlayIcon className="w-4 h-4" />
            Play
          </button>
          <button type="button" className="student-btn student-btn-warning" onClick={stop} disabled={!playing}>
            <PauseIcon className="w-4 h-4" />
            Stop
          </button>
        </div>
      </section>
    </WellnessLayout>
  );
};

export default AmbientSounds;
