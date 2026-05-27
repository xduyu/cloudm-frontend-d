"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/auth-context';
import { SERVER_URL } from '@/data/SERVER_URL';
import { FaEdit, FaTrash, FaPlay, FaPause, FaPlus, FaTimes, FaMusic, FaUpload, FaImage } from 'react-icons/fa';
import Sidebar from '../main/sidebar/page';

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  addedBy: string;
  plays: number;
  url: string;
  coverUrl: string | null;
}

const emptyForm = { title: '', artist: '', album: '', duration: '' };

export default function ArtistPage() {
  const { user, token } = useAuth();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTrack, setEditTrack] = useState<Track | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = user?.isAdmin || user?.isMod;
  const canManage = isAdmin || user?.isArtist;

  // ─── Fetch ────────────────────────────────────────────────────
  async function fetchTracks() {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${SERVER_URL}/tracks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTracks(data.tracks || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { if (user && token) fetchTracks(); }, [user, token]);

  // ─── Submit ───────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editTrack) {
        const formData = new FormData();
        formData.append('title', form.title);
        formData.append('artist', form.artist);
        formData.append('album', form.album);
        formData.append('duration', form.duration);
        if (cover) formData.append('cover', cover);

        const res = await fetch(`${SERVER_URL}/tracks/${editTrack.id}`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (res.ok) {
          closeForm();
          fetchTracks();
        }
      } else {
        if (!file) return;

        const formData = new FormData();
        formData.append('title', form.title);
        formData.append('artist', form.artist);
        formData.append('album', form.album);
        formData.append('duration', form.duration);
        formData.append('file', file);
        if (cover) formData.append('cover', cover);

        const res = await fetch(`${SERVER_URL}/tracks`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (res.ok) {
          closeForm();
          fetchTracks();
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  // ─── Delete ───────────────────────────────────────────────────
  async function handleDelete(id: string) {
    try {
      await fetch(`${SERVER_URL}/tracks/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeleteConfirmId(null);
      fetchTracks();
    } catch (err) {
      console.error(err);
    }
  }

  // ─── Helpers ──────────────────────────────────────────────────
  function startEdit(track: Track) {
    setEditTrack(track);
    setForm({ title: track.title, artist: track.artist, album: track.album, duration: track.duration });
    setFile(null);
    setCover(null);
    setCoverPreview(track.coverUrl || null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function closeForm() {
    setShowForm(false);
    setEditTrack(null);
    setForm(emptyForm);
    setFile(null);
    setCover(null);
    setCoverPreview(null);
  }

  function handleCoverChange(f: File | null) {
    setCover(f);
    if (coverPreview && coverPreview.startsWith('blob:')) URL.revokeObjectURL(coverPreview);
    setCoverPreview(f ? URL.createObjectURL(f) : null);
  }

  function togglePlay(track: Track) {
    const audio = audioRefs.current[track.id];
    if (!audio) return;

    if (playingId === track.id) {
      audio.pause();
      setPlayingId(null);
    } else {
      Object.entries(audioRefs.current).forEach(([id, a]) => {
        if (id !== track.id) a.pause();
      });
      audio.play();
      setPlayingId(track.id);
    }
  }

  const filtered = tracks.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.artist.toLowerCase().includes(search.toLowerCase()) ||
    t.album.toLowerCase().includes(search.toLowerCase())
  );

  // ─── Guards ───────────────────────────────────────────────────
  if (!user) return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-zinc-400 text-sm">Загрузка...</p>
    </div>
  );
  if (!canManage) return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-zinc-400 text-sm">Нет доступа к этой странице.</p>
    </div>
  );

  return (
    <div className="h-screen flex gap-5 justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="p-3 flex flex-col">
        <Sidebar user={user} />
      </div>
      <div className="w-6xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div>
            <h1 className="text-[18px] font-medium text-zinc-900 dark:text-white">
              {isAdmin ? 'Все треки' : 'Мои треки'}
            </h1>
            <p className="text-[12px] text-zinc-400 mt-0.5">
              {filtered.length} {pluralize(filtered.length, 'трек', 'трека', 'треков')} · управление контентом
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-[13px] h-[13px] text-zinc-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                className="bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-lg pl-8 pr-3 py-2 text-[13px] text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none w-48 focus:border-black/20 dark:focus:border-white/20 transition-colors"
                placeholder="Поиск..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button
              onClick={() => showForm ? closeForm() : setShowForm(true)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] font-medium transition-all ${
                showForm
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-black/10 dark:border-white/10'
                  : 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-80'
              }`}
            >
              {showForm ? <FaTimes size={11} /> : <FaPlus size={11} />}
              {showForm ? 'Отмена' : 'Добавить трек'}
            </button>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-2xl p-5 mb-5">
            <h2 className="text-[14px] font-medium text-zinc-900 dark:text-white mb-4">
              {editTrack ? 'Редактировать трек' : 'Новый трек'}
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">

              {/* Upload row: audio + cover */}
              <div className="grid grid-cols-2 gap-2.5">

                {/* Audio drop zone */}
                {!editTrack && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border rounded-xl p-4 text-center cursor-pointer transition-colors ${
                      file
                        ? 'border-green-500/30 bg-green-50 dark:bg-green-950/20'
                        : 'border-dashed border-black/15 dark:border-white/15 hover:border-black/30 dark:hover:border-white/30 bg-zinc-50 dark:bg-zinc-950/50'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".mp3,.wav,.flac,.ogg,.m4a"
                      className="hidden"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                    {file ? (
                      <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-400">
                        <FaMusic size={14} />
                        <span className="text-[13px] font-medium truncate max-w-[160px]">{file.name}</span>
                        <span className="text-[11px] opacity-60 flex-shrink-0">({(file.size / 1024 / 1024).toFixed(1)} МБ)</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5">
                        <FaUpload size={16} className="text-zinc-400" />
                        <p className="text-[13px] text-zinc-500">Нажмите чтобы загрузить аудио</p>
                        <p className="text-[11px] text-zinc-400">mp3, wav, flac, ogg, m4a · до 50 МБ</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Cover drop zone */}
                <div
                  onClick={() => coverInputRef.current?.click()}
                  className={`border rounded-xl cursor-pointer transition-colors overflow-hidden ${
                    editTrack ? 'col-span-2' : ''
                  } ${
                    coverPreview
                      ? 'border-violet-500/30'
                      : 'border-dashed border-black/15 dark:border-white/15 hover:border-black/30 dark:hover:border-white/30 bg-zinc-50 dark:bg-zinc-950/50'
                  }`}
                >
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="hidden"
                    onChange={(e) => handleCoverChange(e.target.files?.[0] || null)}
                  />
                  {coverPreview ? (
                    <div className="relative group">
                      <img
                        src={coverPreview}
                        alt="cover preview"
                        className="w-full h-[88px] object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                        <FaImage size={13} className="text-white" />
                        <span className="text-[12px] text-white font-medium">Сменить обложку</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-1.5 p-4 h-full min-h-[88px]">
                      <FaImage size={16} className="text-zinc-400" />
                      <p className="text-[13px] text-zinc-500">Обложка трека (необязательно)</p>
                      <p className="text-[11px] text-zinc-400">jpg, png, webp · до 5 МБ</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Text fields */}
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { key: 'title', placeholder: 'Название трека' },
                  { key: 'artist', placeholder: 'Артист' },
                  { key: 'album', placeholder: 'Альбом' },
                  { key: 'duration', placeholder: 'Длительность (3:45)' },
                ].map(({ key, placeholder }) => (
                  <input
                    key={key}
                    className="bg-zinc-50 dark:bg-zinc-950/50 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-[13px] text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none focus:border-black/20 dark:focus:border-white/20 transition-colors"
                    placeholder={placeholder}
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    required={key !== 'duration'}
                  />
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 rounded-lg text-[13px] text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={submitting || (!file && !editTrack)}
                  className="px-4 py-2 rounded-lg text-[13px] font-medium bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-80 disabled:opacity-40 transition-all"
                >
                  {submitting ? 'Сохранение...' : editTrack ? 'Сохранить' : 'Добавить'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Track list */}
        <div className="bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-2xl overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col gap-0">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-black/5 dark:border-white/5 last:border-0 animate-pulse">
                  <div className="w-4 h-3 bg-zinc-200 dark:bg-zinc-800 rounded" />
                  <div className="w-10 h-10 bg-zinc-200 dark:bg-zinc-800 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3" />
                    <div className="h-2.5 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4" />
                  </div>
                  <div className="w-32 h-7 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-zinc-400">
              <FaMusic size={28} className="opacity-20" />
              <p className="text-sm">Треков не найдено</p>
            </div>
          ) : (
            <ul>
              {filtered.map((track, i) => {
                const canEdit = isAdmin || track.addedBy === user.username;
                const isPlaying = playingId === track.id;

                return (
                  <li
                    key={track.id}
                    className="flex items-center gap-3 px-4 py-3 border-b border-black/5 dark:border-white/5 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-950/50 group transition-colors"
                  >
                    {/* Index / play */}
                    <div className="w-5 flex items-center justify-center flex-shrink-0">
                      <span className="text-[11px] text-zinc-400 group-hover:hidden">{i + 1}</span>
                      <button
                        onClick={() => togglePlay(track)}
                        className="hidden group-hover:flex w-5 h-5 items-center justify-center text-zinc-700 dark:text-zinc-300"
                      >
                        {isPlaying ? <FaPause size={10} /> : <FaPlay size={10} />}
                      </button>
                    </div>

                    {/* Cover */}
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-black/5 dark:border-white/10">
                      {track.coverUrl ? (
                        <img
                          src={track.coverUrl}
                          alt={track.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                          <FaMusic size={14} className="text-zinc-500" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-zinc-900 dark:text-white truncate">{track.title}</p>
                      <p className="text-[11px] text-zinc-500 mt-0.5 truncate">
                        {track.album} · {track.artist}
                        {isAdmin && track.addedBy !== user.username && (
                          <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                            {track.addedBy}
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Hidden audio */}
                    <audio
                      ref={(el) => { if (el) audioRefs.current[track.id] = el; }}
                      src={track.url}
                      onEnded={() => setPlayingId(null)}
                      onPlay={() => setPlayingId(track.id)}
                      onPause={() => setPlayingId(prev => prev === track.id ? null : prev)}
                    />

                    {/* Duration */}
                    <span className="text-[11px] text-zinc-400 tabular-nums flex-shrink-0 w-8 text-right">
                      {track.duration || '—'}
                    </span>

                    {/* Actions */}
                    {canEdit && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        {deleteConfirmId === track.id ? (
                          <>
                            <span className="text-[11px] text-zinc-500 mr-1">Удалить?</span>
                            <button
                              onClick={() => handleDelete(track.id)}
                              className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
                            >
                              Да
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2.5 py-1 rounded-md text-[11px] text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            >
                              Нет
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(track)}
                              className="w-7 h-7 flex items-center justify-center rounded-md text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            >
                              <FaEdit size={11} />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(track.id)}
                              className="w-7 h-7 flex items-center justify-center rounded-md text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                            >
                              <FaTrash size={11} />
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function pluralize(n: number, one: string, few: string, many: string) {
  const mod10 = n % 10, mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}