'use client'

import { CATEGORIES } from '@/lib/constants'
import { motion } from 'framer-motion'

interface FilterChipsProps {
  activeCat: string
  onChange: (cat: string) => void
}

export default function FilterChips({ activeCat, onChange }: FilterChipsProps) {
  return (
    <div className="flex justify-center w-full px-2">
      <div
        className="flex gap-2 px-2 py-2 overflow-x-auto hide-scrollbar bg-white/90 backdrop-blur-md border border-stone-200/50 shadow-[0_8px_32px_rgba(0,0,0,0.06)] rounded-full max-w-full"
      >
        {CATEGORIES.map(cat => {
          const active = activeCat === cat
          return (
            <button
              key={cat}
              onClick={() => onChange(cat)}
              className={`relative shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap select-none overflow-hidden ${
                active ? 'text-amber-800' : 'text-stone-500 hover:text-stone-700 hover:bg-stone-100/50'
              }`}
            >
              {active && (
                <motion.div 
                  layoutId="filter-chip-active"
                  className="absolute inset-0 bg-amber-200/60 mix-blend-multiply rounded-full z-0 border border-amber-300/50"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{cat}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
