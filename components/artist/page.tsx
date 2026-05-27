/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useEffect, useRef, useState } from 'react'
import Sidebar from '../main/sidebar/page';
import { useAuth } from '@/context/auth-context';
import Link from 'next/link';
import { SERVER_URL } from '@/data/SERVER_URL';
import { Track } from '@/data/types/track';
import BottomPlayer from '../main/bottom_Player/BottomPlayer';
import CreatorComponentPage from './creatorPage/page';



export default function CreatorPage({ slug }: { slug: string }) {
  const { user, isAuthenticated, token } = useAuth();
  const artistName = slug;
  const [tracks, setTracks] = useState<Track[]>([]);
  const [search] = useState("");
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);
  const [, setIsLoading] = useState(true);
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

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleEnded = () => nextTrack();
    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, [currentTrackIndex, filtered]);

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

  function formatTime(time: number) {
    if (!time) return "0:00";
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  // function playTrack(index: number) { setCurrentTrackIndex(index); }
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
    <div className='flex h-screen gap-5'>
      <div className="p-3 flex flex-col">
        <Sidebar user={user} onPlay={playTrackByObject} />
      </div>
      <div className="p-3">
        <CreatorComponentPage artistName={artistName}/>
      </div>
      <div className=""></div>
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
  )
}
