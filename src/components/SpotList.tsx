'use client'

import type { Spot } from '@/types/spot'

const CAT_EMOJI: Record<string, string> = {
  '観光':    '⛩️',
  '飲食':    '🍜',
  'スイーツ':'🍡',
  '体験':    '🎭',
  'お土産':  '🎁',
  '酒蔵':    '🍶',
  '温泉・宿':'♨️',
}

interface SpotListProps {
  spots: Spot[]
  onSpotClick: (spot: Spot) => void
}

export default function SpotList({ spots, onSpotClick }: SpotListProps) {
  if (spots.length === 0) return null

  return (
    <div
      style={{
        background: 'linear-gradient(to top, rgba(28,16,6,0.82), rgba(28,16,6,0.0))',
        paddingTop: 32,
        paddingBottom: 16,
      }}
    >
      <div
        className="flex gap-3 overflow-x-auto px-3"
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        {spots.map(spot => (
          <button
            key={spot.id}
            onClick={() => onSpotClick(spot)}
            className="shrink-0 rounded-2xl overflow-hidden text-left active:scale-95 transition-transform duration-100"
            style={{
              width: 130,
              background: '#fff',
              boxShadow: '0 4px 16px rgba(0,0,0,0.22)',
              position: 'relative',
            }}
          >
            {/* 絵文字サムネイル */}
            <div
              className="flex items-center justify-center text-3xl"
              style={{ height: 72, background: 'rgba(240,232,216,0.6)' }}
            >
              {CAT_EMOJI[spot.category] ?? '📍'}
            </div>

            {/* テキスト */}
            <div className="px-2 py-2">
              <p
                className="text-xs font-semibold truncate leading-tight"
                style={{ color: '#3c220c' }}
              >
                {spot.name}
              </p>
              <p className="text-[10px] mt-0.5 truncate" style={{ color: '#8b6a4a' }}>
                {spot.category}
              </p>
            </div>

            {/* premium 金ドット */}
            {spot.plan === 'premium' && (
              <div
                style={{
                  position: 'absolute',
                  top: 6, right: 6,
                  width: 9, height: 9,
                  background: '#c4a870',
                  border: '1.5px solid #fff',
                  borderRadius: '50%',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
