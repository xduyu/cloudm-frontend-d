import { FaTrash } from 'react-icons/fa'
import { Badge } from '../ui/Badge'
import { Toggle } from '../ui/Toggle'

interface User {
  username: string
  email: string
  isArtist: boolean
  isAdmin: boolean
  isMod: boolean
  isBanned: boolean
  SubScribtionType: string
  FavouriteTracks: string[]
  subscribedArtists: string[]
}

interface Props {
  users: User[]
  currentUser: User
  search: string
  onSearch: (v: string) => void
  onPatch: (username: string, updates: Partial<User>) => void
  onDelete: (username: string) => void
  onBan: (username: string, banned: boolean) => void
}

export function UsersTab({ users, currentUser, search, onSearch, onPatch, onDelete, onBan }: Props) {
  const filtered = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      {/* Search */}
      <div className="mb-4 relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          className="w-full max-w-xs bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-xl pl-8 pr-3 py-2 text-[13px] text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none focus:border-black/20 dark:focus:border-white/20"
          placeholder="Поиск по имени или email..."
          value={search}
          onChange={e => onSearch(e.target.value)}
        />
      </div>

      <div className="bg-white dark:bg-zinc-900/50 border border-black/8 dark:border-white/8 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-black/5 dark:border-white/5">
              {['Пользователь', 'Подписка', 'Роли', 'Флаги', 'Действия'].map(h => (
                <th key={h} className="text-left text-[10px] uppercase tracking-wider text-zinc-400 px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u, i) => (
              <tr key={u.username} className={`border-b border-black/3 dark:border-white/3 last:border-0 ${i % 2 === 0 ? '' : 'bg-zinc-50/50 dark:bg-zinc-800/20'}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="text-[13px] font-medium text-zinc-900 dark:text-white">{u.username}</p>
                      <p className="text-[11px] text-zinc-400">{u.email}</p>
                    </div>
                    {u.isBanned && <Badge label="Banned" color="red" />}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={u.SubScribtionType}
                    onChange={e => onPatch(u.username, { SubScribtionType: e.target.value })}
                    className="text-[12px] bg-zinc-100 dark:bg-zinc-800 border border-black/5 dark:border-white/5 rounded-lg px-2 py-1 text-zinc-700 dark:text-zinc-300 outline-none"
                  >
                    <option value="free">free</option>
                    <option value="premium">premium</option>
                    <option value="platinum">platinum</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {u.isAdmin && <Badge label="Admin" color="red" />}
                    {u.isMod && <Badge label="Mod" color="purple" />}
                    {u.isArtist && <Badge label="Artist" color="blue" />}
                    {!u.isAdmin && !u.isMod && !u.isArtist && <span className="text-[11px] text-zinc-400">—</span>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {currentUser.isAdmin && (
                    <div className="flex flex-col gap-1.5">
                      <label className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                        <Toggle value={u.isArtist} onChange={v => onPatch(u.username, { isArtist: v })} />
                        Artist
                      </label>
                      <label className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                        <Toggle value={u.isMod} onChange={v => onPatch(u.username, { isMod: v })} />
                        Mod
                      </label>
                      <label className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                        <Toggle value={u.isAdmin} onChange={v => onPatch(u.username, { isAdmin: v })} />
                        Admin
                      </label>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {/* Ban toggle — mods and admins, can't ban yourself */}
                    {u.username !== currentUser.username && !(u.isAdmin && !currentUser.isAdmin) && (
                      <button
                        onClick={() => onBan(u.username, !u.isBanned)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-all ${
                          u.isBanned
                            ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40'
                            : 'bg-zinc-100 dark:bg-zinc-800 border-black/5 dark:border-white/5 text-zinc-500 dark:text-zinc-400 hover:border-red-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30'
                        }`}
                      >
                        {u.isBanned ? 'Unban' : 'Ban'}
                      </button>
                    )}

                    {/* Delete — admin only */}
                    {currentUser.isAdmin && u.username !== currentUser.username && (
                      <button
                        onClick={() => onDelete(u.username)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                      >
                        <FaTrash size={11} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-zinc-400">Пользователи не найдены</div>
        )}
      </div>
    </div>
  )
}