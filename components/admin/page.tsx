"use client"
import React, { useEffect, useState } from 'react'
import { useAuth } from '@/context/auth-context'
import { SERVER_URL } from '@/data/SERVER_URL'
import { FaUsers, FaMusic, FaChartBar } from 'react-icons/fa'
import { MdAdminPanelSettings } from 'react-icons/md'
import Sidebar from '../main/sidebar/page'
import { Badge } from './ui/Badge'
import { StatsTab } from './StatsTab/StatsTab'
import { UsersTab } from './UsersTab/UsersTab'
import { TracksTab } from './TracksTab/TracksTab'

interface User {
  username: string
  email: string
  isArtist: boolean
  isAdmin: boolean
  isMod: boolean
  SubScribtionType: string
  FavouriteTracks: string[]
  subscribedArtists: string[]
}

interface Track {
  id: string
  title: string
  artist: string
  album: string
  duration?: string
  addedBy: string
  plays: number
  url: string
}

interface Stats {
  totalUsers: number
  totalTracks: number
  totalArtists: number
  totalAdmins: number
  totalMods: number
  totalPlays: number
  subscriptions: { free: number; premium: number; platinum: number }
}

type Tab = 'stats' | 'users' | 'tracks'

export default function SecurePage() {
  const { user, token } = useAuth()
  const [tab, setTab] = useState<Tab>('stats')
  const [users, setUsers] = useState<User[]>([])
  const [tracks, setTracks] = useState<Track[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  
  async function loadAll() {
    setIsLoading(true)
    try {
      const [usersRes, tracksRes, statsRes] = await Promise.all([
        fetch(`${SERVER_URL}/admin/users`, { headers }),
        fetch(`${SERVER_URL}/admin/tracks`, { headers }),
        fetch(`${SERVER_URL}/admin/stats`, { headers }),
      ])
      if (usersRes.ok) setUsers((await usersRes.json()).users)
        if (tracksRes.ok) setTracks((await tracksRes.json()).tracks)
          if (statsRes.ok) setStats(await statsRes.json())
        } finally {
      setIsLoading(false)
    }
  }
    
    useEffect(() => { loadAll() }, [])

  if (!user) return null

  async function patchUser(username: string, updates: Partial<User>) {
    await fetch(`${SERVER_URL}/admin/users/${username}`, {
      method: 'PATCH', headers, body: JSON.stringify(updates),
    })
    setUsers(prev => prev.map(u => u.username === username ? { ...u, ...updates } : u))
  }

  async function deleteUser(username: string) {
    if (!confirm(`Удалить пользователя ${username}?`)) return
    await fetch(`${SERVER_URL}/admin/users/${username}`, { method: 'DELETE', headers })
    setUsers(prev => prev.filter(u => u.username !== username))
  }

  const onBan = async (username: string, banned: boolean) => {
  try {
        const res = await fetch(`${SERVER_URL}/admin/ban`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ username, banned }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'Ошибка при бане');
        }

        setUsers(prev =>
          prev.map(u =>
            u.username === username ? { ...u, isBanned: data.user.isBanned } : u
          )
        );

      } catch (err: unknown) {
        console.error(err);
        const message = err instanceof Error ? err.message : 'Ошибка при бане';
        alert(message);
      }
    };

  async function deleteTrack(id: string) {
    if (!confirm('Удалить трек?')) return
    await fetch(`${SERVER_URL}/admin/tracks/${id}`, { method: 'DELETE', headers })
    setTracks(prev => prev.filter(t => t.id !== id))
  }

  

  async function saveTrack(track: Track) {
    await fetch(`${SERVER_URL}/admin/tracks/${track.id}`, {
      method: 'PUT', headers,
      body: JSON.stringify({ title: track.title, artist: track.artist, album: track.album, duration: track.duration }),
    })
    setTracks(prev => prev.map(t => t.id === track.id ? track : t))
  }

  const TABS = [
    { id: 'stats' as Tab, label: 'Статистика', icon: <FaChartBar size={11} /> },
    { id: 'users' as Tab, label: 'Пользователи', icon: <FaUsers size={11} /> },
    { id: 'tracks' as Tab, label: 'Треки', icon: <FaMusic size={11} /> },
  ]

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950">

      <div className="p-3 flex flex-col shrink-0">
        <Sidebar user={user} />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/5 dark:border-white/5 bg-white/60 dark:bg-zinc-950/40 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <MdAdminPanelSettings size={18} className="text-zinc-400" />
            <h1 className="text-[15px] font-medium text-zinc-900 dark:text-white">Панель модератора</h1>
            {user.isAdmin && <Badge label="Admin" color="red" />}
            {user.isMod && !user.isAdmin && <Badge label="Mod" color="purple" />}
          </div>

          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800/60 rounded-xl p-1 gap-0.5">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setSearch('') }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all
                  ${tab === t.id
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                  }`}
              >
                {t.icon}{t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-40 text-zinc-400 text-sm">Загрузка...</div>
          ) : (
            <>
              {tab === 'stats' && stats && <StatsTab stats={stats} />}
              {tab === 'users' && (
                <UsersTab
                  users={users}
                  currentUser={user as User}
                  search={search}
                  onSearch={setSearch}
                  onPatch={patchUser}
                  onDelete={deleteUser}
                  onBan={onBan}
                />
              )}
              {tab === 'tracks' && (
                <TracksTab
                  tracks={tracks}
                  search={search}
                  onSearch={setSearch}
                  onDelete={deleteTrack}
                  onSave={saveTrack}
                />
              )}
            </>
          )}
        </div>

      </div>
    </div>
  )
}