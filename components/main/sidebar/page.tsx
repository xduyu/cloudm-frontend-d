'use client';

import { Badge } from '@/components/admin/ui/Badge';
import { useAuth } from '@/context/auth-context';
import { Track } from '@/data/types/track';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import {
  FaHome, FaHeart, FaPlay, FaShieldAlt,
  FaCompactDisc, FaMusic, FaBars, FaTimes,
} from 'react-icons/fa';
import { MdLogout } from 'react-icons/md';

type TrackFull = Track;
type User = {
  username: string;
  isAdmin: boolean;
  isMod: boolean;
  isArtist: boolean;
  SubScribtionType: string;
  FavouriteTracks: string[];
  isBanned: boolean;
};

export function MobileNav({
  user,
  onOpenDrawer,
}: {
  user: User;
  onOpenDrawer: () => void;
}) {
  const pathname = usePathname();
  const initials = user?.username?.slice(0, 2).toUpperCase() ?? 'U';

  const item = (
    href: string,
    icon: React.ReactNode,
    label: string,
  ) => (
    <Link
      href={href}
      className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors
        ${pathname === href
          ? 'text-white'
          : 'text-zinc-500 hover:text-zinc-300'
        }`}
    >
      <span className={`p-2 rounded-xl transition-colors ${pathname === href ? 'bg-white/10' : ''}`}>
        {icon}
      </span>
      <span className="text-[9px] tracking-wide">{label}</span>
    </Link>
  );

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50
      bg-zinc-950/90 backdrop-blur-xl border-t border-white/10
      flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]
      h-[calc(60px+env(safe-area-inset-bottom))]">
      {item('/', <FaHome size={16} />, 'Главная')}
      {user.isArtist && item('/artist', <FaCompactDisc size={16} />, 'Исполнитель')}
      {(user.isAdmin || user.isMod) && item('/secure/admin', <FaShieldAlt size={16} />, 'Модератор')}
      <button
        onClick={onOpenDrawer}
        className="flex flex-col items-center gap-0.5 px-3 py-1 text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        <span className="p-2 rounded-xl">
          <FaHeart size={16} />
        </span>
        <span className="text-[9px] tracking-wide">Любимые</span>
      </button>
      {/* Avatar — opens drawer */}
      <button
        onClick={onOpenDrawer}
        className="flex flex-col items-center gap-0.5 px-3 py-1 text-zinc-400 hover:text-zinc-200 transition-colors"
      >
        <span className="w-8 h-8 rounded-full bg-blue-900/50 flex items-center justify-center text-[11px] font-semibold text-blue-300">
          {initials}
        </span>
        <span className="text-[9px] tracking-wide truncate max-w-[52px]">{user.username}</span>
      </button>
    </nav>
  );
}

export function MobileDrawer({
  user,
  open,
  onClose,
  onPlay,
}: {
  user: User;
  open: boolean;
  onClose: () => void;
  onPlay?: (track: TrackFull) => void;
}) {
  const { logout } = useAuth();
  const initials = user?.username?.slice(0, 2).toUpperCase() ?? 'U';
  const [likedTracks, setLikedTracks] = useState<TrackFull[]>([]);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user.FavouriteTracks?.length) { setLikedTracks([]); return; }
    const token = localStorage.getItem('token');
    fetch('http://localhost:4000/api/tracks', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(({ tracks }: { tracks: TrackFull[] }) => {
        setLikedTracks(tracks.filter(t => user.FavouriteTracks.includes(t.id)));
      })
      .catch(console.error);
  }, [user?.FavouriteTracks]);

  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const touchStartY = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.changedTouches[0].clientY - touchStartY.current > 80) onClose();
  };

  return (
    <>
      <div
        onClick={handleBackdrop}
        className={`md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300
          ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />
      <div
        ref={drawerRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`md:hidden fixed left-0 right-0 bottom-0 z-50
          bg-zinc-950 border border-white/10 rounded-t-2xl
          flex flex-col
          transition-transform duration-300 ease-out
          max-h-[85dvh]
          ${open ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 flex-shrink-0 border-b border-white/10">
          <h2 className="text-sm font-semibold text-white tracking-tight">Меню</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors p-1">
            <FaTimes size={14} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 overscroll-contain">
          <div className="px-4 pt-4 pb-2">
            <p className="text-[10px] uppercase tracking-widest text-zinc-600 px-1 mb-2">Навигация</p>
            <DrawerNavLinks user={user} onClose={onClose} />
          </div>

          <div className="px-4 pt-2 pb-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-md bg-red-950/60 flex items-center justify-center">
                <FaHeart size={10} className="text-red-400" />
              </div>
              <p className="text-[12px] font-medium text-white">Понравившиеся</p>
              <span className="ml-auto text-[11px] text-zinc-500">
                {likedTracks.length} {pluralize(likedTracks.length, 'трек', 'трека', 'треков')}
              </span>
            </div>

            {likedTracks.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-zinc-600">
                <FaHeart size={22} className="opacity-20" />
                <p className="text-xs">Здесь пока пусто</p>
              </div>
            ) : (
              <div className="flex flex-col gap-0.5">
                {likedTracks.map((track, i) => (
                  <TrackRow
                    key={track.id}
                    track={track}
                    index={i}
                    onPlay={(t) => { onPlay?.(t); onClose(); }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* User footer */}
        <div className="px-4 py-3 border-t border-white/10 flex items-center gap-3 flex-shrink-0
          pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <div className="w-8 h-8 rounded-full bg-blue-900/50 flex items-center justify-center text-[12px] font-semibold text-blue-300 flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-medium text-white truncate">{user.username}</span>
              {user.isBanned && <Badge label="Banned" color="red" />}
            </div>
            <p className="text-[11px] text-zinc-500 capitalize">{user.SubScribtionType}</p>
          </div>
          <button
            onClick={logout}
            className="text-zinc-500 hover:text-white transition-colors p-2"
          >
            <MdLogout size={18} />
          </button>
        </div>
      </div>
    </>
  );
}

export default function Sidebar({
  user,
  onPlay,
}: {
  user: User;
  onPlay?: (track: TrackFull) => void;
}) {
  const { logout } = useAuth();
  const pathname = usePathname();
  const initials = user?.username?.slice(0, 2).toUpperCase() ?? 'U';
  const [likedTracks, setLikedTracks] = useState<TrackFull[]>([]);

  useEffect(() => {
    if (!user.FavouriteTracks?.length) { setLikedTracks([]); return; }
    const token = localStorage.getItem('token');
    fetch('http://localhost:4000/api/tracks', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(({ tracks }: { tracks: TrackFull[] }) => {
        setLikedTracks(tracks.filter(t => user.FavouriteTracks.includes(t.id)));
      })
      .catch(console.error);
  }, [user?.FavouriteTracks]);
  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', '300px');
    return () => document.documentElement.style.removeProperty('--sidebar-width');
  }, []);
  if (!user) {
    return (
      <aside className="hidden md:flex w-[300px] h-screen items-center justify-center">
        <p className="text-sm text-zinc-400">Loading...</p>
      </aside>
    );
  }

  const navLink = (
    href: string,
    icon: React.ReactNode,
    label: string,
    count?: number,
  ) => (
    <Link
      href={href}
      className={`flex items-center gap-2.5 px-2 py-[7px] rounded-lg text-[13px] transition-colors
        ${pathname === href
          ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white'
          : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white'
        }`}
    >
      <span className="opacity-70 flex-shrink-0">{icon}</span>
      {label}
      {count !== undefined && count > 0 && (
        <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border border-black/5 dark:border-white/10">
          {count}
        </span>
      )}
    </Link>
  );

  return (
    <aside className="hidden md:flex w-[300px] min-w-[220px] z-[99999] h-screen flex-col bg-white dark:bg-zinc-900/30 border border-black/10 dark:border-white/10 rounded-2xl overflow-hidden">
      <div className="p-4 pb-3">
        <h1 className="font-playwrite-at text-[19px] mb-5 text-zinc-900 dark:text-white">Cloudm</h1>
        <p className="text-[10px] uppercase tracking-widest text-zinc-400 px-2 mb-1">Главное</p>
        <div className="flex flex-col gap-0.5">
          {navLink('/', <FaHome size={13} />, 'Главная')}
        </div>

        {(user.isAdmin || user.isMod || user.isArtist) && (
          <>
            <hr className="my-3 border-black/10 dark:border-white/10" />
            <p className="text-[10px] uppercase tracking-widest text-zinc-400 px-2 mb-1">Панели</p>
            <div className="flex flex-col gap-0.5">
              {user.isArtist && navLink('/artist', <FaCompactDisc size={12} />, 'Панель исполнителя')}
              {(user.isAdmin || user.isMod) && navLink('/secure/admin', <FaShieldAlt size={12} />, 'Панель модератора')}
            </div>
          </>
        )}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden border-t border-black/10 dark:border-white/10">
        <div className="flex items-center gap-2 px-4 py-3 flex-shrink-0">
          <div className="w-[26px] h-[26px] rounded-[6px] bg-red-50 dark:bg-red-950/40 flex items-center justify-center">
            <FaHeart size={11} className="text-red-500" />
          </div>
          <span className="text-[12px] font-medium text-zinc-900 dark:text-white">Понравившиеся</span>
          <span className="ml-auto text-[11px] text-zinc-400">
            {likedTracks.length} {pluralize(likedTracks.length, 'трек', 'трека', 'треков')}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {likedTracks.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-zinc-400">
              <FaHeart size={24} className="opacity-20" />
              <p className="text-xs text-center">Здесь пока пусто</p>
            </div>
          ) : (
            likedTracks.map((track, i) => (
              <TrackRow key={track.id} track={track} index={i} onPlay={onPlay} />
            ))
          )}
        </div>
      </div>

      <div className="px-3.5 py-3 border-t border-black/10 dark:border-white/10 flex justify-between items-center gap-2.5 flex-shrink-0">
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-[11px] font-medium text-blue-700 dark:text-blue-300">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="text-[12.5px] font-medium text-zinc-900 dark:text-white truncate flex gap-2 items-center">
              {user.username}
              <div className="mb-0.5">
                {user.isBanned && <Badge label="Banned" color="red" />}
              </div>
            </div>
            <p className="text-[11px] text-zinc-400">{user.SubScribtionType}</p>
          </div>
        </div>
        <button className="cursor-pointer text-zinc-400 hover:text-zinc-100 transition-all duration-300" onClick={logout}>
          <MdLogout size={18} />
        </button>
      </div>
    </aside>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function DrawerNavLinks({ user, onClose }: { user: User; onClose: () => void }) {
  const pathname = usePathname();

  const item = (href: string, icon: React.ReactNode, label: string) => (
    <Link
      key={href}
      href={href}
      onClick={onClose}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-colors
        ${pathname === href
          ? 'bg-white/10 text-white'
          : 'text-zinc-400 hover:bg-white/5 hover:text-white'
        }`}
    >
      <span className="opacity-60 flex-shrink-0">{icon}</span>
      {label}
    </Link>
  );

  return (
    <div className="flex flex-col gap-0.5">
      {item('/', <FaHome size={14} />, 'Главная')}
      {user.isArtist && item('/artist', <FaCompactDisc size={13} />, 'Панель исполнителя')}
      {(user.isAdmin || user.isMod) && item('/secure/admin', <FaShieldAlt size={13} />, 'Панель модератора')}
    </div>
  );
}

function TrackRow({
  track,
  index,
  onPlay,
}: {
  track: TrackFull;
  index: number;
  onPlay?: (track: TrackFull) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors active:scale-[0.98]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onPlay?.(track)}
    >
      <span className="w-4 text-center text-[11px] text-zinc-400 flex-shrink-0 flex items-center justify-center">
        {hovered ? <FaPlay size={9} className="text-zinc-700 dark:text-zinc-300" /> : index + 1}
      </span>
      <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 border border-black/5 dark:border-white/10">
        {track.coverUrl ? (
          <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
            <FaMusic size={14} className="text-zinc-500" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12.5px] font-medium text-zinc-900 dark:text-white truncate">{track.title}</p>
        <p className="text-[11px] text-zinc-500 mt-0.5">{track.artist}</p>
      </div>
      {track.duration && (
        <span className="text-[11px] text-zinc-400 tabular-nums flex-shrink-0">{track.duration}</span>
      )}
    </div>
  );
}

function pluralize(n: number, one: string, few: string, many: string) {
  const mod10 = n % 10, mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}