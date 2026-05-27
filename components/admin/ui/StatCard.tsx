import React from 'react'

export function StatCard({ icon, label, value, sub }: {
  icon: React.ReactNode
  label: string
  value: number | string
  sub?: string
}) {
  return (
    <div className="bg-white dark:bg-zinc-900/50 border border-black/8 dark:border-white/8 rounded-2xl p-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-[11px] text-zinc-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-semibold text-zinc-900 dark:text-white tabular-nums">{value}</p>
        {sub && <p className="text-[11px] text-zinc-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}