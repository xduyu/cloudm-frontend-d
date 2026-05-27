'use client';

import { Badge } from '@/components/admin/ui/Badge';
import { useAuth } from '@/context/auth-context';
import Link from 'next/link';
import { FaHeart, FaMusic } from 'react-icons/fa';
import { FiHeart } from 'react-icons/fi';
// import {TUser} from '@/data/types/user'
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

interface Props {
  tracks: Track[];
  currentTrackIndex: number | null;
  search: string;
  isLoading: boolean;
  favouriteIds: string[];
  onSearch: (value: string) => void;
  onPlay: (index: number) => void;
  onToggleFavourite: (id: string) => void;
}

export default function TrackList({
  tracks,
  currentTrackIndex,
  search,
  isLoading,
  favouriteIds,
  onSearch,
  onPlay,
  onToggleFavourite,
}: Props) {
  const {user} = useAuth();
  if (user?.isBanned) {
    return (
    <div className="flex-1 overflow-y-auto pb-28 bg-zinc-50 dark:bg-zinc-950/50 h-screen">
      <div className=" font-work-sans text-zinc-500 flex items-center justify-center h-130 max-h-180">
        <p>Tracks are not available for you</p>
      </div>
    </div>
    );
  }
  return (
    <div className="flex-1 overflow-y-auto pb-28 bg-zinc-50 dark:bg-zinc-950/50">
      <div className="sticky top-0 z-10 bg-zinc-50 dark:bg-zinc-950/80 backdrop-blur-sm px-6 py-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between gap-4">
        <h1 className="text-[17px] font-medium text-zinc-900 dark:text-white whitespace-nowrap">Треки</h1>
        <div className="relative w-64">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-zinc-400 pointer-events-none"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
          >
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            className="w-full bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-lg pl-8 pr-3 py-2 text-[13px] text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none focus:border-black/20 dark:focus:border-white/20 transition-colors"
            placeholder="Поиск..."
            value={search}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="px-4 py-3">
        {isLoading ? (
          <div className="flex flex-col gap-2 mt-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl animate-pulse">
                <div className="w-5 h-3 bg-zinc-200 dark:bg-zinc-800 rounded" />
                <div className="w-11 h-11 bg-zinc-200 dark:bg-zinc-800 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-2/5" />
                  <div className="h-2.5 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : tracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-zinc-400">
            <svg className="w-10 h-10 opacity-30" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
            <p className="text-sm">Треков не найдено</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {tracks.map((track, index) => {
              const isActive = currentTrackIndex === index;
              const isLiked = favouriteIds.includes(track.id);

              return (
                <li
                  key={track.id}
                  onClick={() => onPlay(index)}
                  className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all
                    ${isActive
                      ? 'bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10'
                      : 'border border-transparent hover:bg-white dark:hover:bg-zinc-900 hover:border-black/5 dark:hover:border-white/5'
                    }`}
                >
                  {/* Number / EQ */}
                  <div className="w-5 flex items-center justify-center flex-shrink-0">
                    {isActive ? (
                      <span className="flex items-end gap-[2px] h-[14px]">
                        {[0, 150, 300].map((d) => (
                          <span
                            key={d}
                            className="w-[3px] bg-green-500 rounded-sm"
                            style={{
                              animation: `eq 0.7s ease-in-out ${d}ms infinite alternate`,
                              height: '4px',
                            }}
                          />
                        ))}
                      </span>
                    ) : (
                      <span className="text-[12px] text-zinc-400">{index + 1}</span>
                    )}
                  </div>

                  {/* Cover */}
                  <div className="w-11 h-11 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-black/5 dark:border-white/10 flex items-center justify-center text-lg flex-shrink-0">
                    <div className="w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 border-black/5 dark:border-white/10">
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
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-[13.5px] font-medium truncate ${isActive ? 'text-zinc-900 dark:text-white' : 'text-zinc-800 dark:text-zinc-200'}`}>
                      {track.title}
                    </p>
                    <p className="text-[12px] text-zinc-500 truncate mt-0.5">
                      {track.album} · <Link className='hover:border-b' href={`/creator/${track.artist}`}>{track.artist}</Link>
                    </p>
                    {/* <p className="text-[11px] text-zinc-400 mt-0.5">добавил <Link className='hover:border-b' href={`/creator/${track.addedBy}`}>{track.addedBy}</Link></p> */}
                  </div>

                  {/* Duration */}
                  <span className="text-[12px] text-zinc-400 tabular-nums flex-shrink-0">{track.duration}</span>

                  {/* Heart */}
                  <button
                    onClick={(e) => { e.stopPropagation(); onToggleFavourite(track.id); }}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all flex-shrink-0
                      opacity-0 group-hover:opacity-100
                      ${isLiked ? '!opacity-100 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30' : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'}
                    `}
                  >
                    {isLiked ? <FaHeart size={13} /> : <FiHeart size={13} />}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <style>{`
        @keyframes eq {
          from { height: 4px; }
          to   { height: 13px; }
        }
      `}</style>
    </div>
  );
}