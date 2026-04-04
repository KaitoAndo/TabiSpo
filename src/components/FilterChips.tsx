'use client'

import { CATEGORIES } from '@/lib/constants'

interface FilterChipsProps {
  activeCat: string
  onChange: (cat: string) => void
}

export default function FilterChips({ activeCat, onChange }: FilterChipsProps) {
  return (
    <div
      className="flex gap-2 px-3 py-2 overflow-x-auto"
      style={{
        background: 'linear-gradient(135deg, rgba(28,16,6,0.95) 0%, rgba(60,34,12,0.90) 100%)',
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {CATEGORIES.map(cat => {
        const active = activeCat === cat
        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className="shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all duration-150 whitespace-nowrap select-none"
            style={{
              background:  active ? '#8b5e3c' : 'transparent',
              color:       active ? '#fff'     : '#c4a870',
              border:      `1px solid ${active ? '#8b5e3c' : 'rgba(196,168,112,0.3)'}`,
              boxShadow:   active ? '0 1px 6px rgba(139,94,60,0.5)' : 'none',
            }}
          >
            {cat}
          </button>
        )
      })}
    </div>
  )
}
