'use client';

import { RefObject } from 'react';
import { FaCompactDisc, FaClock, FaUser, FaMusic } from 'react-icons/fa';
import { Track } from '@/data/types/track';

interface Props {
  currentTrack: Track | null;
  audioRef: RefObject<HTMLAudioElement | null>;
}

export default function NowPlaying({ currentTrack, audioRef }: Props) {
  // eslint-disable-next-line react-hooks/refs
  const isPlaying = currentTrack && !audioRef.current?.paused;
  if (localStorage.getItem("PanelStatus") == "hidden") return (<></>);
  return (
    <aside className="w-[360px] min-w-[260px] max-lg:hidden h-screen flex flex-col bg-white dark:bg-zinc-950 border-l border-black/10 dark:border-white/10 overflow-hidden">

      {/* Header */}
      <div className="px-4 py-[16px] border-b border-black/10 dark:border-white/10 flex items-center justify-between shrink-0">
        <span className="text-[11px] font-medium uppercase tracking-widest text-zinc-400">
          Сейчас играет
        </span>
        {currentTrack && (
          <span className={`i   nline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${
            isPlaying
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full bg-current ${isPlaying ? 'animate-pulse' : ''}`} />
            {isPlaying ? 'Playing' : 'Paused'}
          </span>
        )}
      </div>

      {/* Body */}
      {currentTrack ? (
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">

          {/* Cover */}
          <div className="w-full aspect-square rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-black/5 dark:border-white/10 flex items-center justify-center text-5xl">
            {currentTrack.coverUrl ? (
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-full h-full rounded-xl object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <FaMusic size={24} className="text-zinc-500" />
              </div>
            )}
          </div>

          {/* Title + artist */}
          <div>
            <h3 className="text-[15px] font-medium text-zinc-900 dark:text-white leading-snug">
              {currentTrack.title}
            </h3>
            <p className="text-[13px] text-zinc-500 mt-1">{currentTrack.artist}</p>
          </div>

          <hr className="border-black/10 dark:border-white/10" />

          {/* Meta */}
          <div className="flex flex-col gap-2.5">
            <MetaRow
              icon={<FaCompactDisc size={12} />}
              label="Альбом"
              value={currentTrack.album}
            />
            <MetaRow
              icon={<FaUser size={11} />}
              label="Добавил"
              value={currentTrack.addedBy}
            />
            <MetaRow
              icon={<FaClock size={11} />}
              label="Длительность"
              value={currentTrack.duration || '—'}
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 px-4 text-center">
          <svg className="w-10 h-10 text-zinc-300 dark:text-zinc-700" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
          <p className="text-[13px] text-zinc-400">Выберите трек</p>
          <p className="text-[12px] text-zinc-300 dark:text-zinc-600">Нажмите на любой трек чтобы начать</p>
        </div>
      )}
    </aside>
  );
}

function MetaRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-black/5 dark:border-white/10 flex items-center justify-center text-zinc-500 flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-zinc-400">{label}</p>
        <p className="text-[13px] font-medium text-zinc-900 dark:text-white truncate">{value}</p>
      </div>
    </div>
  );
}