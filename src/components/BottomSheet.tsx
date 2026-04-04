'use client'

import { useRef, useEffect, useState } from 'react'
import type { Spot } from '@/types/spot'

const CAT_COLOR: Record<string, string> = {
  '観光':    '#8b5e3c',
  '飲食':    '#c0392b',
  'スイーツ':'#c17bab',
  '体験':    '#2980b9',
  'お土産':  '#c17b4e',
  '酒蔵':    '#5a3e7a',
  '温泉・宿':'#27ae60',
}

interface BottomSheetProps {
  spot: Spot | null
  onClose: () => void
}

export default function BottomSheet({ spot, onClose }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)
  // スライドアニメーションのため「最後に表示したスポット」を保持
  const [displaySpot, setDisplaySpot] = useState<Spot | null>(null)

  useEffect(() => {
    if (spot) setDisplaySpot(spot)
  }, [spot])

  const open = !!spot
  const s = displaySpot

  return (
    <div
      ref={sheetRef}
      onClick={e => { if (e.target === sheetRef.current) onClose() }}
      style={{
        position:   'fixed',
        inset:      0,
        zIndex:     30,
        pointerEvents: open ? 'auto' : 'none',
      }}
    >
      <div
        style={{
          position:   'absolute',
          bottom:     0, left: 0, right: 0,
          maxHeight:  '68dvh',
          background: '#fff',
          borderRadius: '20px 20px 0 0',
          boxShadow:  '0 -4px 32px rgba(0,0,0,0.22)',
          overflowY:  'auto',
          transform:  open ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.32s cubic-bezier(0.32,0,0.08,1)',
          willChange: 'transform',
        }}
      >
        {s && (
          <>
            {/* ハンドル */}
            <div className="flex justify-center pt-3 pb-1">
              <div style={{ width: 40, height: 4, background: '#ddd', borderRadius: 2 }} />
            </div>

            {/* ヘッダー部 */}
            <div className="px-5 pt-2 pb-3">
              {/* カテゴリ + タグ */}
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    background: `${CAT_COLOR[s.category] ?? '#888'}22`,
                    color: CAT_COLOR[s.category] ?? '#888',
                  }}
                >
                  {s.category}
                </span>
                {s.plan === 'premium' && (
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: '#fef3c7', color: '#92400e' }}
                  >
                    PR
                  </span>
                )}
                {s.tag && (
                  <span
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                    style={{ background: '#dcfce7', color: '#166534' }}
                  >
                    {s.tag}
                  </span>
                )}
              </div>

              {/* スポット名 */}
              <h2 className="text-lg font-bold" style={{ color: '#1c1006' }}>
                {s.name}
              </h2>
              {s.sub && (
                <p className="text-sm mt-0.5" style={{ color: '#6b7280' }}>{s.sub}</p>
              )}

              {/* PR文 */}
              {s.pr && (
                <p className="text-sm mt-2 leading-relaxed" style={{ color: '#374151' }}>
                  {s.pr}
                </p>
              )}
            </div>

            {/* 区切り */}
            <div style={{ height: 1, background: '#f0e8d8', margin: '0 20px' }} />

            {/* 基本情報 */}
            <div className="px-5 py-3 space-y-2">
              {s.hours && <InfoRow icon="🕐" label="営業時間" value={s.hours} />}
              {s.closed && <InfoRow icon="🚫" label="定休日"   value={s.closed} />}
              {s.area   && <InfoRow icon="📍" label="エリア"   value={s.area} />}
            </div>

            {/* アクションボタン */}
            <div className="px-5 pb-8 pt-2 space-y-2">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-sm font-semibold transition-opacity active:opacity-70"
                style={{ background: '#1c1006', color: '#c4a870' }}
              >
                <span>🗺️</span> Google マップで経路を調べる
              </a>
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-2xl text-sm font-medium transition-colors"
                style={{ background: '#f5f0e8', color: '#6b7280' }}
              >
                閉じる
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function InfoRow({
  icon, label, value,
}: {
  icon: string; label: string; value: string
}) {
  return (
    <div className="flex gap-3 text-sm">
      <span className="text-base">{icon}</span>
      <span className="shrink-0 w-16 font-medium" style={{ color: '#374151' }}>{label}</span>
      <span style={{ color: '#4b5563' }}>{value}</span>
    </div>
  )
}
