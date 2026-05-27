'use client';

import { FaMusic, FaPlay, FaPause } from 'react-icons/fa';
import { GiNextButton, GiPreviousButton } from 'react-icons/gi';
import { RefObject, useEffect, useRef, useState } from 'react';
import { LuPanelRightOpen } from 'react-icons/lu';

type TrackFull = {
  id: string;
  title: string;
  artist: string;
  duration?: string;
  url?: string;
  coverUrl?: string;
};

function getSavedVolume(): number {
  if (typeof document === 'undefined') return 0.5;
  const cookie = document.cookie
    .split('; ')
    .find((row) => row.startsWith('volume='))
    ?.split('=')[1];
  const parsed = parseFloat(cookie ?? '');
  return isNaN(parsed) ? 0.5 : parsed;
}

export default function BottomPlayer({
  currentTrackIndex,
  currentTrack,
  audioRef,
  currentTime,
  duration,
  Volume,
  setCurrentTime,
  setVolume,
  prevTrack,
  nextTrack,
  formatTime,
  onPanelToggle,
}: {
  currentTrackIndex: number | null;
  currentTrack?: TrackFull;
  audioRef: RefObject<HTMLAudioElement>;
  currentTime: number;
  duration: number;
  Volume: number;
  setCurrentTime: (t: number) => void;
  setVolume: (v: number) => void;
  prevTrack: () => void;
  nextTrack: () => void;
  formatTime: (t: number) => string;
  onPanelToggle?: (open: boolean) => void;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const initialVolumeSet = useRef(false);

  // Apply saved volume before first play
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || initialVolumeSet.current) return;
    const saved = getSavedVolume();
    audio.volume = saved;
    setVolume(saved);
    initialVolumeSet.current = true;
  }, [audioRef.current]);

  // Sync isPlaying with native audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
    };
  }, [audioRef.current]);

  // FIX 1: Don't return null — always render so panel button works
  const hasTrack = currentTrackIndex !== null && !!currentTrack;

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio || !hasTrack) return;
    audio.paused ? audio.play() : audio.pause();
  }

  function handleSeek(value: number) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value;
    setCurrentTime(value);
    if (isPlaying) audio.play();
  }

  function handleVolumeChange(value: number) {
    if (audioRef.current) audioRef.current.volume = value;
    setVolume(value);
    if (typeof document !== 'undefined') {
      document.cookie = `volume=${value}; path=/; max-age=31536000`;
    }
  }

  function togglePanel() {
    const next = !isPanelOpen;
    setIsPanelOpen(next);
    onPanelToggle?.(next);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('PanelStatus', next ? 'show' : 'hidden');
    }
  }

  const savedVolume = getSavedVolume();

  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-center px-2 md:px-4 mb-1 pb-3 md:pb-4 z-50">
      <div className="w-full max-w-260 backdrop-blur-[2px] dark:bg-zinc-900/30 border border-black/10 dark:border-white/10 rounded-2xl px-3 md:px-5 py-3 md:py-3.5">

        {/* ── MOBILE layout (< 768px) ── */}
        <div className="flex md:hidden flex-col gap-2.5">

          {/* Row 1: cover + title + controls */}
          <div className="flex items-center gap-2">
            {/* Cover */}
            <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 border border-black/5 dark:border-white/10">
              {currentTrack?.coverUrl ? (
                <img src={currentTrack.coverUrl} alt={currentTrack.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                  <FaMusic size={12} className="text-zinc-500" />
                </div>
              )}
            </div>

            {/* Title */}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate text-zinc-900 dark:text-white leading-tight">
                {hasTrack ? currentTrack.title : '—'}
              </p>
              <p className="text-xs text-zinc-500 truncate">
                {hasTrack ? currentTrack.artist : 'Нет трека'}
              </p>
            </div>

            {/* Playback buttons */}
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <button
                onClick={prevTrack}
                disabled={!hasTrack}
                className="w-8 h-8 flex items-center justify-center rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all active:scale-90 disabled:opacity-30"
              >
                <GiPreviousButton size={14} />
              </button>
              <button
                onClick={togglePlay}
                disabled={!hasTrack}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-80 transition-all active:scale-90 disabled:opacity-30"
              >
                {isPlaying ? <FaPause size={12} /> : <FaPlay size={12} />}
              </button>
              <button
                onClick={nextTrack}
                disabled={!hasTrack}
                className="w-8 h-8 flex items-center justify-center rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all active:scale-90 disabled:opacity-30"
              >
                <GiNextButton size={14} />
              </button>

              {/* FIX 1: Panel button always active */}
              {/* <button
                onClick={togglePanel}
                className="w-8 h-8 flex items-center justify-center rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all active:scale-90"
              >
                <LuPanelRightOpen size={14} />
              </button> */}
            </div>
          </div>

          {/* Row 2: progress bar */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-zinc-400 tabular-nums w-7">{formatTime(currentTime)}</span>
            <input
              type="range" min={0} max={duration || 0} value={currentTime}
              onChange={(e) => handleSeek(Number(e.target.value))}
              disabled={!hasTrack}
              className="flex-1 h-1 accent-zinc-900 dark:accent-white cursor-pointer disabled:opacity-30"
            />
            <span className="text-[11px] text-zinc-400 tabular-nums w-7 text-right">{formatTime(duration)}</span>
          </div>

          {/* FIX 2: Volume on mobile */}
          <div className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-zinc-400 shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
            </svg>
            <input
              type="range" min={0} max={1} step={0.01}
              defaultValue={savedVolume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="flex-1 h-1 accent-zinc-900 dark:accent-white cursor-pointer"
            />
          </div>
        </div>

        {/* ── DESKTOP layout (≥ 768px) ── */}
        <div
          className="hidden md:grid"
          style={{ gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '16px' }}
        >
          {/* Left: track info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-black/5 dark:border-white/10">
              {currentTrack?.coverUrl ? (
                <img src={currentTrack.coverUrl} alt={currentTrack.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                  <FaMusic size={14} className="text-zinc-500" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate text-zinc-900 dark:text-white">
                {hasTrack ? currentTrack.title : '—'}
              </p>
              <p className="text-xs text-zinc-500 truncate mt-0.5">
                {hasTrack ? currentTrack.artist : 'Нет трека'}
              </p>
            </div>
          </div>

          {/* Center: controls + progress */}
          <div className="flex flex-col items-center gap-2.5">
            <div className="flex items-center gap-1">
              <button onClick={prevTrack} disabled={!hasTrack}
                className="w-8 h-8 flex items-center justify-center rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all active:scale-90 disabled:opacity-30">
                <GiPreviousButton size={15} />
              </button>
              <button onClick={togglePlay} disabled={!hasTrack}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-80 transition-all active:scale-90 disabled:opacity-30">
                {isPlaying ? <FaPause size={13} /> : <FaPlay size={13} />}
              </button>
              <button onClick={nextTrack} disabled={!hasTrack}
                className="w-8 h-8 flex items-center justify-center rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all active:scale-90 disabled:opacity-30">
                <GiNextButton size={15} />
              </button>
            </div>
            <div className="flex items-center gap-2 w-64">
              <span className="text-[11px] text-zinc-400 tabular-nums w-7">{formatTime(currentTime)}</span>
              <input
                type="range" min={0} max={duration || 0} value={currentTime}
                onChange={(e) => handleSeek(Number(e.target.value))}
                disabled={!hasTrack}
                className="flex-1 h-1 accent-zinc-900 dark:accent-white cursor-pointer disabled:opacity-30"
              />
              <span className="text-[11px] text-zinc-400 tabular-nums w-7 text-right">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right: panel toggle + volume */}
          <div className="flex items-center justify-end gap-2">
            <div className="flex items-center gap-2">
              {/* FIX 1: always clickable */}
              <button onClick={togglePanel}
                className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                <LuPanelRightOpen size={13} />
              </button>
              <svg className="w-3.5 h-3.5 text-zinc-400 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
              </svg>
            </div>
            <input
              type="range" min={0} max={1} step={0.01}
              defaultValue={savedVolume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="w-20 h-1 accent-zinc-900 dark:accent-white cursor-pointer"
            />
          </div>
        </div>
      </div>

      {hasTrack && <audio ref={audioRef} src={currentTrack.url} />}
    </div>
  );
}