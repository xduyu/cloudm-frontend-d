"use client"
import { useAuth } from '@/context/auth-context';
import { SERVER_URL } from '@/data/SERVER_URL';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react'
import Sidebar from './sidebar/page';
import TrackList from './TrackList/TrackList';
import NowPlaying from './NowPlaying/NowPlaying';
import BottomPlayer from './bottom_Player/BottomPlayer';


interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  addedBy: string;
  plays: number;
  url: string;
}

export default function MainPage() {
  const { user, isAuthenticated, refreshUser, token } = useAuth();

  const [tracks, setTracks] = useState<Track[]>([]);
  const [search, setSearch] = useState("");
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [Volume, setVolume] = useState(0.1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = currentTrackIndex !== null ? tracks[currentTrackIndex] : null;

  const filtered = tracks.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.artist.toLowerCase().includes(search.toLowerCase()) ||
    t.album.toLowerCase().includes(search.toLowerCase())
  );

  // ─── Audio events ─────────────────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const updateTime = () => setCurrentTime(audio.currentTime);
    const setMeta = () => setDuration(audio.duration || 0);
    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", setMeta);
    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", setMeta);
    };
  }, [currentTrackIndex]);

  // ─── Autoplay next ────────────────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleEnded = () => nextTrack();
    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, [currentTrackIndex, filtered]);

  // ─── Fetch ────────────────────────────────────────────────────
  async function fetchTracks() {
    if (!token) return;
    try {
      setIsLoading(true);
      const res = await fetch(`${SERVER_URL}/tracks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setTracks(data.tracks || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { if (token) fetchTracks(); }, [token]);

  // ─── Helpers ──────────────────────────────────────────────────
  function formatTime(time: number) {
    if (!time) return "0:00";
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  function playTrack(index: number) { setCurrentTrackIndex(index); }
  function nextTrack() {
    if (currentTrackIndex === null) return;
    setCurrentTrackIndex((currentTrackIndex + 1) % filtered.length);
  }
  function prevTrack() {
    if (currentTrackIndex === null) return;
    setCurrentTrackIndex((currentTrackIndex - 1 + filtered.length) % filtered.length);
  }
  function playTrackByObject(track: Track) {
    const index = tracks.findIndex(t => t.id === track.id);
    if (index !== -1) setCurrentTrackIndex(index);
  }
  async function toggleFavourite(trackId: string) {
    if (!token) return;
    await fetch(`${SERVER_URL}/tracks/add-favorite/${trackId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchTracks();
    await refreshUser();
  }

  // ─── Auth guard ───────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className='text-white flex flex-col items-center justify-center h-screen gap-4'>
        <h1 className='text-5xl font-playwrite-at'>Please log in</h1>
        <Link href="/authorization/login" className='font-work-sans'>Go to Login</Link>
      </div>
    );
  }

  return (
    <div className="flex h-screen">

      {/* Sidebar */}
      <div className="md:p-3 flex flex-col">
        <Sidebar user={user} onPlay={playTrackByObject} />
      </div>

      {/* Track list */}
      <TrackList
        tracks={filtered}
        currentTrackIndex={currentTrackIndex}
        search={search}
        isLoading={isLoading}
        favouriteIds={user?.FavouriteTracks ?? []}
        onSearch={setSearch}
        onPlay={playTrack}
        onToggleFavourite={toggleFavourite}
      />

      {/* Now Playing panel */}
      <div className="">
        {/* <h2 className="text-xl mb-4">🎧 Now Playing</h2>
        {currentTrack ? (
          <div className="bg-gray-900 p-4 rounded">
            <div className="w-full h-40 bg-gray-700 rounded mb-4 flex items-center justify-center text-3xl">🎵</div>
            <h3 className="text-lg font-bold">{currentTrack.title}</h3>
            <p className="text-gray-400">{currentTrack.artist}</p>
            <div className="mt-3 text-sm text-gray-500 space-y-1">
              <p>💿 {currentTrack.album}</p>
              <p>👤 {currentTrack.addedBy}</p>
              <p>▶️ {audioRef.current?.paused ? "Paused" : "Playing"}</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Select a track</p>
        )} */}
        <NowPlaying currentTrack={currentTrack} audioRef={audioRef} />
      </div>

      {/* Bottom Player */}
      {/* {currentTrackIndex !== null && (
        <div className="fixed bottom-0 left-0 right-0 flex justify-center px-4 mb-1 pb-4 z-50">
          <div
            className="w-full max-w-260 dark:bg-zinc-900/30 border border-black/10 dark:border-white/10 rounded-2xl px-5 py-3.5"
            style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '16px' }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-black/5 dark:border-white/10 flex items-center justify-center text-lg shrink-0"><FaMusic size={10} className="text-zinc-400" /></div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate text-zinc-900 dark:text-white">{currentTrack?.title}</p>
                <p className="text-xs text-zinc-500 truncate mt-0.5">{currentTrack?.artist}</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2.5">
              <div className="flex items-center gap-1">
                <button onClick={prevTrack} className="w-8 h-8 flex items-center justify-center rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all active:scale-90">
                  <GiPreviousButton size={15} />
                </button>
                <button
                  onClick={() => audioRef.current?.paused ? audioRef.current.play() : audioRef.current?.pause()}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-80 transition-all active:scale-90"
                >
                  {audioRef.current?.paused ? <FaPlay size={13} /> : <FaPause size={13} />}
                </button>
                <button onClick={nextTrack} className="w-8 h-8 flex items-center justify-center rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all active:scale-90">
                  <GiNextButton size={15} />
                </button>
              </div>
              <div className="flex items-center gap-2 w-64">
                <span className="text-[11px] text-zinc-400 tabular-nums w-7">{formatTime(currentTime)}</span>
                <input
                  type="range" min={0} max={duration || 0} value={currentTime}
                  onChange={(e) => {
                    const t = Number(e.target.value);
                    if (audioRef.current) { audioRef.current.currentTime = t; setCurrentTime(t); }
                  }}
                  className="flex-1 h-1 accent-zinc-900 dark:accent-white cursor-pointer"
                />
                <span className="text-[11px] text-zinc-400 tabular-nums w-7 text-right">{formatTime(duration)}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <svg className="w-3.5 h-3.5 text-zinc-400 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
              </svg>
              <input
                type="range" min={0} max={1} step={0.01} defaultValue={document.cookie.split('; ').find(row => row.startsWith('volume='))?.split('=')[1] || Volume}
                onChange={(e) => { 
                  if (audioRef.current) audioRef.current.volume = Number(e.target.value);
                  setVolume(Number(e.target.value));
                  document.cookie = `volume=${e.target.value}; path=/; max-age=31536000`; // сохраняем в cookie на год
                }}
                className="w-20 h-1 accent-zinc-900 dark:accent-white cursor-pointer"
              />
            </div>
          </div>
          <audio ref={audioRef} src={currentTrack?.url} autoPlay />
        </div>
      )} */}
      <BottomPlayer
        currentTrackIndex={currentTrackIndex}
        currentTrack={currentTrack}
        audioRef={audioRef}
        currentTime={currentTime}
        duration={duration}
        Volume={Volume}
        setCurrentTime={setCurrentTime}
        setVolume={setVolume}
        prevTrack={prevTrack}
        nextTrack={nextTrack}
        formatTime={formatTime}
      />
    </div>
  );
}