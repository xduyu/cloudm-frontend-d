export function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`w-8 h-4 rounded-full transition-colors relative flex-shrink-0 ${value ? 'bg-emerald-500' : 'bg-zinc-200 dark:bg-zinc-700'}`}
    >
      <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all ${value ? 'left-[18px]' : 'left-0.5'}`} />
    </button>
  )
}