import Image from 'next/image'
import type { Spot } from '@/types/spot'

const CATEGORY_EMOJI: Record<string, string> = {
  '観光': '⛩️',
  '飲食': '🍜',
  'スイーツ': '🍡',
  '体験': '🎭',
  'お土産': '🎁',
  '酒蔵': '🍶',
  '温泉・宿': '♨️',
}

interface SpotCardProps {
  spot: Spot
  onClick?: () => void
  selected?: boolean
}

export default function SpotCard({ spot, onClick, selected }: SpotCardProps) {
  return (
    <button
      onClick={onClick}
      className={[
        'flex gap-3 w-full p-3 text-left transition-colors',
        selected ? 'bg-amber-50' : 'hover:bg-gray-50',
      ].join(' ')}
    >
      {/* サムネイル */}
      <div className="shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
        {spot.image_url ? (
          <Image
            src={spot.image_url}
            alt={spot.name}
            width={64}
            height={64}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-3xl">{CATEGORY_EMOJI[spot.category] ?? '📍'}</span>
        )}
      </div>

      {/* テキスト */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 mb-0.5 flex-wrap">
          <span className="text-xs text-amber-600 font-medium">{spot.category}</span>
          {spot.plan === 'premium' && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
              PR
            </span>
          )}
          {spot.tag && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
              {spot.tag}
            </span>
          )}
        </div>
        <p className="font-bold text-sm text-gray-900 truncate">{spot.name}</p>
        <p className="text-xs text-gray-500 truncate">{spot.sub}</p>
        {spot.plan === 'premium' && spot.pr && (
          <p className="text-xs text-gray-600 mt-0.5 line-clamp-2 leading-relaxed">
            {spot.pr}
          </p>
        )}
      </div>
    </button>
  )
}
