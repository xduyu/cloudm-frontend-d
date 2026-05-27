import { useState } from 'react'
import { FaTrash, FaEdit, FaCheck, FaTimes } from 'react-icons/fa'
import { Badge } from '../ui/Badge'

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

interface Props {
  tracks: Track[]
  search: string
  onSearch: (v: string) => void
  onDelete: (id: string) => void
  onSave: (track: Track) => void
}

export function TracksTab({ tracks, search, onSearch, onDelete, onSave }: Props) {
  const [editingTrack, setEditingTrack] = useState<Track | null>(null)

  const filtered = tracks.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.artist.toLowerCase().includes(search.toLowerCase()) ||
    t.addedBy.toLowerCase().includes(search.toLowerCase())
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
          placeholder="Поиск по треку, артисту..."
          value={search}
          onChange={e => onSearch(e.target.value)}
        />
      </div>

      <div className="bg-white dark:bg-zinc-900/50 border border-black/8 dark:border-white/8 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-black/5 dark:border-white/5">
              {['Название', 'Артист', 'Альбом', 'Добавил', 'Длина', 'Действия'].map(h => (
                <th key={h} className="text-left text-[10px] uppercase tracking-wider text-zinc-400 px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((t, i) => (
              <tr key={t.id} className={`border-b border-black/3 dark:border-white/3 last:border-0 ${i % 2 === 0 ? '' : 'bg-zinc-50/50 dark:bg-zinc-800/20'}`}>
                {editingTrack?.id === t.id ? (
                  <>
                    <td className="px-4 py-2" colSpan={4}>
                      <div className="flex gap-2">
                        {(['title', 'artist', 'album', 'duration'] as const).map(field => (
                          <input
                            key={field}
                            value={editingTrack[field] ?? ''}
                            onChange={e => setEditingTrack({ ...editingTrack, [field]: e.target.value })}
                            placeholder={field}
                            className="flex-1 bg-zinc-100 dark:bg-zinc-800 border border-black/5 dark:border-white/10 rounded-lg px-2 py-1.5 text-[12px] text-zinc-900 dark:text-white outline-none min-w-0"
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-2" />
                    <td className="px-4 py-2">
                      <div className="flex gap-1">
                        <button
                          onClick={() => { onSave(editingTrack); setEditingTrack(null) }}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all"
                        >
                          <FaCheck size={11} />
                        </button>
                        <button
                          onClick={() => setEditingTrack(null)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                        >
                          <FaTimes size={11} />
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 text-[13px] font-medium text-zinc-900 dark:text-white max-w-[180px] truncate">{t.title}</td>
                    <td className="px-4 py-3 text-[12px] text-zinc-500 max-w-[120px] truncate">{t.artist}</td>
                    <td className="px-4 py-3 text-[12px] text-zinc-500 max-w-[120px] truncate">{t.album}</td>
                    <td className="px-4 py-3"><Badge label={t.addedBy} color="zinc" /></td>
                    <td className="px-4 py-3 text-[12px] text-zinc-400 tabular-nums">{t.duration ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => setEditingTrack(t)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all"
                        >
                          <FaEdit size={11} />
                        </button>
                        <button
                          onClick={() => onDelete(t.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                        >
                          <FaTrash size={11} />
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-zinc-400">Треки не найдены</div>
        )}
      </div>
    </div>
  )
}