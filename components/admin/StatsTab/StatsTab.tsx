import React from 'react'
import { FaUsers, FaMusic, FaShieldAlt, FaStar, FaUserShield, FaMicrophone } from 'react-icons/fa'
import { StatCard } from '../ui/StatCard'

interface Stats {
  totalUsers: number
  totalTracks: number
  totalArtists: number
  totalAdmins: number
  totalMods: number
  totalPlays: number
  subscriptions: { free: number; premium: number; platinum: number }
}

export function StatsTab({ stats }: { stats: Stats }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard icon={<FaUsers size={15} />} label="Пользователи" value={stats.totalUsers} />
        <StatCard icon={<FaMusic size={15} />} label="Треки" value={stats.totalTracks} sub={`${stats.totalPlays} прослушиваний`} />
        <StatCard icon={<FaMicrophone size={15} />} label="Артисты" value={stats.totalArtists} />
        <StatCard icon={<FaShieldAlt size={15} />} label="Модераторы" value={stats.totalMods} />
        <StatCard icon={<FaUserShield size={15} />} label="Администраторы" value={stats.totalAdmins} />
        <StatCard
          icon={<FaStar size={15} />}
          label="Premium / Platinum"
          value={stats.subscriptions.premium + stats.subscriptions.platinum}
          sub={`free: ${stats.subscriptions.free}`}
        />
      </div>

      <div className="bg-white dark:bg-zinc-900/50 border border-black/8 dark:border-white/8 rounded-2xl p-5">
        <p className="text-[11px] uppercase tracking-wider text-zinc-400 mb-4">Подписки</p>
        {(['free', 'premium', 'platinum'] as const).map(s => {
          const count = stats.subscriptions[s]
          const pct = stats.totalUsers ? Math.round((count / stats.totalUsers) * 100) : 0
          return (
            <div key={s} className="mb-3 last:mb-0">
              <div className="flex justify-between text-[12px] mb-1">
                <span className="text-zinc-600 dark:text-zinc-300 capitalize">{s}</span>
                <span className="text-zinc-400 tabular-nums">{count} · {pct}%</span>
              </div>
              <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${s === 'free' ? 'bg-zinc-400' : s === 'premium' ? 'bg-blue-500' : 'bg-amber-500'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}